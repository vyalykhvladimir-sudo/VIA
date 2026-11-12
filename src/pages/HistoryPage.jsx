import React, { useMemo, useState } from 'react';
import { Header, Footer, Background, ExportBar } from '../components/Layout.jsx';
import { Icon } from '../components/Icons.jsx';
import { money, num, fmtDateTime } from '../lib/format.js';
import {
  listComparisons, listOrders, buildStats, markChosen, setOrderStatus, seedDemo,
} from '../lib/storage.js';
import { compare, PRESETS } from '../lib/engine.js';
import { downloadFull, downloadOrders, downloadComparisons } from '../lib/reports.js';

const DAYS = [
  { value: 30, label: '30 дней' },
  { value: 90, label: '90 дней' },
  { value: 365, label: 'год' },
];

export default function HistoryPage({ onNavigate }) {
  const [days, setDays] = useState(30);
  const [tick, setTick] = useState(0); // принудительное обновление после действий

  const state = useMemo(() => {
    void tick;
    const history = listComparisons();
    const orders = listOrders();
    const stats = buildStats(days);
    const since = Date.now() - days * 86400 * 1000;
    return {
      history: history.filter((h) => new Date(h.created_at).getTime() >= since),
      orders: orders.filter((o) => new Date(o.created_at).getTime() >= since),
      stats,
    };
  }, [days, tick]);

  const { history, orders, stats } = state;
  const maxWins = Math.max(1, ...stats.by_carrier.map((c) => c.wins));

  return (
    <>
      <Background />
      <div className="shell">
        <Header page="history" onNavigate={onNavigate} />

        <div className="page-head">
          <div className="kicker"><span className="pulse" />Аналитика</div>
          <h1>История расчётов</h1>
          <p className="lede">
            За последние {stats.period_days} дней: сколько удалось сэкономить,
            кто чаще выигрывает и какие маршруты вы считаете чаще всего.
          </p>
          <div className="export-actions" style={{ marginTop: 14 }}>
            <button type="button" className="btn btn-glass btn-sm"
                    onClick={() => { seedDemo({ compare, presets: PRESETS }); setTick((t) => t + 1); }}>
              <Icon.layers />Загрузить примеры
            </button>
            {DAYS.map((d) => (
              <button key={d.value} type="button"
                      className={`btn btn-sm ${days === d.value ? 'btn-primary' : 'btn-glass'}`}
                      onClick={() => setDays(d.value)}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hist-grid">
          <div className="stats-row" style={{ margin: 0 }}>
            <div className="stat">
              <div className="s-cap">Расчётов</div>
              <div className="s-val">{stats.total_comparisons}</div>
              <div className="s-note">за {stats.period_days} дней</div>
            </div>
            <div className="stat">
              <div className="s-cap">Суммарная экономия</div>
              <div className="s-val">{money(Math.round(stats.total_saving))}</div>
              <div className="s-note">против худших предложений</div>
            </div>
            <div className="stat">
              <div className="s-cap">Средняя экономия</div>
              <div className="s-val">{money(Math.round(stats.avg_saving_per_route))}</div>
              <div className="s-note">на один маршрут</div>
            </div>
            <div className="stat">
              <div className="s-cap">Средняя лучшая цена</div>
              <div className="s-val">{money(Math.round(stats.avg_best_price))}</div>
              <div className="s-note">по всем расчётам</div>
            </div>
          </div>

          {stats.by_carrier.length > 0 && (
            <div className="glass" style={{ padding: 22 }}>
              <div className="panel-head">
                <h2>Кто чаще выигрывает</h2><div className="rule" />
                <span className="hint">{stats.marked_chosen} выбрано</span>
              </div>
              <div className="bars">
                {stats.by_carrier.map((c) => (
                  <div className="bar-item" key={c.carrier}>
                    <div className="bar-top">
                      <span className="bar-name">{c.carrier}</span>
                      <span className="bar-num">{c.wins} побед</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(c.wins / maxWins) * 100}%` }} />
                    </div>
                    <div className="bar-note">средняя лучшая цена — {money(Math.round(c.avg_price))}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.top_routes.length > 0 && (
            <div className="glass" style={{ padding: 22 }}>
              <div className="panel-head"><h2>Частые маршруты</h2><div className="rule" /></div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Маршрут</th><th className="r">Расчётов</th>
                      <th className="r">Средняя цена</th><th className="r">Средняя экономия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.top_routes.map((r) => (
                      <tr key={r.route}>
                        <td><span className="c-name">{r.route}</span></td>
                        <td className="r days-cell">{r.cnt}</td>
                        <td className="r price-cell"><span className="p-now" style={{ fontSize: 14 }}>{money(Math.round(r.avg_price))}</span></td>
                        <td className="r days-cell" style={{ color: 'var(--mint)' }}>{money(Math.round(r.avg_saving))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <ExportBar
            title="Выгрузка отчётов"
            subtitle="Excel-книги с готовыми колонками, фильтрами и суммами"
            actions={(
              <>
                <button className="btn btn-primary btn-sm" type="button"
                        onClick={() => downloadFull(history, orders, stats)}>
                  <Icon.download />Полный отчёт
                </button>
                <button className="btn btn-glass btn-sm" type="button" onClick={() => downloadOrders(orders)}>
                  <Icon.download />Только заявки
                </button>
                <button className="btn btn-glass btn-sm" type="button" onClick={() => downloadComparisons(history)}>
                  <Icon.download />Последние расчёты
                </button>
              </>
            )}
          />

          {/* заявки */}
          <div className="glass" style={{ padding: 22 }}>
            <div className="panel-head">
              <h2>Заявки на перевозку</h2><div className="rule" />
              <span className="hint">{orders.length} всего</span>
              <button className="btn btn-glass btn-xs" type="button" onClick={() => downloadOrders(orders)}>
                <Icon.download />Excel
              </button>
            </div>
            {orders.length > 0 ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Номер</th><th>Маршрут</th><th>Перевозчик</th>
                      <th className="r">Отправка</th><th className="r">Цена</th>
                      <th className="r">Срок</th><th>Статус</th><th />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <span className="c-name">{o.number}</span>
                          <div className="c-tariff">{fmtDateTime(o.created_at)}</div>
                        </td>
                        <td>{o.from_city} → {o.to_city}</td>
                        <td>
                          {o.carrier_label || '—'}
                          <div className="c-tariff">{o.tariff_label || ''}</div>
                        </td>
                        <td className="r days-cell">{o.departure_date || '—'}</td>
                        <td className="r price-cell"><span className="p-now" style={{ fontSize: 14 }}>{money(o.price)}</span></td>
                        <td className="r days-cell">{o.days ?? '—'}</td>
                        <td>
                          <span className={`tag ${o.status === 'new' ? 'tag-best' : o.status === 'done' ? 'tag-plain' : 'tag-fast'}`}>
                            {o.status === 'new' ? 'новая' : o.status === 'done' ? 'выполнена' : 'в работе'}
                          </span>
                        </td>
                        <td className="r">
                          <button className="btn btn-glass btn-xs" type="button"
                                  onClick={() => { setOrderStatus(o.id, o.status === 'new' ? 'progress' : 'done'); setTick((t) => t + 1); }}>
                            {o.status === 'new' ? 'В работу' : o.status === 'progress' ? 'Завершить' : '✓'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty" style={{ border: 0, background: 'transparent', padding: '26px 12px' }}>
                <p>Заявок пока нет. Выберите тариф в расчёте и нажмите «Заявка» — номер появится здесь.</p>
              </div>
            )}
          </div>

          {/* расчёты */}
          <div className="glass" style={{ padding: 22 }}>
            <div className="panel-head">
              <h2>Последние расчёты</h2><div className="rule" />
              <span className="hint">{history.length} записей</span>
              <button className="btn btn-glass btn-xs" type="button" onClick={() => downloadComparisons(history)}>
                <Icon.download />Excel
              </button>
            </div>
            {history.length > 0 ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Маршрут</th><th className="r">Вес</th><th>Лучший вариант</th>
                      <th className="r">Цена</th><th className="r">Срок</th>
                      <th className="r">Экономия</th><th />
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r) => (
                      <tr key={r.id} className={r.chosen ? 'is-best' : ''}>
                        <td>
                          <span className="c-name">{r.from_city} → {r.to_city}</span>
                          <div className="c-tariff">{fmtDateTime(r.created_at)} · {Math.round(r.distance_km || 0)} км</div>
                        </td>
                        <td className="r days-cell">{num(r.weight_kg)} кг</td>
                        <td>
                          <span className="c-name">{r.best_carrier || '—'}</span>
                          <div className="c-tariff">{r.best_tariff || ''}</div>
                        </td>
                        <td className="r price-cell"><span className="p-now" style={{ fontSize: 14 }}>{money(r.best_price)}</span></td>
                        <td className="r days-cell">{r.best_days ?? '—'}</td>
                        <td className="r days-cell" style={{ color: 'var(--mint)' }}>{money(r.savings)}</td>
                        <td>
                          {r.chosen
                            ? <span className="tag tag-best">выбран</span>
                            : (
                              <button className="btn btn-glass btn-xs" type="button"
                                      onClick={() => { markChosen(r.id, true); setTick((t) => t + 1); }}>
                                выбрать
                              </button>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty" style={{ border: 0, background: 'transparent', padding: '42px 20px' }}>
                <div className="glyph"><Icon.clock /></div>
                <h3>Пока пусто</h3>
                <p>Сделайте первый расчёт на странице «Подбор» — здесь появится статистика и экономия.</p>
                <button className="btn btn-primary btn-sm" type="button" onClick={() => onNavigate('calc')}>
                  <Icon.bolt />К расчёту
                </button>
              </div>
            )}
          </div>
        </div>

        <Footer note="История и аналитика" />
      </div>
    </>
  );
}
