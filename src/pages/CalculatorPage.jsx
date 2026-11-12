import React, { useCallback, useEffect, useRef, useState } from 'react';
import CalculatorForm, { defaultForm } from '../components/CalculatorForm.jsx';
import Results from '../components/Results.jsx';
import OrderDialog from '../components/OrderDialog.jsx';
import { Header, Footer, Background, ExportBar } from '../components/Layout.jsx';
import { Icon, StormRunner } from '../components/Icons.jsx';
import { compare, CARRIERS } from '../lib/engine.js';
import { saveComparison, markChosen, listOrders, buildStats } from '../lib/storage.js';
import { downloadFull, downloadOrders, downloadComparisons } from '../lib/reports.js';
import { listComparisons } from '../lib/storage.js';

/** Собирает запрос к движку из полей формы. */
function toRequest(form) {
  const n = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
  const L = n(form.length_m);
  const W = n(form.width_m);
  const H = n(form.height_m);
  const places = Number(form.places) || 1;
  return {
    from_city: String(form.from_city).trim(),
    to_city: String(form.to_city).trim(),
    weight_kg: Number(form.weight_kg) || 0,
    places,
    length_m: L,
    width_m: W,
    height_m: H,
    volume_m3: L && W && H ? Math.round(L * W * H * places * 1e4) / 1e4 : null,
    declared_price: Number(form.declared_price) || 0,
    discount_percent: Math.max(0, Math.min(100, Number(form.discount_percent) || 0)),
    pickup: !!form.pickup,
    delivery: !!form.delivery,
    max_days: n(form.max_days),
    departure_date: form.departure_date || null,
    w_price: Number(form.w_price),
    w_days: Number(form.w_days),
    w_reliability: Number(form.w_reliability),
  };
}

export default function CalculatorPage({ onNavigate }) {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderOffer, setOrderOffer] = useState(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const resultsRef = useRef(null);
  const formRef = useRef(null);

  const runCompare = useCallback((payload, opts = {}) => {
    setLoading(true);
    // небольшая пауза — чтобы был виден индикатор и не мигало на быстрых машинах
    setTimeout(() => {
      const res = compare(payload);
      setResult(res);
      setLoading(false);
      setSaved(false);
      if (res.offers.filter((o) => o.available).length) {
        saveComparison(res, payload);
      }
      if (!opts.quiet && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 320);
  }, []);

  // пересчёт при изменении скидки, если расчёт уже есть
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    if (!result) return;
    const payload = toRequest(form);
    const t = setTimeout(() => runCompare(payload, { quiet: true }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.discount_percent]);

  const submit = () => runCompare(toRequest(form));

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => document.getElementById('from_city')?.focus(), 420);
  };

  const choose = () => {
    if (!result) return;
    const best = result.best || result.cheapest;
    const history = listComparisons();
    const match = history.find((h) => h.created_at === result.created_at);
    if (match) markChosen(match.id, true);
    setSaved(true);
    if (best) {
      // запоминаем победителя в истории как выбранного
      markChosen(result.id, true);
    }
  };

  const handleCreated = (order, goHistory) => {
    if (goHistory === 'history') onNavigate('history');
  };

  const exportFromResult = () => {
    const history = listComparisons();
    const orders = listOrders();
    downloadFull(history, orders, buildStats(30));
  };

  const liveCount = Object.values(CARRIERS).length;

  return (
    <>
      <Background />
      <div className="shell">
        <Header page="calc" onNavigate={onNavigate} />

        {/* hero */}
        <section className="hero">
          <div className="hero-main glass">
            <div className="kicker"><span className="pulse" />Деловые Линии · Байкал Сервис</div>
            <h1 className="hero-title">Сравните тарифы.<br /><span className="accent">Выберите выгодное.</span></h1>
            <p className="hero-lede">
              Два перевозчика, все тарифы и <b>итоговая цена с вашей скидкой</b> —
              в одном расчёте. Без звонков, вкладок и таблиц в блокноте.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" type="button" onClick={scrollToForm}>
                <Icon.bolt />Рассчитать перевозку
              </button>
              <button className="btn btn-glass" type="button" onClick={() => onNavigate('history')}>
                <Icon.clock />История расчётов
              </button>
            </div>
          </div>

          <figure className="hero-visual glass" style={{ margin: 0, padding: 0 }}>
            <div className="hv-photo">
              <img src="/hero3.jpg" alt="Грузовик в пути" />
              <div className="road-fx" aria-hidden="true">
                <div className="road-line" />
                <StormRunner />
              </div>
            </div>

            <div className="hero-badge">
              <div>
                <div className="b-label">Режим данных</div>
                <div className="b-value">публичные тарифы<span> · {liveCount} перевозчика</span></div>
              </div>
              <button className="btn btn-glass btn-sm" type="button" onClick={scrollToForm} title="К форме расчёта">
                <Icon.arrow />К расчёту
              </button>
            </div>

            <div className="hero-facts">
              <div className="fact">
                <span className="fact-ico"><Icon.pin /></span>
                <span className="fact-label">География</span><span className="fact-value">51 город</span>
              </div>
              <div className="fact">
                <span className="fact-ico"><Icon.truck /></span>
                <span className="fact-label">Перевозчики</span><span className="fact-value">2 · 10 тарифов</span>
              </div>
              <div className="fact">
                <span className="fact-ico"><Icon.tag /></span>
                <span className="fact-label">Скидка</span><span className="fact-value">0–100%</span>
              </div>
            </div>
          </figure>
        </section>

        {/* рабочая зона */}
        <section className="workspace">
          <div ref={formRef}>
            <CalculatorForm value={form} onChange={setForm} onSubmit={submit} loading={loading} />
          </div>

          <div className="results" id="results-anchor" ref={resultsRef}>
            <div id="results">
              <Results
                result={result}
                onOrder={(o) => { setOrderOffer(o); setOrderOpen(true); }}
                onChoose={choose}
              />
            </div>

            {result && (
              <ExportBar
                title={saved ? 'Оптимум отмечен в истории' : 'Отчёты по вашим расчётам'}
                subtitle="Excel-книги с колонками, автофильтром и суммами"
                actions={(
                  <>
                    <button className="btn btn-primary btn-sm" type="button" onClick={exportFromResult}>
                      <Icon.download />Полный отчёт
                    </button>
                    <button className="btn btn-glass btn-sm" type="button"
                            onClick={() => downloadOrders(listOrders())}>
                      <Icon.download />Только заявки
                    </button>
                    <button className="btn btn-glass btn-sm" type="button"
                            onClick={() => downloadComparisons(listComparisons())}>
                      <Icon.download />Последние расчёты
                    </button>
                  </>
                )}
              />
            )}
          </div>
        </section>

        <Footer />
      </div>

      <OrderDialog
        offer={orderOffer}
        result={result}
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
