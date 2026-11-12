import React, { useEffect, useMemo, useState } from 'react';
import { CITIES, PRESETS } from '../lib/engine.js';
import { Icon } from './Icons.jsx';
import { todayIso } from '../lib/format.js';

const DELIVERY_MODES = [
  { value: 'terminal', label: 'Терминал → терминал', pickup: false, delivery: false },
  { value: 'pickup', label: 'Забор + терминал', pickup: true, delivery: false },
  { value: 'delivery', label: 'Терминал + доставка', pickup: false, delivery: true },
  { value: 'door', label: 'От двери до двери', pickup: true, delivery: true },
];

export default function CalculatorForm({ value, onChange, onSubmit, loading }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const [mode, setMode] = useState(() => {
    if (value.pickup && value.delivery) return 'door';
    if (value.pickup) return 'pickup';
    if (value.delivery) return 'delivery';
    return 'terminal';
  });

  const volume = useMemo(() => {
    const { length_m: L, width_m: W, height_m: H, places } = value;
    if (!L || !W || !H) return null;
    return Math.round(L * W * H * (Number(places) || 1) * 1e4) / 1e4;
  }, [value.length_m, value.width_m, value.height_m, value.places]);

  const progress = useMemo(() => {
    const filled = [value.from_city, value.to_city, value.weight_kg, value.places, value.declared_price]
      .filter((v) => v !== '' && v !== null && String(v) !== '0').length;
    const bonus = Number(value.discount_percent) > 0 ? 5 : 0;
    return Math.min(100, Math.round((filled / 5) * 95) + bonus);
  }, [value]);

  useEffect(() => {
    const pct = Math.max(0, Math.min(100, Number(value.discount_percent) || 0));
    const fill = document.getElementById('discount-fill');
    if (fill) fill.style.width = `${pct}%`;
  }, [value.discount_percent]);

  const discountPct = Math.max(0, Math.min(100, Number(value.discount_percent) || 0));

  const applyMode = (nextMode) => {
    setMode(nextMode);
    const cfg = DELIVERY_MODES.find((m) => m.value === nextMode) || DELIVERY_MODES[0];
    set({ pickup: cfg.pickup, delivery: cfg.delivery });
  };

  const swap = () => set({ from_city: value.to_city, to_city: value.from_city });

  return (
    <div className="panel panel-form glass">
      <div className="form-progress" title="Заполненность формы"><i style={{ width: `${progress}%` }} /></div>

      <form id="form-single" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="field">
          <label className="field-label" htmlFor="from_city">Откуда</label>
          <input type="text" id="from_city" list="city-list" value={value.from_city} required
                 placeholder="Город отправки" autoComplete="off"
                 onChange={(e) => set({ from_city: e.target.value })} />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="to_city">Куда</label>
          <div className="input-wrap">
            <input type="text" id="to_city" list="city-list" value={value.to_city} required
                   placeholder="Город доставки" autoComplete="off" style={{ paddingRight: 46 }}
                   onChange={(e) => set({ to_city: e.target.value })} />
            <button className="swap-btn" type="button" onClick={swap} title="Поменять города" aria-label="Поменять города">
              <Icon.swap />
            </button>
          </div>
        </div>

        <div className="quick-routes">
          {PRESETS.map((p) => (
            <button key={`${p.from_city}-${p.to_city}`} className="quick-route" type="button"
                    onClick={() => set({ from_city: p.from_city, to_city: p.to_city })}>
              {p.from_city.slice(0, 3)} → {p.to_city.slice(0, 4)}
            </button>
          ))}
        </div>

        <div className="row-2 field">
          <div>
            <label className="field-label" htmlFor="weight_kg">Вес, кг</label>
            <input type="number" id="weight_kg" value={value.weight_kg} min="1" step="1" required
                   onChange={(e) => set({ weight_kg: e.target.value })} />
          </div>
          <div>
            <label className="field-label" htmlFor="places">Мест, шт</label>
            <input type="number" id="places" value={value.places} min="1" step="1"
                   onChange={(e) => set({ places: e.target.value })} />
          </div>
        </div>

        <div className="row-3 field">
          <div>
            <label className="field-label" htmlFor="length_m">Длина, м</label>
            <input type="number" id="length_m" value={value.length_m} min="0" step="0.01"
                   onChange={(e) => set({ length_m: e.target.value })} />
          </div>
          <div>
            <label className="field-label" htmlFor="width_m">Ширина</label>
            <input type="number" id="width_m" value={value.width_m} min="0" step="0.01"
                   onChange={(e) => set({ width_m: e.target.value })} />
          </div>
          <div>
            <label className="field-label" htmlFor="height_m">Высота</label>
            <input type="number" id="height_m" value={value.height_m} min="0" step="0.01"
                   onChange={(e) => set({ height_m: e.target.value })} />
          </div>
        </div>

        <div className="row-2 field">
          <div>
            <label className="field-label" htmlFor="declared_price">Ценность, ₽</label>
            <input type="number" id="declared_price" value={value.declared_price} min="0" step="1000"
                   onChange={(e) => set({ declared_price: e.target.value })} />
          </div>
          <div>
            <label className="field-label" htmlFor="max_days">Срок, до дн.</label>
            <input type="number" id="max_days" value={value.max_days} min="1" step="1" placeholder="без лимита"
                   onChange={(e) => set({ max_days: e.target.value })} />
          </div>
        </div>

        <div className="row-2 field row-mode">
          <div>
            <label className="field-label" htmlFor="departure_date">
              <Icon.calendar className="lbl-ico" />
              Дата отправки
            </label>
            <input type="date" id="departure_date" value={value.departure_date}
                   onChange={(e) => set({ departure_date: e.target.value })} />
          </div>
          <div>
            <label className="field-label" htmlFor="delivery_mode">Формат доставки</label>
            <select id="delivery_mode" value={mode} onChange={(e) => applyMode(e.target.value)}>
              {DELIVERY_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>

        {/* скидка: только поле ввода, без ползунка */}
        <div className="discount-glass">
          <div className="discount-head">
            <span className="discount-title">
              <Icon.tag />
              Скидка на перевозку
            </span>
            <span className="field-label" style={{ margin: 0 }}>%</span>
          </div>
          <div className="discount-body">
            <div className="discount-input">
              <input type="number" id="discount_percent" value={value.discount_percent} min="0" max="100" step="0.5"
                     placeholder="0" aria-label="Скидка в процентах"
                     onChange={(e) => set({ discount_percent: e.target.value })} />
              <span className="pct">%</span>
            </div>
            <div className="discount-visual">
              <div className="dv-bar"><i id="discount-fill" /></div>
            </div>
          </div>
          <div className="discount-note">
            {discountPct > 0
              ? <>Цены показаны <b>со скидкой {discountPct}%</b>. Базовая стоимость видна для сравнения.</>
              : 'Без скидки. Впишите процент — итоговая стоимость пересчитается сразу.'}
          </div>
        </div>

        <details className="advanced">
          <summary>
            <Icon.chevron className="chev" />
            Приоритеты выбора
          </summary>
          <div style={{ paddingTop: 8 }}>
            {[
              { id: 'w_price', label: 'Важность цены', max: 2, step: 0.1 },
              { id: 'w_days', label: 'Важность срока', max: 2, step: 0.1 },
              { id: 'w_reliability', label: 'Важность надёжности', max: 2, step: 0.1 },
            ].map((s) => (
              <React.Fragment key={s.id}>
                <div className="slider-row">
                  <input type="range" id={s.id} min="0" max={s.max} step={s.step} value={value[s.id]}
                         style={{ '--fill': `${(Number(value[s.id]) / s.max) * 100}%` }}
                         onChange={(e) => set({ [s.id]: e.target.value })} />
                  <output>{Number(value[s.id]).toFixed(1)}</output>
                </div>
                <p className="slider-label">{s.label}</p>
              </React.Fragment>
            ))}
          </div>
        </details>

        <button className="btn btn-primary btn-block" type="submit" id="btn-single"
                style={{ marginTop: 12 }} disabled={loading}>
          {loading ? (
            <><span className="loading-road" />Считаем тарифы</>
          ) : (
            <><Icon.bolt />Сравнить тарифы</>
          )}
        </button>
      </form>

      <div className="form-card-road" aria-hidden="true"><i /></div>

      <datalist id="city-list">
        {CITIES.map((c) => <option key={c.name} value={c.name} />)}
      </datalist>
      <p className="form-footnote">
        Объём груза: <b>{volume ? `${volume} м³` : '—'}</b> · тарифы считаются локально, данные не покидают браузер
      </p>
    </div>
  );
}

export const defaultForm = () => ({
  from_city: 'Москва',
  to_city: 'Казань',
  weight_kg: '250',
  places: '3',
  length_m: '1.2',
  width_m: '0.8',
  height_m: '0.8',
  declared_price: '150000',
  discount_percent: '0',
  max_days: '',
  departure_date: '',
  pickup: false,
  delivery: false,
  w_price: '1',
  w_days: '0.3',
  w_reliability: '0.2',
  today: todayIso(),
});
