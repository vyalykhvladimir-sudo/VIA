const nf0 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

/** 5755 → «5 755 ₽» */
export const money = (v) => (v == null || Number.isNaN(Number(v)) ? '—' : `${nf0.format(v)} ₽`);

/** 5755 → «5 755» */
export const num = (v) => (v == null || Number.isNaN(Number(v)) ? '—' : nf0.format(v));

/** «2026-11-18» → «18 нояб.» */
export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

/** ISO-время → «12.11.2026, 14:20» */
export function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export const todayIso = () => new Date().toISOString().slice(0, 10);
