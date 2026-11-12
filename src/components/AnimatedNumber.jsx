import React, { useEffect, useRef, useState } from 'react';
import { num } from '../lib/format.js';

/** Плавный «набег» числа. Учитывает prefers-reduced-motion. */
export default function AnimatedNumber({ value, suffix = '', duration = 720 }) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = fromRef.current ?? 0;
    const target = Number(value) || 0;
    if (reduce || !Number.isFinite(target)) {
      setShown(target);
      fromRef.current = target;
      return undefined;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / duration);
      const eased = 1 - (1 - k) ** 3;
      setShown(Math.round(start + (target - start) * eased));
      if (k < 1) raf = requestAnimationFrame(step);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span data-count={value}>{num(shown)}{suffix}</span>;
}
