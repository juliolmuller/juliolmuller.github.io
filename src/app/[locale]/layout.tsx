import '@/styles/globals.css';

import { notFound } from 'next/navigation';
import { locale as rootLocale } from 'next/root-params';

import { isAppLocale, localeTags, routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
}: LayoutProps<'/[locale]'>) {
  const locale = await rootLocale();
  if (!isAppLocale(locale)) notFound();

  return (
    <html lang={localeTags[locale]}>
      <body>{children}</body>
    </html>
  );
}
