import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons.jsx';
import { money, fmtDate } from '../lib/format.js';
import { createOrder } from '../lib/storage.js';

export default function OrderDialog({ offer, result, open, onClose, onCreated }) {
  const dlgRef = useRef(null);
  const [done, setDone] = useState(null);
  const [form, setForm] = useState({ customer: '', phone: '', comment: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dlg = dlgRef.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  useEffect(() => {
    if (open) {
      setDone(null);
      setError('');
      setForm({ customer: '', phone: '', comment: '' });
    }
  }, [open, offer]);

  if (!offer || !result) return <dialog className="order-modal glass" ref={dlgRef} onClose={onClose} />;

  const req = result.request;
  const pct = Number(offer.discount_percent) || 0;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const order = createOrder({
        carrier: offer.carrier,
        carrier_label: offer.carrier_label,
        tariff: offer.tariff,
        tariff_label: offer.tariff_label,
        price: Math.round(offer.price),
        base_price: Math.round(offer.base_price),
        discount_percent: pct,
        days: offer.days,
        from_city: req.from_city,
        to_city: req.to_city,
        departure_date: req.departure_date || null,
        weight_kg: Number(req.weight_kg),
        places: Number(req.places) || 1,
        volume_m3: req.volume_m3,
        declared_price: Number(req.declared_price) || 0,
        pickup: !!req.pickup,
        delivery: !!req.delivery,
        customer: form.customer.trim(),
        phone: form.phone.trim(),
        comment: form.comment.trim(),
      });
      setDone(order);
      onCreated?.(order);
    } catch (err) {
      setError(err.message || 'Не удалось создать заявку');
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog className="order-modal glass" ref={dlgRef} id="order-modal" onClose={onClose}>
      <div className="om-head">
        <div>
          <div className="om-kicker">Заявка на перевозку</div>
          <h2 className="om-title">Подтвердите отправку</h2>
        </div>
        <button className="icon-btn om-close" type="button" onClick={onClose} aria-label="Закрыть">
          <Icon.close />
        </button>
      </div>

      <div className="om-body">
        <div className="om-summary">
          <div className="om-line"><span>Перевозчик</span><b>{offer.carrier_label}</b></div>
          <div className="om-line"><span>Тариф</span><b>{offer.tariff_label}</b></div>
          <div className="om-line"><span>Маршрут</span><b>{req.from_city} → {req.to_city}</b></div>
          <div className="om-line"><span>Срок</span><b>{offer.days_label || '—'}</b></div>
          {req.departure_date && <div className="om-line"><span>Отправка</span><b>{fmtDate(req.departure_date)}</b></div>}
          <div className="om-line total">
            <span>Итого{pct > 0 ? ` (скидка ${pct}%)` : ''}</span>
            <b>{money(offer.price)}</b>
          </div>
        </div>

        {done ? (
          <>
            <div className="om-result is-done">
              <div className="om-done">
                <div className="om-check"><Icon.check /></div>
                <div>
                  <div className="om-num">Заявка {done.number} создана</div>
                  <div className="om-sub">
                    {done.carrier_label} · {done.tariff_label} · {money(done.price)}.
                    Номер сохранён в истории — по нему можно уточнять статус перевозки.
                  </div>
                </div>
              </div>
            </div>
            <div className="om-actions">
              <button className="btn btn-glass btn-sm" type="button" onClick={onClose}>Закрыть</button>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => { onClose(); onCreated?.(done, 'history'); }}>
                Открыть историю
              </button>
            </div>
          </>
        ) : (
          <form className="om-form" onSubmit={submit}>
            <div className="row-2">
              <div className="field" style={{ margin: 0 }}>
                <label className="field-label" htmlFor="order-customer">Контактное лицо</label>
                <input type="text" id="order-customer" placeholder="Иван Петров" required
                       value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label className="field-label" htmlFor="order-phone">Телефон или e-mail</label>
                <input type="text" id="order-phone" placeholder="+7 999 000-00-00" required
                       value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="field" style={{ margin: '12px 0 0' }}>
              <label className="field-label" htmlFor="order-comment">Комментарий для перевозчика</label>
              <input type="text" id="order-comment" placeholder="Например: нужен созвон за час до прибытия"
                     value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            </div>
            {error && <div className="om-err"><Icon.alert /> {error}</div>}
            <button className="btn btn-primary btn-block" id="order-submit" type="submit"
                    style={{ marginTop: 16 }} disabled={busy}>
              {busy ? <><span className="loading-road" />Отправляем</> : <><Icon.send />Создать заявку</>}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
