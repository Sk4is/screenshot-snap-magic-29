import { useEffect, useState } from 'react';

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isTouch, setIsTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const handler = () => setIsTouch(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return { isMobile, isTouch };
}
