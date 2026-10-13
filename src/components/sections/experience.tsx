import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { TimelineProgress } from '@/components/motion/timeline-progress';
import { Chip } from '@/components/ui/chip';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeader } from '@/components/ui/section-header';
import type { AppLocale } from '@/i18n/routing';
import type {
  Education,
  Experience as ExperienceEntry,
  ExperienceRole,
  Technology,
} from '@/lib/content';
import { formatPartialDate } from '@/lib/format';

interface ExperienceProps {
  locale: AppLocale;
  experience: ExperienceEntry[];
  education: Education[];
  technologies: Technology[];
}

function DateRange({
  locale,
  start,
  end,
  presentLabel,
}: {
  locale: AppLocale;
  start?: string;
  end?: string;
  /** Omit for one-off dates (a certification has no "present"). */
  presentLabel?: string;
}) {
  if (!start && !end) return null;
  const showEnd = Boolean(end) || Boolean(presentLabel);
  return (
    <span className="font-mono text-[0.8125rem] text-text-3">
      {start ? (
        <time dateTime={start}>{formatPartialDate(locale, start)}</time>
      ) : null}
      {start && showEnd ? ' – ' : null}
      {end ? (
        <time dateTime={end}>{formatPartialDate(locale, end)}</time>
      ) : (
        presentLabel
      )}
    </span>
  );
}

function RoleBody({ role }: { role: ExperienceRole }) {
  return (
    <>
      <p className="mt-3 text-text-2">{role.summary}</p>
      {role.bullets.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {role.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-text-2">
              <span
                aria-hidden="true"
                className="mt-[0.7em] size-1 shrink-0 rounded-full bg-accent-2"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export async function Experience({
  locale,
  experience,
  education,
  technologies,
}: ExperienceProps) {
  const t = await getTranslations('experience');
  const names = new Map(technologies.map((tech) => [tech.id, tech.name]));

  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="section-y"
    >
      <div className="container-page">
        <SectionHeader
          id="experience-title"
          index={2}
          eyebrow={t('eyebrow')}
          title={t('title')}
        />

        <TimelineProgress>
          <ol className="space-y-14">
            {experience.map((entry) => {
              const [first, ...rest] = entry.roles;
              const stack = entry.techIds
                .map((id) => names.get(id))
                .filter((name): name is string => Boolean(name));
              const details = (
                <>
                  {first ? <RoleBody role={first} /> : null}
                  {rest.map((role) => (
                    <div key={`${role.title}-${role.start}`} className="mt-8">
                      <h4 className="font-semibold text-text-1">
                        {role.title}
                      </h4>
                      <DateRange
                        locale={locale}
                        start={role.start}
                        end={role.end}
                        presentLabel={t('present')}
                      />
                      <RoleBody role={role} />
                    </div>
                  ))}
                  {stack.length > 0 ? (
                    <div className="mt-5">
                      <p className="sr-only">{t('technologies')}</p>
                      <ul className="flex flex-wrap gap-2">
                        {stack.map((name) => (
                          <li key={name}>
                            <Chip>{name}</Chip>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              );

              return (
                <li key={entry.id} className="relative pl-10">
                  <span
                    data-timeline-node
                    aria-hidden="true"
                    className="absolute top-[0.4rem] left-0 size-[15px] rounded-full border-2 border-bg-0 bg-surface-2 ring-1 ring-line-strong"
                  />
                  <Reveal>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="text-h3">
                        {first?.title}
                        <span className="text-text-2"> · {entry.company}</span>
                      </h3>
                      <DateRange
                        locale={locale}
                        start={entry.roles.at(-1)?.start}
                        end={first?.end}
                        presentLabel={t('present')}
                      />
                    </div>
                    <p className="mt-1 text-small text-text-3">
                      {entry.location}
                    </p>

                    {entry.collapsedByDefault ? (
                      <details className="group/details mt-3">
                        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full text-small text-text-1 underline-offset-4 hover-fine:underline [&::-webkit-details-marker]:hidden">
                          {t('showMore')}
                          <ChevronDown
                            aria-hidden="true"
                            className="size-4 transition-transform group-open/details:rotate-180"
                          />
                        </summary>
                        {details}
                      </details>
                    ) : (
                      details
                    )}
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </TimelineProgress>

        {education.length > 0 ? (
          <div className="mt-20">
            <h3 className="text-h3">{t('educationTitle')}</h3>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {education.map((item, index) => (
                <li key={item.id}>
                  <Reveal
                    index={index}
                    className="card flex h-full flex-col rounded-lg border border-line bg-surface-1 p-5 shadow-(--shadow-card-inset)"
                  >
                    <p className="font-label text-text-3">
                      {t(`kinds.${item.kind}`)}
                    </p>
                    <h4 className="mt-3 font-semibold text-text-1">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-small text-text-2">
                      {item.institution}
                    </p>
                    <p className="mt-auto pt-4">
                      <DateRange
                        locale={locale}
                        start={item.start}
                        end={item.end}
                      />
                    </p>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('viewCredentialLabel', {
                          title: item.title,
                        })}
                        className="mt-3 inline-flex min-h-11 items-center gap-1.5 self-start text-small text-text-1 underline-offset-4 hover-fine:underline"
                      >
                        {t('viewCredential')}
                        <ArrowUpRight aria-hidden="true" className="size-4" />
                      </a>
                    ) : null}
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
