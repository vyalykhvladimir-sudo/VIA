/* Иконки: инлайновые SVG, чтобы не тянуть библиотеки и не зависеть от сети. */
import React from 'react';

const S = ({ children, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
       strokeLinecap="round" strokeLinejoin="round" {...rest}>{children}</svg>
);

export const Icon = {
  bolt: (p) => <S strokeWidth="2" {...p}><path d="M13 2 4.5 13.5H11l-1 8.5 9-12h-6.5z" /></S>,
  check: (p) => <S strokeWidth="2.4" {...p}><path d="m4.5 12.5 5 5L19.5 7" /></S>,
  tag: (p) => <S {...p}><path d="M20.6 12.9 12.9 20.6a2 2 0 0 1-2.8 0l-6.7-6.7a2 2 0 0 1-.6-1.5l.2-6a2 2 0 0 1 1.9-1.9l6-.2a2 2 0 0 1 1.5.6l6.7 6.7a2 2 0 0 1 0 2.8z" /><circle cx="8.2" cy="8.2" r="1.4" /></S>,
  clock: (p) => <S {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></S>,
  layers: (p) => <S {...p}><path d="m12 3 9 5-9 5-9-5 9-5z" /><path d="m3 13 9 5 9-5" /></S>,
  coins: (p) => <S {...p}><ellipse cx="12" cy="6.5" rx="7" ry="3" /><path d="M5 6.5v11c0 1.7 3.1 3 7 3s7-1.3 7-3v-11" /><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" /></S>,
  alert: (p) => <S strokeWidth="2" {...p}><path d="M12 8.5v5" /><circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" /><path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0z" /></S>,
  excel: (p) => <S {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="m9.5 12.5 5 5M14.5 12.5l-5 5" /></S>,
  table: (p) => <S {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M3.5 9.5h17M9.5 9.5v10" /></S>,
  pin: (p) => <S {...p}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></S>,
  truck: (p) => <S {...p}><path d="M2.5 7h11v9h-11zM13.5 11h4l3 3v2.5h-7z" /><circle cx="6" cy="18.2" r="1.7" /><circle cx="17" cy="18.2" r="1.7" /></S>,
  download: (p) => <S {...p}><path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 20h16" /></S>,
  arrow: (p) => <S strokeWidth="2" {...p}><path d="M5 12h13M12 5l7 7-7 7" /></S>,
  swap: (p) => <S strokeWidth="2" {...p}><path d="M7 4v13M7 17l-3-3M7 17l3-3M17 20V7M17 7l-3 3M17 7l3 3" /></S>,
  expand: (p) => <S {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></S>,
  collapse: (p) => <S {...p}><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></S>,
  sun: (p) => <S strokeWidth="1.7" {...p}><circle cx="12" cy="12" r="4.1" /><path d="M12 2.8v2.1M12 19.1v2.1M4.8 4.8l1.5 1.5M17.7 17.7l1.5 1.5M2.8 12h2.1M19.1 12h2.1M4.8 19.2l1.5-1.5M17.7 6.3l1.5-1.5" /></S>,
  moon: (p) => <S strokeWidth="1.7" {...p}><path d="M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a6.9 6.9 0 0 0 11.1 11.1z" /></S>,
  close: (p) => <S strokeWidth="2" {...p}><path d="M6 6l12 12M18 6 6 18" /></S>,
  chevron: (p) => <S strokeWidth="2.2" {...p}><path d="m6 9 6 6 6-6" /></S>,
  calendar: (p) => <S {...p}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10.5h18" /></S>,
  send: (p) => <S strokeWidth="2" {...p}><path d="M4 12.5 20 4l-4.5 16-4-6.5z" /></S>,
  street: (p) => <S {...p}><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="5.5" r="2.5" /><path d="M8 18.5h6a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h7" /></S>,
};

export const Logo = () => (
  <svg className="logo-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="lgFace" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#7fd0ff" />
        <stop offset="0.45" stopColor="#3b7bff" />
        <stop offset="1" stopColor="#7b5cff" />
      </linearGradient>
      <linearGradient id="lgEdge" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.15" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0.5" />
      </linearGradient>
    </defs>
    <path className="lg-body" d="M24 3.2 44 14v20L24 44.8 4 34V14z" fill="url(#lgFace)" />
    <path className="lg-edge" d="M24 3.2 44 14v20L24 44.8 4 34V14z" stroke="url(#lgEdge)" strokeWidth="1.6" />
    <path className="lg-letter" d="M16.4 13.6h7.2c3.4 0 5.5 1.8 5.5 4.6 0 1.9-.9 3.2-2.5 3.9 2 .6 3.2 2.1 3.2 4.3 0 3.2-2.4 5.1-6.1 5.1h-7.3zm4 3.4v4h2.7c1.4 0 2.2-.7 2.2-2s-.8-2-2.2-2zm0 7v4.2h3c1.5 0 2.4-.8 2.4-2.1s-.9-2.1-2.4-2.1z" fill="#fff" />
  </svg>
);

/** Грозовик — молния-курьер с фарами. Используется в hero и в сцене маршрута. */
export const StormRunner = ({ className = 'storm-runner', idPrefix = 'sr' }) => (
  <svg className={className} viewBox="0 0 64 96" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${idPrefix}Body`} x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" />
        <stop offset="0.5" stopColor="#bfe4ff" />
        <stop offset="1" stopColor="#5c9bff" />
      </linearGradient>
      <radialGradient id={`${idPrefix}Glow`} cx="0.5" cy="0.5" r="0.5">
        <stop stopColor="#9cd4ff" stopOpacity="0.85" />
        <stop offset="1" stopColor="#3b7bff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx="32" cy="52" rx="30" ry="34" fill={`url(#${idPrefix}Glow)`} />
    <path d="M38 4 16 44h13L24 92 52 42H34z" fill={`url(#${idPrefix}Body)`}
          stroke="rgba(255,255,255,0.9)" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M24.5 40h11.5l-3 9H22z" fill="#0b1526" opacity="0.55" />
    <circle className="sr-eye" cx="25.6" cy="44.4" r="2.1" fill="#8ff0ff" />
    <circle className="sr-eye" cx="31.2" cy="44.4" r="2.1" fill="#8ff0ff" />
    <path className="sr-streak" d="M8 46h18" stroke="#8fd4ff" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
    <path className="sr-streak sr-streak-2" d="M4 60h20" stroke="#8fd4ff" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
  </svg>
);
