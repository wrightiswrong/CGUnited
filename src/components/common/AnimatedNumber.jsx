import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

/**
 * Counts smoothly from 0 (or previous value) to `value`, formatted as
 * currency by default. Used for score/savings reveals across the app.
 * Pass `decimals` for values that need fractional precision (e.g. the
 * Protection Score, which is deliberately shown to one decimal place so it
 * reads as a real, granular number rather than a rounded bucket).
 */
export default function AnimatedNumber({
  value,
  duration = 1.1,
  prefix = '$',
  decimals = 0,
  formatter,
  className = '',
  onComplete,
}) {
  const [display, setDisplay] = useState(formatValue(0));
  const prevValue = useRef(0);

  function formatValue(v) {
    const factor = 10 ** decimals;
    const rounded = Math.round(v * factor) / factor;
    if (formatter) return formatter(rounded);
    return `${rounded < 0 ? '-' : ''}${prefix}${Math.abs(rounded).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(formatValue(v)),
      onComplete: () => {
        prevValue.current = value;
        onComplete?.();
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={className}>{display}</span>;
}
