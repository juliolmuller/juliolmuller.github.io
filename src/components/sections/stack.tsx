import { getTranslations } from 'next-intl/server';

import { TechIcon } from '@/components/content/tech-icon';
import { Chip } from '@/components/ui/chip';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeader } from '@/components/ui/section-header';
import { type Practice, techCategories, type Technology } from '@/lib/content';

/**
 * The List view: the accessible, server-rendered representation of the
 * stack. The sphere (Phase 4) is a decorative enhancement on top of it.
 */
export async function Stack({
  technologies,
  practices,
}: {
  technologies: Technology[];
  practices: Practice[];
}) {
  const t = await getTranslations('stack');
  const groups = techCategories
    .map((category) => ({
      category,
      items: technologies.filter((tech) => tech.category === category),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <section
      id="stack"
      aria-labelledby="stack-title"
      className="border-y border-line bg-bg-1 section-y"
    >
      <div className="container-page">
        <SectionHeader
          id="stack-title"
          index={3}
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />

        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, index) => (
            <Reveal key={group.category} index={index % 3}>
              <h3
                id={`stack-${group.category}`}
                className="flex items-baseline gap-2 font-label text-text-3"
              >
                {t(`categories.${group.category}`)}
                <span className="tabular-nums">{group.items.length}</span>
              </h3>
              <ul
                aria-labelledby={`stack-${group.category}`}
                className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3"
              >
                {group.items.map((tech) => (
                  <li
                    key={tech.id}
                    className="flex min-w-0 items-center gap-2.5 text-[0.9375rem] text-text-1"
                  >
                    <TechIcon icon={tech.icon} className="text-text-2" />
                    <span>{tech.name}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {practices.length > 0 ? (
          <Reveal className="mt-14">
            <h3 id="stack-practices" className="font-label text-text-3">
              {t('practicesTitle')}
            </h3>
            <ul
              aria-labelledby="stack-practices"
              className="mt-4 flex flex-wrap gap-2"
            >
              {practices.map((practice) => (
                <li key={practice.id}>
                  <Chip className="px-3 py-1.5 text-[0.8125rem]">
                    {practice.label}
                  </Chip>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
