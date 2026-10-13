'use client';

import { type ComponentProps, type PointerEvent, useRef } from 'react';

import { cn } from '@/lib/cn';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';

/**
 * Surface card with a pointer-tracked spotlight border. The spotlight only
 * runs for fine pointers and writes CSS variables, never React state.
 */
export function Card({
  className,
  children,
  onPointerMove,
  ...props
}: ComponentProps<'div'>) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    const element = ref.current;
    if (!element || !window.matchMedia(FINE_POINTER).matches) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    element.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={cn(
        'card group/card relative isolate rounded-lg border border-line bg-surface-1 shadow-(--shadow-card-inset)',
        // Spotlight border: a radial gradient masked to the 1px border ring.
        'before:pointer-events-none before:absolute before:-inset-px before:-z-10 before:rounded-[inherit] before:opacity-0',
        'before:bg-[radial-gradient(320px_circle_at_var(--mx,50%)_var(--my,50%),rgb(139_124_255/0.55),rgb(76_201_240/0.25)_40%,transparent_70%)]',
        'before:p-px before:transition-opacity before:duration-300 before:[mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]',
        'hover-fine:before:opacity-100',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
