'use client';

import { type ReactNode, useEffect, useRef } from 'react';

const SCROLL_THRESHOLD = 24;

/**
 * Fixed header that turns into frosted glass after 24px of scroll. The state
 * lives in a data attribute so scrolling never re-renders React.
 */
export function HeaderFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrolled = window.scrollY > SCROLL_THRESHOLD;
      if ((header.dataset.scrolled === 'true') !== scrolled) {
        header.dataset.scrolled = String(scrolled);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      ref={ref}
      data-scrolled="false"
      className="group/header fixed inset-x-0 top-0 z-(--z-header) border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-300 data-[scrolled=true]:border-line data-[scrolled=true]:glass"
    >
      {children}
    </header>
  );
}
