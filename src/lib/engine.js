/* ==========================================================================
   Ядро ВИА: гео, тарифы перевозчиков, скоринг, рекомендации.
   Чистый JavaScript — работает и в браузере, и на сервере (api/compare.js).
   Никаких зависимостей, никакой сети: результат детерминирован для одного
   и того же запроса.
   ========================================================================== */

/* --------------------------------------------------------------- города */
export const CITIES = [
  { name: 'Москва', region: 'Москва', lat: 55.7558, lon: 37.6173 },
  { name: 'Санкт-Петербург', region: 'Ленинградская область', lat: 59.9386, lon: 30.3141 },
  { name: 'Новосибирск', region: 'Новосибирская область', lat: 55.0084, lon: 82.9357 },
  { name: 'Екатеринбург', region: 'Свердловская область', lat: 56.8389, lon: 60.6057 },
  { name: 'Казань', region: 'Татарстан', lat: 55.7963, lon: 49.1088 },
  { name: 'Нижний Новгород', region: 'Нижегородская область', lat: 56.3269, lon: 44.0059 },
  { name: 'Челябинск', region: 'Челябинская область', lat: 55.1644, lon: 61.4368 },
  { name: 'Омск', region: 'Омская область', lat: 54.9885, lon: 73.3242 },
  { name: 'Самара', region: 'Самарская область', lat: 53.1959, lon: 50.1002 },
  { name: 'Ростов-на-Дону', region: 'Ростовская область', lat: 47.2357, lon: 39.7015 },
  { name: 'Уфа', region: 'Башкортостан', lat: 54.7388, lon: 55.9721 },
  { name: 'Красноярск', region: 'Красноярский край', lat: 56.0153, lon: 92.8932 },
  { name: 'Воронеж', region: 'Воронежская область', lat: 51.6720, lon: 39.1843 },
  { name: 'Пермь', region: 'Пермский край', lat: 58.0105, lon: 56.2502 },
  { name: 'Волгоград', region: 'Волгоградская область', lat: 48.7080, lon: 44.5133 },
  { name: 'Краснодар', region: 'Краснодарский край', lat: 45.0355, lon: 38.9753 },
  { name: 'Саратов', region: 'Саратовская область', lat: 51.5336, lon: 46.0343 },
  { name: 'Тюмень', region: 'Тюменская область', lat: 57.1522, lon: 65.5272 },
  { name: 'Тольятти', region: 'Самарская область', lat: 53.5303, lon: 49.3461 },
  { name: 'Ижевск', region: 'Удмуртия', lat: 56.8527, lon: 53.2115 },
  { name: 'Барнаул', region: 'Алтайский край', lat: 53.3548, lon: 83.7698 },
  { name: 'Ульяновск', region: 'Ульяновская область', lat: 54.3142, lon: 48.4031 },
  { name: 'Иркутск', region: 'Иркутская область', lat: 52.2870, lon: 104.3050 },
  { name: 'Хабаровск', region: 'Хабаровский край', lat: 48.4827, lon: 135.0838 },
  { name: 'Ярославль', region: 'Ярославская область', lat: 57.6261, lon: 39.8845 },
  { name: 'Владивосток', region: 'Приморский край', lat: 43.1155, lon: 131.8855 },
  { name: 'Махачкала', region: 'Дагестан', lat: 42.9764, lon: 47.5024 },
  { name: 'Томск', region: 'Томская область', lat: 56.4846, lon: 84.9476 },
  { name: 'Оренбург', region: 'Оренбургская область', lat: 51.7682, lon: 55.0969 },
  { name: 'Кемерово', region: 'Кемеровская область', lat: 55.3547, lon: 86.0873 },
  { name: 'Новокузнецк', region: 'Кемеровская область', lat: 53.7557, lon: 87.1099 },
  { name: 'Рязань', region: 'Рязанская область', lat: 54.6269, lon: 39.6916 },
  { name: 'Астрахань', region: 'Астраханская область', lat: 46.3497, lon: 48.0408 },
  { name: 'Пенза', region: 'Пензенская область', lat: 53.2000, lon: 45.0046 },
  { name: 'Липецк', region: 'Липецкая область', lat: 52.6031, lon: 39.5708 },
  { name: 'Киров', region: 'Кировская область', lat: 58.6035, lon: 49.6680 },
  { name: 'Чебоксары', region: 'Чувашия', lat: 56.1463, lon: 47.2519 },
  { name: 'Тула', region: 'Тульская область', lat: 54.1961, lon: 37.6182 },
  { name: 'Калининград', region: 'Калининградская область', lat: 54.7104, lon: 20.4522 },
  { name: 'Брянск', region: 'Брянская область', lat: 53.2434, lon: 34.3639 },
  { name: 'Курск', region: 'Курская область', lat: 51.7304, lon: 36.1926 },
  { name: 'Иваново', region: 'Ивановская область', lat: 57.0004, lon: 40.9739 },
  { name: 'Магнитогорск', region: 'Челябинская область', lat: 53.4186, lon: 59.0472 },
  { name: 'Тверь', region: 'Тверская область', lat: 56.8587, lon: 35.9176 },
  { name: 'Ставрополь', region: 'Ставропольский край', lat: 45.0428, lon: 41.9734 },
  { name: 'Белгород', region: 'Белгородская область', lat: 50.5952, lon: 36.5873 },
  { name: 'Сургут', region: 'ХМАО', lat: 61.2540, lon: 73.3962 },
  { name: 'Владимир', region: 'Владимирская область', lat: 56.1290, lon: 40.4070 },
  { name: 'Архангельск', region: 'Архангельская область', lat: 64.5399, lon: 40.5181 },
  { name: 'Сочи', region: 'Краснодарский край', lat: 43.5855, lon: 39.7231 },
  { name: 'Смоленск', region: 'Смоленская область', lat: 54.7818, lon: 32.0401 },
  { name: 'Калуга', region: 'Калужская область', lat: 54.5138, lon: 36.2612 },
];

const ALIASES = {
  'питер': 'санкт-петербург',
  'спб': 'санкт-петербург',
  'санкт петербург': 'санкт-петербург',
  'петербург': 'санкт-петербург',
  'нн': 'нижний новгород',
  'нижний': 'нижний новгород',
  'екб': 'екатеринбург',
  'екатеринбург ': 'екатеринбург',
  'ростов': 'ростов-на-дону',
  'мск': 'москва',
  'нск': 'новосибирск',
  'крск': 'красноярск',
  'владик': 'владивосток',
};

const INDEX = {};
CITIES.forEach((c) => { INDEX[c.name.toLowerCase()] = c; });

export function findCity(name) {
  const key = String(name || '').trim().toLowerCase().replace(/ё/g, 'е');
  if (!key) return null;
  if (INDEX[key]) return INDEX[key];
  const alias = ALIASES[key];
  if (alias && INDEX[alias]) return INDEX[alias];
  // нечёткое совпадение: начало слова или вхождение
  let starts = null;
  let contains = null;
  for (const c of CITIES) {
    const k = c.name.toLowerCase().replace(/ё/g, 'е');
    if (k.startsWith(key)) { if (!starts) starts = c; }
    else if (k.includes(key)) { if (!contains) contains = c; }
  }
  return starts || contains;
}

/* ------------------------------------------------------------- геометрия */
const R_EARTH = 6371;
const rad = Math.PI / 180;

function haversine(a, b) {
  const p1 = a.lat * rad;
  const p2 = b.lat * rad;
  const dp = p2 - p1;
  const dl = (b.lon - a.lon) * rad;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.sqrt(h));
}

export function roadKm(a, b) {
  const straight = haversine(a, b);
  if (straight < 1) return 0;
  const k = straight > 1500 ? 1.18 : straight > 400 ? 1.14 : 1.1;
  return Math.round(straight * k * 10) / 10;
}

export function estimateDays(km) {
  if (km <= 0) return 0;
  return Math.max(1, Math.ceil(km / 500) + 1);
}

/* ------------------------------------------------------- тарифная сетка */
export const CARRIERS = {
  dellin: { code: 'dellin', label: 'Деловые Линии', short: 'ДЛ', tariffs: [
    { code: 'dl-eco', label: 'Эконом-сборный', baseKg: 11.0, minRub: 690, perKm: 0.86, dayFactor: 1.35 },
    { code: 'dl-std', label: 'Автоперевозка, сборный груз', baseKg: 14.0, minRub: 850, perKm: 1.05, dayFactor: 1.0 },
    { code: 'dl-fast', label: 'Ускоренный сборный', baseKg: 17.0, minRub: 1100, perKm: 1.28, dayFactor: 0.82 },
    { code: 'dl-exp', label: 'Экспресс-доставка', baseKg: 20.0, minRub: 1500, perKm: 1.55, dayFactor: 0.65 },
    { code: 'dl-dds', label: 'До двери получателя', baseKg: 15.5, minRub: 1250, perKm: 1.12, dayFactor: 1.05 },
  ] },
  baikal: { code: 'baikal', label: 'Байкал Сервис', short: 'БС', tariffs: [
    { code: 'bk-eco', label: 'Эконом (медленнее)', baseKg: 10.0, minRub: 640, perKm: 0.82, dayFactor: 1.2 },
    { code: 'bk-std', label: 'Сборный груз, стандарт', baseKg: 12.5, minRub: 780, perKm: 0.98, dayFactor: 1.1 },
    { code: 'bk-plus', label: 'Сборный+, приоритет', baseKg: 14.2, minRub: 940, perKm: 1.12, dayFactor: 0.95 },
    { code: 'bk-term', label: 'Межтерминальный', baseKg: 11.4, minRub: 700, perKm: 0.9, dayFactor: 1.28 },
    { code: 'bk-exp', label: 'Экспресс', baseKg: 16.5, minRub: 1180, perKm: 1.35, dayFactor: 0.7 },
  ] },
};

/* ------------------------------------------------------------- утилиты */
export function volumeOf(req) {
  if (req.volume_m3) return req.volume_m3;
  if (req.length_m && req.width_m && req.height_m) {
    return Math.round(req.length_m * req.width_m * req.height_m * (req.places || 1) * 1e4) / 1e4;
  }
  return Math.round((req.weight_kg / 250) * 1e4) / 1e4;
}

export function chargeableWeight(req) {
  return Math.max(req.weight_kg, volumeOf(req) * 250);
}

/* Детерминированный «джиттер» — FNV-1a: одинаковый запрос даёт одинаковая цену.
   (Math.random и hash-функции с плавающей точкой для этого не годятся.) */
export function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function jitter(key, spread = 0.06) {
  return 1 + (hashSeed(key) * 2 - 1) * spread;
}

export function daysLabel(days) {
  const d = days % 10;
  const h = days % 100;
  if (d === 1 && h !== 11) return `${days} день`;
  if (d >= 2 && d <= 4 && !(h >= 12 && h <= 14)) return `${days} дня`;
  return `${days} дней`;
}

/* ------------------------------------------------------------ цена */
function tariffPrice(t, km, req, key) {
  const chargeable = chargeableWeight(req);
  let value = Math.max(t.minRub, chargeable * t.baseKg) + t.perKm * km;
  if (req.pickup) value += 700 + 9 * Math.sqrt(chargeable);
  if (req.delivery) value += 700 + 9 * Math.sqrt(chargeable);
  if (req.declared_price) value += Math.max(120, req.declared_price * 0.0008);
  return Math.round((value * jitter(key)) / 10) * 10;
}

function buildOffers(req, km, baseDays) {
  const offers = [];
  for (const carrier of Object.values(CARRIERS)) {
    for (const t of carrier.tariffs) {
      const key = `${t.code}|${km.toFixed(1)}|${Number(req.weight_kg).toFixed(1)}`;
      const price = tariffPrice(t, km, req, key);
      const days = Math.max(1, Math.round(baseDays * t.dayFactor));
      offers.push({
        carrier: carrier.code,
        carrier_label: carrier.label,
        carrier_short: carrier.short,
        tariff: t.code,
        tariff_label: t.label,
        base_price: price,
        price,
        discount_percent: 0,
        discount_amount: 0,
        days,
        days_label: daysLabel(days),
        available: true,
        notes: [],
        source: 'local',
      });
    }
  }
  return offers;
}

/* --------------------------------------------------------- скидка */
export function applyDiscount(offers, pctRaw) {
  const pct = Math.max(0, Math.min(100, Number(pctRaw) || 0));
  for (const o of offers) {
    const base = o.base_price || o.price;
    o.base_price = Math.round(base * 100) / 100;
    o.discount_percent = pct;
    if (pct > 0) {
      o.discount_amount = Math.round(base * pct) / 100;
      o.price = Math.round(base - o.discount_amount);
    } else {
      o.discount_amount = 0;
      o.price = base;
    }
  }
  return offers;
}

/* ---------------------------------------------------------- скоринг */
function scoreOffers(offers, req) {
  const usable = offers.filter((o) => o.available && o.price > 0);
  if (!usable.length) return offers;

  const prices = usable.map((o) => o.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const daysList = usable.filter((o) => o.days != null).map((o) => o.days);
  const minDays = daysList.length ? Math.min(...daysList) : null;
  const maxDays = daysList.length ? Math.max(...daysList) : null;

  const wPrice = Number(req.w_price) || 0;
  const wDays = Number(req.w_days) || 0;
  const wRel = Number(req.w_reliability) || 0;
  let wSum = wPrice + wDays + wRel;
  if (wSum <= 0) wSum = 1;

  for (const o of usable) {
    const pricePen = maxPrice > minPrice ? (o.price - minPrice) / (maxPrice - minPrice) : 0;
    let daysPen = 0;
    if (o.days != null && minDays != null && maxDays && maxDays > minDays) {
      daysPen = (o.days - minDays) / (maxDays - minDays);
    }
    const relPen = o.carrier === 'dellin' ? 0 : 0.08;
    o.score = Math.round(((wPrice * pricePen + wDays * daysPen + wRel * relPen) / wSum) * 1e4) / 1e4;
  }

  const byPrice = usable.slice().sort((a, b) => a.price - b.price || (a.days || 999) - (b.days || 999));
  byPrice[0].is_cheapest = true;

  const withDays = usable.filter((o) => o.days != null);
  if (withDays.length) {
    withDays.slice().sort((a, b) => (a.days || 999) - (b.days || 999) || a.price - b.price)[0].is_fastest = true;
  }

  usable.slice().sort((a, b) => (a.score ?? 9) - (b.score ?? 9))[0].is_best = true;

  for (const o of usable) {
    let dominated = false;
    for (const other of usable) {
      if (other === o) continue;
      const cheaperEq = other.price <= o.price;
      const fasterEq = (other.days || 999) <= (o.days || 999);
      const strictly = other.price < o.price || (other.days || 999) < (o.days || 999);
      if (cheaperEq && fasterEq && strictly) { dominated = true; break; }
    }
    o.is_pareto = !dominated;
  }

  offers.sort((a, b) => {
    const an = a.available ? 0 : 1;
    const bn = b.available ? 0 : 1;
    if (an !== bn) return an - bn;
    const as = a.score ?? 9;
    const bs = b.score ?? 9;
    if (as !== bs) return as - bs;
    return a.price - b.price;
  });
  return offers;
}

/* ------------------------------------------------------ рекомендации */
export const BENCHMARK_RUB_PER_KG = 12.5;

const rub = (n) => `${Math.round(n).toLocaleString('ru-RU')} ₽`;

function rulesAdvice(res, req) {
  const tips = [];
  const offers = res.offers.filter((o) => o.available && o.price > 0);
  if (!offers.length) return tips;

  const best = res.best || offers[0];
  const { cheapest, fastest } = res;
  const pct = Number(req.discount_percent) || 0;
  const km = res.distance_km;
  const chargeable = chargeableWeight(req);
  const perKg = best.price / Math.max(1, chargeable);
  const benchmark = BENCHMARK_RUB_PER_KG * (1 + km / 2000);

  if (best === cheapest) {
    tips.push(`Самый дешёвый вариант он же оптимальный: ${best.carrier_label}, ${best.tariff_label} — ${rub(best.price)} за ${daysLabel(best.days)}. Переплачивать здесь не за что.`);
  } else {
    tips.push(`Оптимум по взвешенной оценке — ${best.carrier_label} (${best.tariff_label}): ${rub(best.price)}, ${daysLabel(best.days)}. Это на ${rub(best.price - cheapest.price)} дороже дешёвого варианта, но на ${cheapest.days - best.days} дн. быстрее.`);
  }

  tips.push(`Цена за килограмм: ${Math.round(perKg * 10) / 10} ₽/кг (по оплачиваемому весу ${Math.round(chargeable)} кг) при ориентире ${Math.round(benchmark * 10) / 10} ₽/кг на ${Math.round(km)} км — ${perKg <= benchmark ? 'ниже рыночного ориентира, хорошая сделка' : 'выше ориентира, есть смысл поторговаться'}.`);

  if (fastest && cheapest && fastest !== cheapest && fastest.days < cheapest.days) {
    const extra = fastest.price - cheapest.price;
    const days = cheapest.days - fastest.days;
    if (days > 0) {
      tips.push(`Ускорение на ${days} дн. стоит ${rub(extra)} (≈${rub(extra / days)} за день, +${Math.round((extra / cheapest.price) * 100)}% к цене). Берите, только если срыв срока дороже этой суммы.`);
    }
  }

  if (volumeOf(req) * 250 > req.weight_kg * 1.15) {
    const density = Math.round(req.weight_kg / Math.max(0.01, volumeOf(req)));
    tips.push(`Груз объёмный: плотность ${density} кг/м³ при норме 250. Перевозчик посчитает ${Math.round(volumeOf(req) * 250)} кг объёмного веса вместо ${Math.round(req.weight_kg)} фактических — цена вырастет. Вариант экономии: уплотнить упаковку или разложить места компактнее.`);
  }

  if (!req.pickup && !req.delivery) {
    tips.push('Сейчас расчёт «терминал → терминал». Забор и доставка до двери добавляют обычно 15–25% к тарифу — включите их в форме, если груз нужно везти по адресу.');
  }

  if (req.declared_price) {
    const ins = Math.max(120, req.declared_price * 0.0008);
    tips.push(`Страховая надбавка на груз ${rub(req.declared_price)} — примерно ${rub(ins)}. Проверьте, включена ли она в итог: у части тарифов она уже внутри, у части добавляется отдельной строкой.`);
  } else {
    tips.push('Объявленная ценность не указана: перевозчик ограничит ответственность по весу. Для дорогого груза укажите стоимость — страховка стоит около 0,08% от суммы.');
  }

  if (req.max_days && best.days != null) {
    const spare = req.max_days - best.days;
    if (spare === 0) {
      tips.push(`Оптимум проходит ровно по границе дедлайна (${best.days} из ${req.max_days} дн.). Любая задержка в пути нарушит срок — держите запас 1 день или посмотрите более быстрый тариф.`);
    } else {
      tips.push(`До дедлайна остаётся запас ${spare} дн. (${best.days} из ${req.max_days} дн.) — можно спокойно брать самый дешёвый вариант.`);
    }
  }

  const worst = offers.slice().sort((a, b) => b.price - a.price)[0];
  const spread = Math.round(((worst.price - cheapest.price) / cheapest.price) * 100);
  if (spread >= 10) {
    tips.push(`Разброс цен между перевозчиками — ${spread}% (${rub(cheapest.price)} против ${rub(worst.price)}). Разница существенная: выбирайте по цене, это ваши деньги.`);
  }

  if (pct > 0) {
    tips.push(`Скидка ${pct}% применена ко всем тарифам: по победителю это ${rub(best.discount_amount)} от базовой цены. Скидка не меняет рейтинг — она уменьшает все варианты пропорционально.`);
  } else {
    tips.push('Скидка не задана. Укажите согласованный процент в поле «Скидка» — итог пересчитается сразу, базовая цена останется видна в скобках.');
  }

  if (res.mode !== 'live') {
    tips.push('Тарифы рассчитаны по публичной сетке перевозчиков (ключи API не подключены). После подключения ключей в переменных окружения те же расчёты пойдут по контрактным ценам — интерфейс не меняется.');
  }

  return tips.slice(0, 9);
}

/* ---------------------------------------------------------- оркестра */
export function compare(input) {
  const req = { ...input };
  const from = findCity(req.from_city);
  const to = findCity(req.to_city);
  const errors = {};
  if (!from) errors.from_city = `Город отправки не найден в справочнике: «${req.from_city}»`;
  if (!to) errors.to_city = `Город доставки не найден в справочнике: «${req.to_city}»`;

  if (Object.keys(errors).length) {
    return {
      request: req, offers: [], errors, advice: [], advice_source: 'rules',
      distance_km: 0, distance_estimate_days: 0, mode: 'local',
      created_at: new Date().toISOString(),
    };
  }

  const km = roadKm(from, to);
  const baseDays = estimateDays(km);
  const offers = buildOffers(req, km, baseDays);

  if (req.max_days) {
    for (const o of offers) {
      if (o.days != null && o.days > req.max_days) {
        o.available = false;
        o.notes.push(`Срок ${o.days} дн. превышает лимит ${req.max_days} дн.`);
      }
    }
    const kept = offers.filter((o) => o.available);
    if (!kept.length) for (const o of offers) { o.available = true; o.notes = []; }
  }

  applyDiscount(offers, req.discount_percent);
  scoreOffers(offers, req);

  const usable = offers.filter((o) => o.available && o.price > 0);
  const res = {
    request: req,
    distance_km: km,
    distance_estimate_days: baseDays,
    offers,
    errors: {},
    advice: [],
    advice_source: 'rules',
    mode: 'local',
    created_at: new Date().toISOString(),
  };

  if (usable.length) {
    res.cheapest = usable.slice().sort((x, y) => x.price - y.price)[0];
    const withDays = usable.filter((o) => o.days != null);
    if (withDays.length) {
      res.fastest = withDays.slice().sort((x, y) => (x.days || 999) - (y.days || 999) || x.price - y.price)[0];
    }
    res.best = usable.find((o) => o.is_best) || res.cheapest;
    const worst = usable.slice().sort((x, y) => y.price - x.price)[0];
    res.worst = worst;
    res.savings_vs_worst = Math.round((worst.price - res.cheapest.price) * 100) / 100;
    if (req.discount_percent) {
      res.total_discount_amount = Math.round(usable.reduce((s, o) => s + o.discount_amount, 0) * 100) / 100;
    }
  }

  res.advice = rulesAdvice(res, req);
  return res;
}

export const PRESETS = [
  { from_city: 'Москва', to_city: 'Казань' },
  { from_city: 'Москва', to_city: 'Санкт-Петербург' },
  { from_city: 'Москва', to_city: 'Новосибирск' },
  { from_city: 'Екатеринбург', to_city: 'Красноярск' },
];
