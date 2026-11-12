import React, { useCallback, useEffect, useState } from 'react';
import CalculatorPage from './pages/CalculatorPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';

const routeFromHash = () => (window.location.hash.replace('#', '') === 'history' ? 'history' : 'calc');

export default function App() {
  const [page, setPage] = useState(routeFromHash);

  useEffect(() => {
    const onHash = () => {
      setPage(routeFromHash());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((next) => {
    window.location.hash = next === 'history' ? '#history' : '';
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return page === 'history'
    ? <HistoryPage onNavigate={navigate} />
    : <CalculatorPage onNavigate={navigate} />;
}
