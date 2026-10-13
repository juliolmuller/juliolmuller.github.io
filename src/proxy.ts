import { type NextRequest, NextResponse } from 'next/server';

import { negotiateLocale } from '@/i18n/negotiate';
import { isAppLocale, LOCALE_COOKIE } from '@/i18n/routing';

/**
 * Rewrite target for every request that must produce the global 404. Its
 * first segment is not a locale, so the `[locale]` root layout rejects it.
 */
const NOT_FOUND_PATH = '/404';

/** Root-level files and route trees that are not localized. */
const ROOT_PASSTHROUGH = new Set([
  'api',
  'apple-icon',
  'icon',
  'icon.svg',
  'manifest.webmanifest',
  'robots.txt',
  'sitemap.xml',
]);

const isProduction = process.env.NODE_ENV === 'production';

function notFound(request: NextRequest) {
  return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const lowercased = pathname.toLowerCase();
  if (lowercased !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = lowercased;
    return NextResponse.redirect(url, 308);
  }

  if (pathname === '/') {
    const locale = negotiateLocale(
      request.cookies.get(LOCALE_COOKIE)?.value,
      request.headers.get('accept-language'),
    );
    const response = NextResponse.redirect(
      new URL(`/${locale}${search}`, request.url),
      307,
    );
    response.headers.set('Vary', 'Accept-Language, Cookie');
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }

  const firstSegment = pathname.split('/')[1] ?? '';

  if (isAppLocale(firstSegment) || ROOT_PASSTHROUGH.has(firstSegment)) {
    return NextResponse.next();
  }

  if (firstSegment === 'dev' && !isProduction) {
    return NextResponse.next();
  }

  return notFound(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|_vercel).*)'],
};
