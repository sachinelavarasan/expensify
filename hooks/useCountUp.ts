import { useEffect, useRef, useState } from 'react';

const DEFAULT_DURATION = 900;

// easeInOutQuad: gentle ramp up and down, no abrupt start or snap at the end.
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function useCountUp(target: number, duration = DEFAULT_DURATION) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = Date.now();
    let frame: ReturnType<typeof requestAnimationFrame>;

    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = easeInOutQuad(progress);
      const next = from + (target - from) * eased;
      setValue(next);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
