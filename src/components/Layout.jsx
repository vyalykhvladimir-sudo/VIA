import React, { useEffect, useState } from 'react';
import { Icon, Logo } from './Icons.jsx';

export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('via-theme', theme); } catch { /* приватный режим */ }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))];
}

export function useFullscreen() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const onChange = () => {
      const isActive = !!document.fullscreenElement;
      setActive(isActive);
      document.body.classList.toggle('is-fullscreen', isActive);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  const toggle = () => {
    const root = document.documentElement;
    if (!document.fullscreenElement) {
      const req = root.requestFullscreen || root.webkitRequestFullscreen;
      if (req) req.call(root).catch(() => {});
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document);
    }
  };
  return [active, toggle];
}

export function Background() {
  return (
    <>
      <div className="aurora"><span className="a1" /><span className="a2" /><span className="a3" /></div>
      <div className="grid-fx" />
      <div className="orb o1" /><div className="orb o2" /><div className="orb o3" />
    </>
  );
}

export function Header({ page, onNavigate }) {
  const [, toggleTheme] = useTheme();
  const [fsActive, toggleFs] = useFullscreen();

  return (
    <header className="header">
      <a className="logo" href="#" onClick={(e) => { e.preventDefault(); onNavigate('calc'); }} aria-label="ВИА — на главную">
        <Logo />
        <div className="logo-text">
          <div className="name">ВИА</div>
          <div className="tag">cargo intelligence</div>
        </div>
      </a>

      <nav className="nav">
        <a className={`nav-link${page === 'calc' ? ' is-active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onNavigate('calc'); }}>Подбор</a>
        <a className={`nav-link${page === 'history' ? ' is-active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onNavigate('history'); }}>История</a>
        <div className="status-row">
          <span className="status-chip"><span className="dot" />Деловые Линии</span>
          <span className="status-chip"><span className="dot" />Байкал Сервис</span>
        </div>
        <button className="icon-btn" type="button" onClick={toggleFs}
                title={fsActive ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
                aria-label="Полноэкранный режим">
          {fsActive ? <Icon.collapse className="i-collapse" /> : <Icon.expand className="i-expand" />}
        </button>
        <button className="icon-btn" type="button" onClick={toggleTheme} title="Сменить тему" aria-label="Сменить тему">
          <Icon.sun className="i-sun" />
          <Icon.moon className="i-moon" />
        </button>
      </nav>
    </header>
  );
}

export function Footer({ note = 'Подбор грузоперевозок' }) {
  return (
    <footer className="footer">
      <span className="brand">ВИА</span>
      <span>{note}</span>
      <span className="grow" />
      <span className="copyright">Этот ресурс собственность <b>Vladimir_Creator</b></span>
    </footer>
  );
}

/** Блок «Выгрузка отчётов» — используется в истории и в расчёте. */
export function ExportBar({ title, subtitle, actions }) {
  return (
    <div className="glass export-bar">
      <div className="export-head">
        <div>
          <div className="export-title">{title}</div>
          <div className="export-sub">{subtitle}</div>
        </div>
      </div>
      <div className="export-actions">{actions}</div>
    </div>
  );
}
