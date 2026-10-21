'use client';

import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
} from 'react';

import { cn } from '@/lib/cn';
import type { TechCategory } from '@/lib/content/taxonomy';
import type { TechIcon } from '@/lib/content/types';
import { fibonacciGeoid } from '@/lib/tech-cloud/geoid';

import { CloudMark } from './cloud-mark';

export interface CloudTech {
  id: string;
  name: string;
  category: TechCategory;
  icon: TechIcon;
  brandColor?: string;
  url?: string;
  priority: 1 | 2 | 3;
}

interface GeoidSphereProps {
  technologies: CloudTech[];
  /** Active category filter; null = all. */
  activeCategory: TechCategory | null;
  paused: boolean;
  onSelect: (tech: CloudTech | null) => void;
  selectedId: string | null;
  className?: string;
}

interface ItemRuntime {
  tech: CloudTech;
  el: HTMLElement;
  sinPhi: number;
  cosPhi: number;
  theta: number;
  radiusMultiplier: number;
  rotationSpeed: number;
  floatOffset: number;
  floatSpeed: number;
  isHovered: boolean;
  speedMultiplier: number;
  lastTx: string;
  lastTy: string;
  lastScale: string;
  lastOpacity: string;
  lastZIndex: number;
  lastPointerEvents: string;
}

/**
 * DOM geoid: Fibonacci layout, latitude spin, yaw drag, per-icon hover slowdown.
 * Writes styles through refs — no React state per frame (D37 / §7).
 */
export function GeoidSphere({
  technologies,
  activeCategory,
  paused,
  onSelect,
  selectedId,
  className,
}: GeoidSphereProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<ItemRuntime[]>([]);
  const dragRef = useRef({
    active: false,
    previousX: 0,
    velocity: 0,
    pointerId: -1,
  });
  const pausedRef = useRef(paused);
  const categoryRef = useRef(activeCategory);
  const selectedRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    pausedRef.current = paused;
    categoryRef.current = activeCategory;
    selectedRef.current = selectedId;
    onSelectRef.current = onSelect;
  }, [paused, activeCategory, selectedId, onSelect]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const seeds = fibonacciGeoid(technologies.length);
    const nodes = Array.from(
      stage.querySelectorAll<HTMLElement>('[data-cloud-item]'),
    );
    const hoverAbort = new AbortController();
    itemsRef.current = technologies.map((tech, index) => {
      const seed = seeds[index]!;
      const el = nodes[index]!;
      const item: ItemRuntime = {
        tech,
        el,
        sinPhi: Math.sin(seed.phi),
        cosPhi: Math.cos(seed.phi),
        theta: seed.theta,
        radiusMultiplier: seed.radiusMultiplier,
        rotationSpeed: seed.rotationSpeed,
        floatOffset: seed.floatOffset,
        floatSpeed: seed.floatSpeed,
        isHovered: false,
        speedMultiplier: 1,
        lastTx: '',
        lastTy: '',
        lastScale: '',
        lastOpacity: '',
        lastZIndex: Number.NaN,
        lastPointerEvents: '',
      };
      el.addEventListener(
        'mouseenter',
        () => {
          item.isHovered = true;
        },
        { signal: hoverAbort.signal },
      );
      el.addEventListener(
        'mouseleave',
        () => {
          item.isHovered = false;
        },
        { signal: hoverAbort.signal },
      );
      return item;
    });

    let frame = 0;
    let inView = true;
    let visible = document.visibilityState === 'visible';
    let size = Math.min(stage.clientWidth, stage.clientHeight);
    let reduced =
      document.documentElement.dataset.motion === 'reduced' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = new ResizeObserver(() => {
      size = Math.min(stage.clientWidth, stage.clientHeight);
    });
    resize.observe(stage);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false;
      },
      { rootMargin: '300px' },
    );
    observer.observe(stage);

    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
    };
    const onMotion = () => {
      reduced =
        document.documentElement.dataset.motion === 'reduced' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };
    document.addEventListener('visibilitychange', onVisibility);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', onMotion);
    const motionAttr = new MutationObserver(onMotion);
    motionAttr.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-motion'],
    });

    let frameIndex = 0;
    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      if (!inView || !visible || size <= 0) return;

      const drag = dragRef.current;
      if (!drag.active) drag.velocity *= 0.95;

      const freeze = pausedRef.current || reduced;
      const category = categoryRef.current;
      const selected = selectedRef.current;
      const radiusScale = size * 0.4;
      const maxRadiusZ = radiusScale * 1.2;
      const depthSpan = 2 * maxRadiusZ;
      frameIndex += 1;
      const skipBack = frameIndex % 4 !== 0;

      for (const item of itemsRef.current) {
        const targetMultiplier = item.isHovered || freeze ? 0.05 : 1;
        item.speedMultiplier +=
          (targetMultiplier - item.speedMultiplier) * 0.08;

        if (!freeze) {
          item.theta +=
            item.rotationSpeed * item.speedMultiplier + drag.velocity;
        } else if (drag.active || Math.abs(drag.velocity) > 0.000_01) {
          item.theta += drag.velocity;
        }

        const r = radiusScale * item.radiusMultiplier;
        const x = r * item.sinPhi * Math.cos(item.theta);
        const z = r * item.sinPhi * Math.sin(item.theta);
        const interactive = z > 0;
        if (!interactive) {
          item.isHovered = false;
          if (item.lastPointerEvents !== 'none') {
            item.lastPointerEvents = 'none';
            item.el.style.pointerEvents = 'none';
          }
          if (skipBack) continue;
        }

        const floatY = freeze
          ? 0
          : Math.sin(time * item.floatSpeed + item.floatOffset) * 6;
        const y = r * item.cosPhi + floatY;
        const zNormalized = (z + maxRadiusZ) / depthSpan;
        const dimmed =
          category !== null && item.tech.category !== category ? 0.22 : 1;
        const selectedBoost = selected === item.tech.id ? 1.15 : 1;
        const tx = x.toFixed(1);
        const ty = y.toFixed(1);
        const scale = ((0.25 + zNormalized * 1.35) * selectedBoost).toFixed(3);
        if (
          item.lastTx !== tx ||
          item.lastTy !== ty ||
          item.lastScale !== scale
        ) {
          item.lastTx = tx;
          item.lastTy = ty;
          item.lastScale = scale;
          item.el.style.transform = `translate3d(-50%,-50%,0) translate3d(${tx}px,${ty}px,0) scale(${scale})`;
        }

        const opacity = ((0.15 + zNormalized * 0.85) * dimmed).toFixed(2);
        if (item.lastOpacity !== opacity) {
          item.lastOpacity = opacity;
          item.el.style.opacity = opacity;
        }

        const zIndex = Math.round(z);
        if (item.lastZIndex !== zIndex) {
          item.lastZIndex = zIndex;
          item.el.style.zIndex = String(zIndex);
        }

        const pointerEvents = interactive ? 'auto' : 'none';
        if (item.lastPointerEvents !== pointerEvents) {
          item.lastPointerEvents = pointerEvents;
          item.el.style.pointerEvents = pointerEvents;
        }
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      hoverAbort.abort();
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener('change', onMotion);
      motionAttr.disconnect();
      itemsRef.current = [];
    };
  }, [technologies]);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch') return;
    const drag = dragRef.current;
    drag.active = true;
    drag.previousX = event.clientX;
    drag.pointerId = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag.active || event.pointerId !== drag.pointerId) return;
    const deltaX = event.clientX - drag.previousX;
    drag.previousX = event.clientX;
    const width = stageRef.current?.clientWidth || window.innerWidth;
    drag.velocity = -(deltaX / width) * 2.5;
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (event.pointerId !== drag.pointerId) return;
    drag.active = false;
    drag.pointerId = -1;
  }

  // Touch: yaw only, keep vertical page scroll (touch-action: pan-y).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let tracking = false;
    let startX = 0;
    let startY = 0;
    let moved = false;
    let startTime = 0;

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0]!;
      tracking = true;
      moved = false;
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = performance.now();
      dragRef.current.previousX = touch.clientX;
    };
    const onMove = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return;
      const touch = event.touches[0]!;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (!moved && Math.hypot(dx, dy) > 6) moved = true;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 4) {
        event.preventDefault();
        const width = stage.clientWidth || window.innerWidth;
        dragRef.current.velocity =
          -((touch.clientX - dragRef.current.previousX) / width) * 2.5;
        dragRef.current.previousX = touch.clientX;
      }
    };
    const onEnd = (event: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const duration = performance.now() - startTime;
      if (!moved && duration < 250) {
        const target = (event.target as Element | null)?.closest(
          '[data-cloud-item]',
        );
        const id = target?.getAttribute('data-cloud-item');
        if (!id) {
          onSelectRef.current(null);
          return;
        }
        event.preventDefault();
        const tech = itemsRef.current.find((item) => item.tech.id === id)?.tech;
        if (!tech) return;
        onSelectRef.current(selectedRef.current === tech.id ? null : tech);
      }
    };
    stage.addEventListener('touchstart', onStart, { passive: true });
    stage.addEventListener('touchmove', onMove, { passive: false });
    stage.addEventListener('touchend', onEnd, { passive: false });
    stage.addEventListener('touchcancel', onEnd);
    return () => {
      stage.removeEventListener('touchstart', onStart);
      stage.removeEventListener('touchmove', onMove);
      stage.removeEventListener('touchend', onEnd);
      stage.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      role="presentation"
      aria-hidden="true"
      className={cn(
        'relative mx-auto aspect-square w-full max-w-[min(720px,100%)] cursor-grab touch-pan-y active:cursor-grabbing',
        '[mask-image:radial-gradient(ellipse_at_center,black_52%,transparent_100%)]',
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(event) => {
        const node = (event.target as Element | null)?.closest(
          '[data-cloud-item]',
        );
        const id = node?.getAttribute('data-cloud-item');
        if (!id) {
          onSelect(null);
          return;
        }
        const tech = technologies.find((item) => item.id === id);
        if (!tech) return;
        onSelect(selectedId === tech.id ? null : tech);
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgb(124_140_255/0.12),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[18%] rounded-full border border-line/40"
      />
      {technologies.map((tech) => (
        <div
          key={tech.id}
          data-cloud-item={tech.id}
          data-category={tech.category}
          className="group absolute top-1/2 left-1/2 flex cursor-pointer flex-col items-center justify-center"
        >
          <CloudMark
            icon={tech.icon}
            brandColor={tech.brandColor}
            className="transition-[opacity,transform] duration-300 group-hover:scale-125 group-hover:opacity-30 group-hover:blur-[1px]"
          />
          <span className="pointer-events-none absolute top-1/2 left-1/2 z-2 -translate-x-1/2 -translate-y-1/2 text-[0.85rem] font-bold whitespace-nowrap text-text-1 opacity-0 transition-opacity duration-300 text-shadow-[0_2px_8px_rgb(0_0_0),0_0_4px_rgb(0_0_0/0.8)] group-hover:opacity-100">
            {tech.name}
          </span>
        </div>
      ))}
    </div>
  );
}
