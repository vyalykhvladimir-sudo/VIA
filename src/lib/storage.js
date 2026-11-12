/* ==========================================================================
   Хранилище: расчёты и заявки в localStorage браузера.
   Никакого сервера — данные не уходят с устройства.
   ========================================================================== */

const KEY_HISTORY = 'via-history-v2';
const KEY_ORDERS = 'via-orders-v2';
const LIMIT = 500; // храним последние расчёты, чтобы не раздувать localStorage

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // приватный режим или переполнение — не роняем интерфейс
  }
}

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/* ------------------------------------------------------------- расчёты */
export function listComparisons() {
  return read(KEY_HISTORY);
}

export function saveComparison(result, request) {
  const history = read(KEY_HISTORY);
  const usable = result.offers.filter((o) => o.available);
  const best = result.best || usable[0];
  const worst = usable.slice().sort((a, b) => b.price - a.price)[0];

  const entry = {
    id: result.id || uid(),
    created_at: result.created_at || new Date().toISOString(),
    from_city: request.from_city,
    to_city: request.to_city,
    weight_kg: request.weight_kg,
    places: request.places || 1,
    volume_m3: request.volume_m3,
    distance_km: result.distance_km,
    offers_count: usable.length,
    best_carrier: best ? best.carrier_label : null,
    best_tariff: best ? best.tariff_label : null,
    best_price: best ? best.price : null,
    best_base_price: best ? best.base_price : null,
    best_days: best ? best.days : null,
    worst_price: worst ? worst.price : null,
    savings: worst && best ? Math.round(worst.price - best.price) : 0,
    discount_percent: Number(request.discount_percent) || 0,
    chosen: false,
  };
  const next = [entry, ...history.filter((h) => h.id !== entry.id)].slice(0, LIMIT);
  write(KEY_HISTORY, next);
  return entry;
}

export function markChosen(id, chosen = true) {
  const next = read(KEY_HISTORY).map((h) => (h.id === id ? { ...h, chosen } : h));
  write(KEY_HISTORY, next);
  return next;
}

/* -------------------------------------------------------------- заявки */
export function listOrders() {
  return read(KEY_ORDERS);
}

export function orderNumber(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const today = `${y}${m}${d}`;
  const sameDay = read(KEY_ORDERS).filter((o) => String(o.number || '').includes(`-${today}-`)).length;
  return `ВИА-${today}-${String(sameDay + 1).padStart(4, '0')}`;
}

export function createOrder(payload) {
  const orders = read(KEY_ORDERS);
  const order = {
    id: uid(),
    number: orderNumber(),
    status: 'new',
    created_at: new Date().toISOString(),
    ...payload,
  };
  write(KEY_ORDERS, [order, ...orders].slice(0, LIMIT));
  return order;
}

export function setOrderStatus(id, status) {
  const next = read(KEY_ORDERS).map((o) => (o.id === id ? { ...o, status } : o));
  write(KEY_ORDERS, next);
  return next;
}

/* ------------------------------------------------------------ аналитика */
export function buildStats(days = 30) {
  const since = Date.now() - days * 86400 * 1000;
  const history = read(KEY_HISTORY).filter((h) => new Date(h.created_at).getTime() >= since);
  const orders = read(KEY_ORDERS).filter((o) => new Date(o.created_at).getTime() >= since);

  const total = history.length;
  const totalSaving = history.reduce((s, h) => s + (h.savings || 0), 0);
  const bestPrices = history.map((h) => h.best_price).filter((p) => typeof p === 'number');

  const byCarrierMap = new Map();
  for (const h of history) {
    if (!h.best_carrier) continue;
    const cur = byCarrierMap.get(h.best_carrier) || { carrier: h.best_carrier, wins: 0, sum: 0, n: 0 };
    cur.wins += 1;
    cur.sum += h.best_price || 0;
    cur.n += 1;
    byCarrierMap.set(h.best_carrier, cur);
  }
  const byCarrier = [...byCarrierMap.values()]
    .map((c) => ({ carrier: c.carrier, wins: c.wins, avg_price: c.n ? c.sum / c.n : 0 }))
    .sort((a, b) => b.wins - a.wins);

  const routeMap = new Map();
  for (const h of history) {
    const key = `${h.from_city} → ${h.to_city}`;
    const cur = routeMap.get(key) || { route: key, cnt: 0, priceSum: 0, saveSum: 0 };
    cur.cnt += 1;
    cur.priceSum += h.best_price || 0;
    cur.saveSum += h.savings || 0;
    routeMap.set(key, cur);
  }
  const topRoutes = [...routeMap.values()]
    .map((r) => ({ route: r.route, cnt: r.cnt, avg_price: r.priceSum / r.cnt, avg_saving: r.saveSum / r.cnt }))
    .sort((a, b) => b.cnt - a.cnt || b.avg_saving - a.avg_saving)
    .slice(0, 8);

  return {
    period_days: days,
    total_comparisons: total,
    total_saving: totalSaving,
    avg_saving_per_route: total ? totalSaving / total : 0,
    avg_best_price: bestPrices.length ? bestPrices.reduce((a, b) => a + b, 0) / bestPrices.length : 0,
    marked_chosen: history.filter((h) => h.chosen).length,
    orders_count: orders.length,
    orders_total: orders.reduce((s, o) => s + (o.price || 0), 0),
    by_carrier: byCarrier,
    top_routes: topRoutes,
  };
}

export function clearAll() {
  write(KEY_HISTORY, []);
  write(KEY_ORDERS, []);
}

/* --------------------------------------------------------------------------
   Примеры для первого запуска: пустая история выглядит «мёртвой», поэтому
   по кнопке можно заполнить её демонстрационными расчётами и заявками.
   Данные помечаются sample: true, чтобы их было легко отличить и удалить.
   -------------------------------------------------------------------------- */
export function seedDemo(builders) {
  const { compare, presets } = builders;
  const orderList = [];
  const history = [];

  presets.forEach((p, i) => {
    const daysAgo = [2, 5, 9, 14, 21, 27][i % 6];
    const res = compare({
      ...p,
      weight_kg: [250, 480, 120, 900, 640, 320][i % 6],
      places: [3, 6, 2, 10, 8, 4][i % 6],
      length_m: 1.2, width_m: 0.8, height_m: 0.8,
      declared_price: [150000, 300000, 60000, 500000, 250000, 90000][i % 6],
      discount_percent: [12, 8, 0, 15, 5, 10][i % 6],
      w_price: 1, w_days: 0.3, w_reliability: 0.2,
    });
    const created = new Date(Date.now() - daysAgo * 86400000 - i * 3600000).toISOString();
    const usable = res.offers.filter((o) => o.available);
    const best = res.best || usable[0];
    const worst = usable.slice().sort((a, b) => b.price - a.price)[0];
    history.push({
      id: `sample-${i}`,
      created_at: created,
      from_city: p.from_city,
      to_city: p.to_city,
      weight_kg: res.request.weight_kg,
      places: res.request.places,
      volume_m3: res.request.volume_m3,
      distance_km: res.distance_km,
      offers_count: usable.length,
      best_carrier: best.carrier_label,
      best_tariff: best.tariff_label,
      best_price: best.price,
      best_base_price: best.base_price,
      best_days: best.days,
      worst_price: worst.price,
      savings: Math.round(worst.price - best.price),
      discount_percent: res.request.discount_percent,
      chosen: i % 3 === 0,
      sample: true,
    });
  });

  if (!read(KEY_ORDERS).length) {
    const today = new Date();
    const stamp = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const sample = history.slice(0, 2).map((h, i) => ({
      id: `sample-order-${i}`,
      number: `ВИА-${stamp}-${String(i + 1).padStart(4, '0')}`,
      status: i === 0 ? 'progress' : 'new',
      created_at: h.created_at,
      carrier: 'baikal',
      carrier_label: h.best_carrier,
      tariff: 'bk-eco',
      tariff_label: h.best_tariff,
      price: h.best_price,
      base_price: h.best_base_price,
      discount_percent: h.discount_percent,
      days: h.best_days,
      from_city: h.from_city,
      to_city: h.to_city,
      departure_date: null,
      weight_kg: h.weight_kg,
      places: h.places,
      volume_m3: h.volume_m3,
      declared_price: 0,
      pickup: false,
      delivery: false,
      customer: 'Пример заявки',
      phone: '+7 900 000-00-00',
      comment: '',
      sample: true,
    }));
    orderList.push(...sample);
    write(KEY_ORDERS, [...sample, ...read(KEY_ORDERS)]);
  }

  write(KEY_HISTORY, [...history, ...read(KEY_HISTORY)]);
  return { history: history.length, orders: orderList.length };
}
