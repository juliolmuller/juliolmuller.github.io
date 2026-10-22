'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import { useReducedMotionPreference } from '@/lib/motion-preference';

const CADENCE_MS = 2600;

/**
 * Visual-only rotating word (the sentence is announced once through
 * sr-only text next to it). Every word is laid out in the same grid cell,
 * so the line keeps the width of the longest word and never shifts.
 * Gradient is per-word so clipped siblings do not paint into one clip.
 */
export function RotatingWords({
  words,
  className,
}: {
  words: readonly string[];
  className?: string;
}) {
  const reduced = useReducedMotionPreference();
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (reduced || words.length < 2 || !element) return;
    let timer: number | undefined;
    let visible = true;

    const tick = () => {
      if (visible && document.visibilityState === 'visible') {
        setIndex((current) => (current + 1) % words.length);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
    });
    observer.observe(element);
    timer = window.setInterval(tick, CADENCE_MS);
    return () => {
      window.clearInterval(timer);
      timer = undefined;
      observer.disconnect();
    };
  }, [reduced, words.length]);

  const current = reduced ? 0 : index;

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        'inline-grid h-[1.2em] overflow-hidden align-bottom',
        className,
      )}
    >
      {words.map((word, wordIndex) => {
        const offset = wordIndex - current;
        return (
          <span
            key={word}
            className={cn(
              'col-start-1 row-start-1 text-gradient whitespace-nowrap transition-[transform,opacity] duration-500 ease-out-expo',
              offset === 0
                ? 'translate-y-0 opacity-100'
                : offset < 0
                  ? '-translate-y-full opacity-0'
                  : 'translate-y-full opacity-0',
            )}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}
