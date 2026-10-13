import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('errors');
  return <h1>{t('notFoundTitle')}</h1>;
}
