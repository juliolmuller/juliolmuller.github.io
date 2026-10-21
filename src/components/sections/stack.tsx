import { getTranslations } from 'next-intl/server';

import { TechCloudShell } from '@/components/tech-cloud/tech-cloud-shell';
import { SectionHeader } from '@/components/ui/section-header';
import type { Practice, Technology } from '@/lib/content';

/**
 * Stack section: List is the SSR / reduced-motion baseline; the geoid cloud
 * is a client enhancement (D37).
 */
export async function Stack({
  technologies,
  practices,
}: {
  technologies: Technology[];
  practices: Practice[];
}) {
  const t = await getTranslations('stack');

  return (
    <section
      id="stack"
      aria-labelledby="stack-title"
      className="overflow-x-clip border-y border-line bg-bg-1 section-y"
    >
      <div className="container-page">
        <SectionHeader
          id="stack-title"
          index={3}
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />
      </div>
      <TechCloudShell technologies={technologies} practices={practices} />
    </section>
  );
}
