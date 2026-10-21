'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { cn } from '@/lib/cn';
import { techCategories, type TechCategory } from '@/lib/content/taxonomy';
import type { Practice, Technology } from '@/lib/content/types';
import { useReducedMotionPreference } from '@/lib/motion-preference';

import { CloudErrorBoundary } from './cloud-error-boundary';
import type { CloudTech } from './geoid-sphere';
import { StackList } from './stack-list';

const GeoidSphere = dynamic(
  () => import('./geoid-sphere').then((module) => module.GeoidSphere),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="mx-auto aspect-square w-full max-w-[min(720px,100%)] rounded-full bg-surface-1/40"
      />
    ),
  },
);

type View = 'cloud' | 'list';

function toCloudTech(tech: Technology): CloudTech {
  return {
    id: tech.id,
    name: tech.name,
    category: tech.category,
    icon: tech.icon,
    brandColor: tech.brandColor,
    url: tech.url,
    priority: tech.priority,
  };
}

function useMobileCull(technologies: CloudTech[]) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setNarrow(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return useMemo(() => {
    if (!narrow) return technologies;
    return technologies.filter((tech) => tech.priority <= 2);
  }, [narrow, technologies]);
}

export function TechCloudShell({
  technologies,
  practices,
}: {
  technologies: Technology[];
  practices: Practice[];
}) {
  const t = useTranslations('stack');
  const reduced = useReducedMotionPreference();
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [override, setOverride] = useState<View | null>(null);
  const [category, setCategory] = useState<TechCategory | null>(null);
  const [selected, setSelected] = useState<CloudTech | null>(null);
  const [near, setNear] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const view: View = reduced || !isClient ? 'list' : (override ?? 'cloud');

  const cloudTechs = useMemo(
    () => technologies.map(toCloudTech),
    [technologies],
  );
  const visibleCloud = useMobileCull(cloudTechs);

  const categoryLabels = Object.fromEntries(
    techCategories.map((key) => [key, t(`categories.${key}`)]),
  ) as Record<TechCategory, string>;

  useEffect(() => {
    if (!selected) return;
    const timer = window.setTimeout(() => setSelected(null), 2500);
    return () => window.clearTimeout(timer);
  }, [selected]);

  const showCloud = view === 'cloud' && !reduced;

  useEffect(() => {
    if (!showCloud || near) return;
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: '300px' },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [showCloud, near]);

  const counts = useMemo(() => {
    const map = new Map<TechCategory, number>();
    for (const tech of visibleCloud) {
      map.set(tech.category, (map.get(tech.category) ?? 0) + 1);
    }
    return map;
  }, [visibleCloud]);

  const list = (
    <StackList
      technologies={technologies}
      practices={practices}
      categoryLabels={categoryLabels}
      practicesTitle={t('practicesTitle')}
    />
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label={t('viewLabel')}
          className="inline-flex rounded-full border border-line bg-surface-1/60 p-0.5"
        >
          {(
            [
              ['cloud', t('viewCloud')],
              ['list', t('viewList')],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              disabled={value === 'cloud' && reduced}
              onClick={() => setOverride(value)}
              className={cn(
                'min-h-11 rounded-full px-4 text-small transition-colors',
                view === value
                  ? 'bg-surface-2 text-text-1 shadow-[inset_0_0_0_1px_var(--color-line-strong)]'
                  : 'text-text-2 hover-fine:text-text-1',
                value === 'cloud' && reduced && 'cursor-not-allowed opacity-50',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {showCloud ? (
          <button
            type="button"
            className="text-small text-text-2 underline-offset-4 hover-fine:text-text-1 hover-fine:underline"
            onClick={() => setOverride('list')}
          >
            {t('switchToList')}
          </button>
        ) : null}
      </div>

      {showCloud ? (
        <>
          <div ref={hostRef}>
            {near ? (
              <CloudErrorBoundary
                fallback={list}
                onError={() => setOverride('list')}
              >
                <GeoidSphere
                  technologies={visibleCloud}
                  activeCategory={category}
                  paused={reduced}
                  selectedId={selected?.id ?? null}
                  onSelect={setSelected}
                />
              </CloudErrorBoundary>
            ) : (
              <div
                aria-hidden="true"
                className="mx-auto aspect-square w-full max-w-[min(720px,100%)] rounded-full bg-surface-1/40"
              />
            )}
          </div>

          <div
            aria-live="polite"
            className="min-h-11 text-center text-small text-text-2"
          >
            {selected ? (
              <p>
                <span className="text-text-1">{selected.name}</span>
                <span className="text-text-3">
                  {' '}
                  · {categoryLabels[selected.category]}
                </span>
                {selected.url ? (
                  <>
                    {' '}
                    <a
                      href={selected.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-2 underline-offset-4 hover-fine:underline"
                    >
                      {t('officialSite')}
                    </a>
                  </>
                ) : null}
              </p>
            ) : (
              <p>{t('cloudHint')}</p>
            )}
          </div>

          <ul
            aria-label={t('filterLabel')}
            className="flex flex-wrap justify-center gap-2"
          >
            {techCategories.map((key) => {
              const count = counts.get(key) ?? 0;
              if (count === 0) return null;
              const active = category === key;
              return (
                <li key={key}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(active ? null : key)}
                    className={cn(
                      'inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-small transition-colors',
                      active
                        ? 'border-accent-2/50 bg-accent-2/10 text-text-1'
                        : 'border-line text-text-2 hover-fine:border-line-strong hover-fine:text-text-1',
                    )}
                  >
                    {categoryLabels[key]}
                    <span className="text-text-3 tabular-nums">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        list
      )}
    </div>
  );
}
