import '@/styles/globals.css';

import type { Metadata, Viewport } from 'next';

import { NotFoundView } from '@/components/layout/not-found-view';
import { THEME_COLOR } from '@/config/site';
import { fontVariables } from '@/styles/fonts';

import messages from '../../messages/en.json';

/**
 * Served for every URL outside the locale tree, including anonymous admin
 * requests, so it must not depend on the request in any way.
 */
export const metadata: Metadata = {
  title: messages.errors.notFoundTitle,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: THEME_COLOR,
};

export default function GlobalNotFound() {
  const { errors } = messages;
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <main id="main">
          <NotFoundView
            title={errors.notFoundTitle}
            text={errors.notFoundText}
            prompt={errors.notFoundPrompt.replace('{path}', '???')}
            homeHref="/"
            homeLabel={errors.backHome}
          />
        </main>
      </body>
    </html>
  );
}
