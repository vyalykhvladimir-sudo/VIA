import React from 'react';
import RouteScene from './RouteScene.jsx';
import AnimatedNumber from './AnimatedNumber.jsx';
import { Icon } from './Icons.jsx';
import { money, num, fmtDate } from '../lib/format.js';
import { downloadOffersXlsx, downloadOffersCsv } from '../lib/reports.js';

const ADVICE_RULES = [
  ['выбор', /оптимальн|самый дешёв/],
  ['скорость', /ускор|быстрее|экспресс/],
  ['скидка', /скидк/],
  ['груз', /объ[её]м|плотност|габарит|оплачиваем/],
  ['страхование', /страх/],
  ['услуги', /двер|забор|терминал/],
  ['срок', /срок|дедлайн|запас|дн\.|дней|дня/],
  ['цена', /₽\/кг|разброс|цене|цены|дешёв|дешев|переплат|эконом/],
  ['данные', /ключ|api|тарифы рассчитаны/i],
];

function adviceTag(text) {
  const t = text.toLowerCase();
  for (const [tag, re] of ADVICE_RULES) if (re.test(t)) return tag;
  return 'выбор';
}

function Stat({ icon, cap, value, note, count }) {
  return (
    <div className="stat">
      <div className="s-cap">{icon}{cap}</div>
      <div className="s-val">
        {count == null ? value : <><AnimatedNumber value={count} /> ₽</>}
      </div>
      <div className="s-note">{note}</div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="empty">
      <div className="glyph"><Icon.truck /></div>
      <h3>Готово к расчёту</h3>
      <p>
        Заполните маршрут и нажмите «Сравнить тарифы» — покажем итоговую цену
        с учётом скидки, срок доставки и оптимальный вариант по вашим приоритетам.
      </p>
      <div className="tiny">скидка применяется ко всем тарифам сразу</div>
    </div>
  );
}

export default function Results({ result, onOrder, onChoose }) {
  if (!result) return <EmptyState />;

  const all = result.offers || [];
  const offers = all.filter((o) => o.available);
  const req = result.request;
  const pct = Number(req.discount_percent) || 0;

  if (!offers.length) {
    return (
      <div className="glass" style={{ padding: 20 }}>
        <div className="empty" style={{ border: 0, background: 'transparent' }}>
          <div className="glyph"><Icon.alert /></div>
          <h3>Нет предложений</h3>
          <p>Проверьте названия городов — они должны быть из справочника.</p>
        </div>
        {result.errors && Object.keys(result.errors).length > 0 && (
          <div className="errors-card">
            <h3><Icon.alert /> Не удалось получить тариф</h3>
            {Object.entries(result.errors).map(([k, v]) => (
              <div className="err-line" key={k}><b>{k}</b> — {v}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const cheapest = offers.reduce((a, b) => (b.price < a.price ? b : a));
  const withDays = offers.filter((o) => o.days != null);
  const fastest = withDays.length
    ? withDays.reduce((a, b) => ((b.days ?? 999) < (a.days ?? 999) ? b : a))
    : offers[0];
  const best = offers.find((o) => o.is_best) || cheapest;
  const worst = offers.reduce((a, b) => (b.price > a.price ? b : a));
  const saving = worst.price - cheapest.price;
  const spread = Math.round((saving / cheapest.price) * 100);
  const sorted = offers.slice().sort((a, b) => (a.score ?? 9) - (b.score ?? 9));
  const maxPrice = Math.max(...offers.map((o) => o.price));

  return (
    <>
      {/* вердикт */}
      <div className="verdict glass">
        <div className="v-main">
          <div className="v-label"><Icon.check /> Оптимальный вариант</div>
          <div className="v-price">
            <span data-count={Math.round(best.price)}><AnimatedNumber value={Math.round(best.price)} /></span>
            <span className="cur">₽</span>
          </div>
          <div className="v-sub">
            <b>{best.carrier_label}</b> · {best.tariff_label} · {best.days_label || '—'}
            {pct > 0 && <span className="v-old">было {num(best.base_price)} ₽</span>}
          </div>
          <div className="v-pills">
            {pct > 0 && <span className="v-pill discount"><Icon.tag /> скидка {pct}%</span>}
            <span className="v-pill mint"><Icon.coins /> экономия {num(saving)} ₽</span>
          </div>
          <div className="v-under">
            {offers.length} вариантов · разброс {spread}% · {best.carrier_label}
          </div>
          {req.departure_date && <span className="v-pill ghost">отправка {fmtDate(req.departure_date)}</span>}
        </div>
        <div className="v-chart">
          <RouteScene best={best} request={req} distanceKm={result.distance_km} saving={saving} worstPrice={worst.price} />
        </div>
      </div>

      {/* ключевые цифры */}
      <div className="stats-row">
        <Stat icon={<Icon.tag />} cap="Дешевле всех" value={money(cheapest.price)}
              note={cheapest.carrier_label} count={Math.round(cheapest.price)} />
        <Stat icon={<Icon.clock />} cap="Быстрее всех" value={money(fastest.price)}
              note={`${fastest.carrier_label} · ${fastest.days_label || '—'}`} count={Math.round(fastest.price)} />
        <div className="stat">
          <div className="s-cap"><Icon.layers />Вариантов</div>
          <div className="s-val"><AnimatedNumber value={offers.length} /></div>
          <div className="s-note">из {all.length} тарифов</div>
        </div>
        <Stat icon={<Icon.coins />} cap="Экономия" value={money(saving)}
              note="против худшего тарифа" count={Math.round(saving)} />
      </div>

      {/* мета-строка */}
      <div className="meta">
        <span><b>{req.from_city} → {req.to_city}</b></span><span className="sep">/</span>
        <span>{num(Math.round(result.distance_km))} км</span><span className="sep">/</span>
        <span>{num(req.weight_kg)} кг</span><span className="sep">/</span>
        <span>{req.volume_m3 || '—'} м³</span>
        {req.departure_date && <><span className="sep">/</span><span className="m-dep">отправка {fmtDate(req.departure_date)}</span></>}
        {pct > 0 && <><span className="sep">/</span><span className="m-acc">скидка {pct}%</span></>}
        <span className="sep">/</span>
        <span className="m-amber">локальный расчёт</span>
      </div>

      {/* тулбар */}
      <div className="toolbar">
        <button className="btn btn-glass btn-sm" type="button" onClick={() => downloadOffersXlsx(result)}>
          <Icon.excel /> Excel
        </button>
        <button className="btn btn-glass btn-sm" type="button" onClick={() => downloadOffersCsv(result)}>
          <Icon.table /> CSV
        </button>
        <span className="grow" />
        <span className="stamp">{new Date(result.created_at).toLocaleTimeString('ru-RU')}</span>
      </div>

      {/* таблица тарифов */}
      <div className="table-glass glass">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Перевозчик</th><th className="r">Итоговая цена</th><th className="r">Срок</th>
                <th>Счёт</th><th>Метки</th><th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((o) => {
                const tags = [];
                if (o.is_best) tags.push(<span className="tag tag-best" key="b"><Icon.check />оптимум</span>);
                if (o.is_cheapest) tags.push(<span className="tag tag-cheap" key="c">дешевле всех</span>);
                if (o.is_fastest) tags.push(<span className="tag tag-fast" key="f">быстрее всех</span>);
                if (o.is_pareto && !o.is_best && !o.is_cheapest) tags.push(<span className="tag tag-plain" key="p">парето</span>);
                if (o.discount_percent > 0) tags.push(<span className="tag tag-disc" key="d">−{o.discount_percent}%</span>);
                const score = o.score == null ? 0 : o.score;
                return (
                  <tr key={o.tariff} className={o.is_best ? 'is-best' : ''}>
                    <td>
                      <div className="cell-carrier">
                        <div className="monogram">{o.carrier_short}</div>
                        <div>
                          <div className="c-name">{o.carrier_label}</div>
                          <div className="c-tariff">{o.tariff_label}</div>
                        </div>
                      </div>
                    </td>
                    <td className="r price-cell">
                      <div className="p-now">{money(o.price)}</div>
                      <div className="p-bar"><i style={{ '--w': `${Math.round((o.price / maxPrice) * 100)}%` }} /></div>
                      {o.discount_percent > 0 && (
                        <>
                          <div className="p-old">{money(o.base_price)}</div>
                          <div className="p-cut">−{money(o.discount_amount)}</div>
                        </>
                      )}
                    </td>
                    <td className="r days-cell">{o.days_label || '—'}</td>
                    <td>
                      <div className="score">
                        <div className="score-track">
                          <i className="score-fill" style={{ width: `${Math.max(5, Math.min(100, score * 100))}%` }} />
                        </div>
                        <span className="score-num">{score.toFixed(2)}</span>
                      </div>
                    </td>
                    <td>{tags}</td>
                    <td className="r">
                      <button className="btn btn-glass btn-xs" type="button" onClick={() => onOrder(o)}>Заявка</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* рекомендации */}
      {result.advice && result.advice.length > 0 && (
        <div className="glass advice-card">
          <div className="panel-head">
            <h2>Что учесть</h2><div className="rule" />
            <span className="hint">{result.advice.length} пунктов · правила</span>
          </div>
          <ol className="advice-list">
            {result.advice.map((tip, i) => (
              <li key={i} data-tag={adviceTag(tip)}><span className="adv-body">{tip}</span></li>
            ))}
          </ol>
        </div>
      )}

      {/* сохранить выбор */}
      <div className="row-2">
        <button className="btn btn-glass btn-sm" type="button" onClick={onChoose}>
          <Icon.check /> Отметить оптимум как выбранный
        </button>
      </div>
    </>
  );
}
