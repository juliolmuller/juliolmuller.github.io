# SEO

Baseline for Phase 3. Launch checks (Search Console, Rich Results, PageSpeed) wait until the production domain is live.

## What the site emits

- Unique `<title>` (≤ 60) and description (70–160) per page and locale, from content with catalog fallbacks (`src/lib/seo/metadata.ts`).
- Self-referencing canonical, hreflang `en` / `pt-BR` / `x-default` → `/en`.
- Open Graph + Twitter (`summary_large_image`). Dynamic `opengraph-image` / `twitter-image` (1200×630) per page via `next/og`.
- JSON-LD: Home = WebSite + Person + ProfilePage + featured ItemList. Index = CollectionPage + ItemList + BreadcrumbList. Detail = CreativeWork or SoftwareApplication + BreadcrumbList. Email and phone are never included.
- `sitemap.xml`: every public URL in both locales, `lastModified` from content, cover images, no hidden items, no admin, no `changefreq`/`priority`.
- `robots.txt`: allow `/`, `Disallow: /api/`, absolute sitemap. The admin path is not mentioned.
- Filtered listings (`?kind=`) are `noindex, follow` with a canonical to `/projects`. Paginated URLs self-canonicalize. `previousSlugs` answer 308. Unknown slugs answer 404.

## Verification

```sh
bun run check:seo          # starts next start unless SEO_BASE_URL is set
```

CI runs it after `build`. It fetches every sitemap URL with JavaScript disabled and asserts status, one `h1`, title/description length, canonical, hreflang, JSON-LD, image alt, a sample of internal links, no admin leak, plus the filtered-listing / previous-slug / hidden-project extras.

## After launch

1. Add `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION`.
2. Submit `https://juliolmuller.com/sitemap.xml` in Search Console and Bing Webmaster.
3. Inspect `/en`, `/pt`, one project, and `/en/projects`.
4. Run the Rich Results Test on Home and a live project (`SoftwareApplication`).
5. Confirm `?kind=` URLs stay out of the index and `previousSlugs` 308 in URL Inspection.
