import React from 'react';
import { fmtDate } from '../lib/format.js';

/** Сцена маршрута: точка отправки → пунктир с грозовиком → точка прибытия + кольцо экономии. */
export default function RouteScene({ best, request, distanceKm, saving, worstPrice }) {
  const km = Math.round(distanceKm || 0);
  const base = Math.max(worstPrice || best.price + saving, 1);
  const pct = Math.max(1, Math.min(99, Math.round((saving / base) * 100)));
  const r = 24;
  const c = 2 * Math.PI * r;

  return (
    <div className="scene">
      <div className="scene-head">
        <span className="scene-kicker">маршрут оптимума</span>
        <span className="scene-carrier">{best.carrier_label} · {best.tariff_label}</span>
      </div>

      <div className="scene-row">
        <svg className="scene-svg" viewBox="0 0 300 96" fill="none" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="scRoad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#3b7bff" />
              <stop offset="1" stopColor="#3ed8ff" />
            </linearGradient>
          </defs>
          <line className="sc-road" x1="12" y1="52" x2="288" y2="52" />
          <circle className="sc-node" cx="12" cy="52" r="6" />
          <circle className="sc-node end" cx="288" cy="52" r="6" />
          <text className="sc-city" x="12" y="34">{request.from_city}</text>
          <text className="sc-city end" x="288" y="34">{request.to_city}</text>
          <g className="sc-runner">
            <path d="M7 0-2 15h5L2 31 13 14H8z" fill="url(#scRoad)" stroke="rgba(255,255,255,0.9)" strokeWidth="1" />
          </g>
          <text className="sc-meta" x="12" y="76">{km} км</text>
          <text className="sc-meta mid" x="150" y="80">{best.days_label || ''}</text>
          <text className="sc-meta end" x="288" y="76">{request.departure_date ? fmtDate(request.departure_date) : ''}</text>
          {[1, 2, 3].map((i) => {
            const x = 12 + (276 / 4) * i;
            return <line key={i} className="sc-tick" x1={x} y1="58" x2={x} y2="66" />;
          })}
        </svg>

        <div className="scene-ring">
          <svg viewBox="0 0 60 60">
            <circle className="ring-track" cx="30" cy="30" r={r} />
            <circle className="ring-fill" cx="30" cy="30" r={r} style={{ '--c': c.toFixed(1), '--p': pct }} />
          </svg>
          <div className="ring-label"><b>{pct}%</b><span>дешевле</span></div>
        </div>
      </div>
    </div>
  );
}
