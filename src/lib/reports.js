/* ==========================================================================
   Отчёты Excel: заявки, расчёты, полная книга со сводкой.
   Используется и в браузере (скачивание), и на сервере (api/export.js).
   ========================================================================== */

import { buildXlsx, downloadBytes } from './xlsx.js';

const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const dayOnly = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('ru-RU');
};

const money = (v) => (typeof v === 'number' ? v : 0);

/* ------------------------------------------------------------------ заявки */
export function ordersSheet(orders) {
  return {
    name: 'Заявки',
    columns: [20, 17, 18, 14, 26, 29, 13, 10, 10, 12, 12, 12, 9, 10, 22, 22],
    money: [11, 12, 13],
    rows: [
      ['Номер', 'Создана', 'Статус', 'Перевозчик', 'Тариф', 'Маршрут', 'Отправка',
        'Вес, кг', 'Мест', 'Объём, м³', 'Цена, ₽', 'Базовая, ₽', 'Скидка, %', 'Срок, дн.',
        'Контакт', 'Комментарий'],
      ...orders.map((o) => [
        o.number || '',
        fmtDate(o.created_at),
        o.status === 'new' ? 'новая' : (o.status || ''),
        o.carrier_label || '',
        o.tariff_label || '',
        `${o.from_city || ''} → ${o.to_city || ''}`,
        dayOnly(o.departure_date),
        money(o.weight_kg),
        money(o.places),
        money(o.volume_m3),
        money(o.price),
        money(o.base_price),
        money(o.discount_percent),
        o.days ?? '',
        o.customer || '',
        o.comment || '',
      ]),
    ],
  };
}

/* ----------------------------------------------------------------- расчёты */
export function comparisonsSheet(rows) {
  return {
    name: 'Расчёты',
    columns: [6, 17, 27, 10, 8, 19, 26, 12, 12, 9, 16, 11],
    money: [7, 8, 9, 10],
    rows: [
      ['№', 'Дата', 'Маршрут', 'Вес, кг', 'Мест', 'Лучший перевозчик', 'Лучший тариф',
        'Цена, ₽', 'Базовая, ₽', 'Срок, дн.', 'Экономия, ₽', 'Скидка, %'],
      ...rows.map((r, i) => [
        i + 1,
        fmtDate(r.created_at),
        `${r.from_city || ''} → ${r.to_city || ''}`,
        money(r.weight_kg),
        money(r.places),
        r.best_carrier || '',
        r.best_tariff || '',
        money(r.best_price),
        money(r.best_base_price),
        r.best_days ?? '',
        money(r.savings),
        money(r.discount_percent),
      ]),
    ],
  };
}

/* ------------------------------------------------------------------ сводка */
export function summarySheet(stats, orders, rows) {
  const last = rows.slice(0, 5).map((r, i) => [
    `${i + 1}. ${r.from_city} → ${r.to_city}`,
    r.best_carrier || '',
    money(r.best_price),
    r.best_days ?? '',
  ]);

  return {
    name: 'Сводка',
    columns: [40, 22, 16, 12],
    money: [],
    rows: [
      ['Показатель', 'Значение', '', ''],
      ['Период, дней', stats.period_days, '', ''],
      ['Расчётов за период', stats.total_comparisons, '', ''],
      ['Заявок за период', orders.length, '', ''],
      ['Сумма заявок, ₽', Math.round(orders.reduce((s, o) => s + (o.price || 0), 0)), '', ''],
      ['Суммарная экономия, ₽', Math.round(stats.total_saving), '', ''],
      ['Средняя экономия на маршрут, ₽', Math.round(stats.avg_saving_per_route), '', ''],
      ['Средняя лучшая цена, ₽', Math.round(stats.avg_best_price), '', ''],
      ['', '', '', ''],
      ['Последние расчёты', 'Перевозчик', 'Цена, ₽', 'Срок, дн.'],
      ...last,
    ],
  };
}

/* ------------------------------------------------------------- сборка книг */
export function buildFullWorkbook(history, orders, stats) {
  return buildXlsx([
    summarySheet(stats, orders, history),
    ordersSheet(orders),
    comparisonsSheet(history),
  ]);
}

export function buildOrdersWorkbook(orders) {
  return buildXlsx([ordersSheet(orders)]);
}

export function buildComparisonsWorkbook(history) {
  return buildXlsx([comparisonsSheet(history)]);
}

/* --------------------------------------------------------- для браузера */
export function downloadFull(history, orders, stats) {
  downloadBytes(buildFullWorkbook(history, orders, stats), 'ВИА_отчёт_полный.xlsx');
}

export function downloadOrders(orders) {
  downloadBytes(buildOrdersWorkbook(orders), 'ВИА_заявки.xlsx');
}

export function downloadComparisons(history) {
  downloadBytes(buildComparisonsWorkbook(history), 'ВИА_расчёты.xlsx');
}

/* ------------------------------------------------- один расчёт в Excel */
export function downloadOffersXlsx(result) {
  const usable = result.offers.filter((o) => o.available);
  const sheet = {
    name: 'Тарифы',
    columns: [18, 26, 14, 14, 12, 10, 10, 14],
    money: [4, 5, 7],
    rows: [
      ['Перевозчик', 'Тариф', 'Цена, ₽', 'Базовая, ₽', 'Скидка, %', 'Срок, дн.', 'Оценка', 'Метки'],
      ...usable
        .slice()
        .sort((a, b) => (a.score ?? 9) - (b.score ?? 9))
        .map((o) => [
          o.carrier_label,
          o.tariff_label,
          Math.round(o.price),
          Math.round(o.base_price),
          o.discount_percent || 0,
          o.days ?? '',
          o.score == null ? '' : Number(o.score.toFixed(2)),
          [o.is_best ? 'оптимум' : '', o.is_cheapest ? 'дешевле всех' : '', o.is_fastest ? 'быстрее всех' : '']
            .filter(Boolean).join(', '),
        ]),
    ],
  };
  const req = result.request;
  const info = {
    name: 'Запрос',
    columns: [26, 30],
    rows: [
      ['Параметр', 'Значение'],
      ['Маршрут', `${req.from_city} → ${req.to_city}`],
      ['Расстояние, км', Math.round(result.distance_km)],
      ['Вес, кг', req.weight_kg],
      ['Мест, шт', req.places || 1],
      ['Объём, м³', Number(req.volume_m3) || 0],
      ['Ценность груза, ₽', req.declared_price || 0],
      ['Скидка, %', req.discount_percent || 0],
      ['Дата отправки', req.departure_date || 'не указана'],
      ['Дата расчёта', fmtDate(result.created_at)],
    ],
  };
  downloadBytes(buildXlsx([sheet, info]), 'ВИА_тарифы.xlsx');

  { /* Предупреждение при нестандартной загрузке строк не требуется */ }
}

/* ------------------------------------------------------------ CSV (Excel) */
export function downloadOffersCsv(result) {
  const usable = result.offers.filter((o) => o.available);
  const head = ['Перевозчик', 'Тариф', 'Цена', 'Базовая цена', 'Скидка %', 'Срок дн.', 'Оптимум'];
  const lines = [head.join(';')];
  for (const o of usable) {
    lines.push([
      o.carrier_label, o.tariff_label, String(Math.round(o.price)), String(Math.round(o.base_price)),
      String(o.discount_percent || 0), String(o.days ?? ''), o.is_best ? 'да' : '',
    ].join(';'));
  }
  // BOM — чтобы Excel правильно открыл кириллицу
  const text = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ВИА_тарифы.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
