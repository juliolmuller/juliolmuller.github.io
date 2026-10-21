import { getTranslations } from 'next-intl/server';

import { CountUp } from '@/components/motion/count-up';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeader } from '@/components/ui/section-header';
import { type AppLocale, localeTags } from '@/i18n/routing';
import type { Metric, Profile } from '@/lib/content';

const MAX_METRICS = 4;

function MetricValue({
  metric,
  locale,
}: {
  metric: Metric;
  locale: AppLocale;
}) {
  if (metric.countTo === undefined) return metric.value;
  return (
    <CountUp
      to={metric.countTo}
      prefix={metric.prefix}
      suffix={metric.suffix}
      localeTag={localeTags[locale]}
    />
  );
}

/** Facts + metrics snapshot. Bio stays in About (D46). */
export async function Summary({
  locale,
  profile,
}: {
  locale: AppLocale;
  profile: Profile;
}) {
  const t = await getTranslations('summary');
  const metrics = profile.metrics.slice(0, MAX_METRICS);

  return (
    <section id="summary" aria-labelledby="summary-title" className="section-y">
      <div className="container-page">
        <SectionHeader
          id="summary-title"
          index={1}
          eyebrow={t('eyebrow')}
          title={t('title')}
        />
        <div
          className={
            metrics.length > 0
              ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10'
              : undefined
          }
        >
          <Reveal>
            <div className="card h-full rounded-lg border border-line bg-surface-1 p-6 shadow-(--shadow-card-inset)">
              <h3 className="font-label text-text-3">{t('factsTitle')}</h3>
              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="text-small text-text-3">{t('location')}</dt>
                  <dd className="mt-1 text-text-1">{profile.location}</dd>
                </div>
                <div>
                  <dt className="text-small text-text-3">{t('languages')}</dt>
                  <dd className="mt-1 text-text-1">
                    <ul>
                      {profile.spokenLanguages.map((language) => (
                        <li key={language}>{language}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-small text-text-3">{t('focus')}</dt>
                  <dd className="mt-1 text-text-1">{profile.focus}</dd>
                </div>
              </dl>
            </div>
          </Reveal>

          {metrics.length > 0 ? (
            <Reveal index={1}>
              <ul
                aria-label={t('metricsLabel')}
                className="grid h-full grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line"
              >
                {metrics.map((metric) => (
                  <li key={metric.label} className="bg-surface-1 p-5 sm:p-6">
                    <p className="text-[2rem] leading-none font-semibold tracking-tight text-text-1 tabular-nums">
                      <MetricValue metric={metric} locale={locale} />
                    </p>
                    <p className="mt-2 text-small text-text-2">
                      {metric.label}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
