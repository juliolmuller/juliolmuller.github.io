import { getTranslations } from 'next-intl/server';

import { Markdown } from '@/components/markdown/markdown';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeader } from '@/components/ui/section-header';
import type { Profile } from '@/lib/content';

export async function About({ profile }: { profile: Profile }) {
  const [t, tA11y] = await Promise.all([
    getTranslations('about'),
    getTranslations('a11y'),
  ]);

  return (
    <section id="about" aria-labelledby="about-title" className="section-y">
      <div className="container-page">
        <SectionHeader
          id="about-title"
          index={2}
          eyebrow={t('eyebrow')}
          title={t('title')}
        />
        <Reveal className="measure">
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
      </div>
    </section>
  );
}
