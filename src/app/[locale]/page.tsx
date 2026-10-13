import { getTranslations } from 'next-intl/server';

import { Chip } from '@/components/ui/chip';
import { owner } from '@/config/site';

export default async function HomePage() {
  const t = await getTranslations('hero');

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="container-page flex min-h-[80dvh] flex-col justify-center pt-(--header-height)"
    >
      <Chip className="mb-6 self-start">
        {t('eyebrow', {
          jobTitle: owner.jobTitle,
          city: `${owner.city}, ${owner.country}`,
        })}
      </Chip>
      <h1 id="hero-title" className="text-display">
        {owner.name}
      </h1>
    </section>
  );
}
