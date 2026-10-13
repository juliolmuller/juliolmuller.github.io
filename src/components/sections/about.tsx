import { getTranslations } from 'next-intl/server';

import { Markdown } from '@/components/markdown/markdown';
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

export async function About({
  locale,
  profile,
}: {
  locale: AppLocale;
  profile: Profile;
}) {
  const [t, tA11y] = await Promise.all([
    getTranslations('about'),
    getTranslations('a11y'),
  ]);
  const metrics = profile.metrics.slice(0, MAX_METRICS);

  return (
    <section id="about" aria-labelledby="about-title" className="section-y">
      <div className="container-page">
        <SectionHeader
          id="about-title"
          index={1}
          eyebrow={t('eyebrow')}
          title={t('title')}
        />
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
          <Reveal>
            <Markdown
              topHeadingLevel={3}
              idPrefix="bio"
              newTabLabel={tA11y('opensInNewTab')}
              scrollRegionLabel={tA11y('scrollRegion')}
              className="text-[1.0625rem] lg:text-lg [&_p:first-child]:text-text-1"
            >
              {profile.bio}
            </Markdown>
          </Reveal>

          <Reveal index={1} className="space-y-6">
            <div className="card rounded-lg border border-line bg-surface-1 p-6 shadow-(--shadow-card-inset)">
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

            {metrics.length > 0 ? (
              <ul
                aria-label={t('metricsLabel')}
                className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line"
              >
                {metrics.map((metric) => (
                  <li key={metric.label} className="bg-surface-1 p-5">
                    <p className="text-[2rem] leading-none font-semibold tracking-tight text-text-1 tabular-nums">
                      <MetricValue metric={metric} locale={locale} />
                    </p>
                    <p className="mt-2 text-small text-text-2">
                      {metric.label}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
