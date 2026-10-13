import { ArrowUp } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { owner } from '@/config/site';
import { Link } from '@/i18n/navigation';

import { MotionToggle } from './motion-toggle';

export async function Footer() {
  const t = await getTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-bg-1">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-text-1">{t('builtBy', { name: owner.name })}</p>
          <p className="text-small text-text-3">
            {t('copyright', { year, name: owner.name })}
          </p>
        </div>

        <nav aria-label={t('footerNav')}>
          <ul className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/accessibility"
                className="inline-flex min-h-11 items-center rounded-full px-4 text-small text-text-2 underline-offset-4 hover-fine:text-text-1 hover-fine:underline"
              >
                {t('accessibility')}
              </Link>
            </li>
            <li>
              <MotionToggle />
            </li>
            <li>
              <a
                href="#top"
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-small text-text-2 hover-fine:text-text-1"
              >
                <ArrowUp aria-hidden="true" className="size-4" />
                {t('backToTop')}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
