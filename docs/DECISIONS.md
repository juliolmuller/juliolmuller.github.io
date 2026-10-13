# Decisions

Phase 0 output. Format per decision: **context → decision → consequence**. Later phases append new entries; superseded entries are marked, never deleted.

Resolved on 2026-10-13 against the npm registry and the docs bundled inside the published packages (`next/dist/docs`, `next-intl` types).

## 1. Repository facts

- Repo `juliolmuller/juliolmuller.github.io`, branch `next`, working tree empty (previous site cleared in `3637e7b`).
- Local toolchain: Node 24.19.0 (current LTS line "Krypton"; latest 24.21.0), Bun 1.4.3 (D24; pnpm 12.8.1 until then).

## 2. Resolved versions

Latest stable unless noted. Majors are pinned with `^`; exact versions come from the lockfile.

| Package                                          | Version               | Note                                                                                                 |
| ------------------------------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------- |
| Node                                             | 24 LTS                | `.nvmrc` = `24`, `engines.node` = `>=24.11 <25`                                                      |
| Bun                                              | 1.4.x                 | Package manager and runtime, `packageManager` = `bun@1.4.3`, Vercel `bunVersion` = `1.4.x` (D24)     |
| next / eslint-config-next                        | 16.4.0                | App Router, `proxy.ts`, Turbopack default                                                            |
| react / react-dom                                | 19.3.x                |                                                                                                      |
| typescript                                       | **6.0.x** (not 7.0.2) | D5                                                                                                   |
| eslint                                           | **9.39.x** (not 10.x) | D6                                                                                                   |
| typescript-eslint                                | 8.71.x                | peer: TS `<6.1`                                                                                      |
| eslint-plugin-jsx-a11y                           | 6.10.2                | peer: ESLint `<=9`                                                                                   |
| tailwindcss / @tailwindcss/postcss               | 4.3.x                 | CSS-first `@theme`, no JS config                                                                     |
| next-intl                                        | 4.14.x                | D2                                                                                                   |
| motion                                           | 14.1.x                | `motion/react`, `LazyMotion` + `domAnimation`                                                        |
| zustand                                          | 5.0.x                 |                                                                                                      |
| @sanity/client                                   | 8.9.x                 | D7 (no `next-sanity`)                                                                                |
| @sanity/image-url                                | 2.1.x                 |                                                                                                      |
| zod                                              | 4.6.x                 |                                                                                                      |
| sharp                                            | 0.35.x                |                                                                                                      |
| jose                                             | 6.2.x                 |                                                                                                      |
| react-markdown / remark-gfm / rehype-sanitize    | 10.1 / 4.0 / 6.0      |                                                                                                      |
| simple-icons                                     | 16.35.x               | D13                                                                                                  |
| @iconify-json/devicon                            | 1.2.x                 | D13                                                                                                  |
| lucide-react                                     | 1.55.x                |                                                                                                      |
| vitest                                           | 5.0.x                 | jsdom env for component tests                                                                        |
| @playwright/test / @axe-core/playwright          | 1.64 / 4.13           |                                                                                                      |
| prettier / prettier-plugin-tailwindcss           | 3.9 / 0.8             |                                                                                                      |
| schema-dts / html-validate                       | 2.1 / 11.16           |                                                                                                      |
| class-variance-authority / tailwind-merge / clsx | 0.7 / 3.7 / latest    |                                                                                                      |
| @upstash/redis                                   | 1.39.x                | optional rate-limit adapter                                                                          |
| husky / lint-staged                              | 9.1 / 17.6            |                                                                                                      |
| geist                                            | 1.7.x                 | via `next/font/local` from the package; JetBrains Mono via `next/font/google` (self-hosted at build) |

## 3. Architecture summary

- **Rendering.** All public routes under `src/app/[locale]` are prerendered at build (`generateStaticParams` for locales and known slugs) with classic ISR (24 h `revalidate`, `fetch` tags; see D1b, which supersedes the original Cache Components plan). Unknown slugs render blocking on request and are cached afterwards. The admin tree (`src/app/admin`) is fully dynamic (reads cookies), `no-store`, nonce-CSP.
- **Data.** `ContentRepository` interface → `sanity` adapter (GROQ over `@sanity/client`, server-only, every read wrapped in a `'use cache'` function tagged `content:*`) and `fixtures` adapter (in-memory, writable outside production). zod schemas in `src/lib/content/schema.ts` are the single contract; types are `z.infer`. Locale resolution happens inside the repository, never in components.
- **Request interception.** One `src/proxy.ts` (Node runtime, the v16 default) with three jobs, in order: (1) canonicalization (lowercase → 308); (2) admin gate for `/admin/:path*` (JWT verify with `jose`; failure → rewrite to the global 404); (3) locale negotiation for `/` only, delegated to next-intl's middleware. Admin nonce CSP is generated here.
- **Client islands.** Header scroll state, nav indicator, mobile menu, language switcher enhancement, motion-pause toggle, reveal wrapper, counters, card spotlight, filter animation, tech sphere (lazy), window manager + terminal (lazy, mounted in `[locale]/layout.tsx`), lightbox (lazy). Everything else is RSC.
- **Terminal.** Pure TS core in `src/lib/terminal` (parser, VFS, registry, completion, history, output AST), React shell in `src/components/terminal`, content from `/api/terminal-content`. Secret commands are a separate dynamic-import chunk; names in `secret/names.ts` only.
- **Auth.** Single admin; scrypt hash or HMAC'd plaintext compare; HS256 JWT in `__Host-jm_session`; rate limiter interface (memory default, Upstash optional); `requireAdmin()` in every admin RSC, Route Handler and Server Action.
- **Hosting.** Vercel (Node runtime). See D11.

## 4. Decisions

### D1 — Caching model: Cache Components, with a verified fallback

- **Context.** Next 16 stabilized `cacheComponents` (`'use cache'`, `cacheTag`, `cacheLife`, PPR by default). Its docs say it becomes the only model in the next major. Route segment configs `revalidate`, `dynamic` and `dynamicParams` are rejected when it is on. The spec asks for static prerendering + tag ISR, `dynamicParams` on, a real HTTP 404 for unknown slugs and a real 308 for `previousSlugs`.
- **Decision.** Enable `cacheComponents: true` and `partialPrefetching: true`. Repository reads are `'use cache'` functions with `cacheTag(...)` and `cacheLife('content')` (custom profile: `revalidate: 86400`). `dynamicParams` is not exported; the v16 default (unknown params render on request) is equivalent to "on". The project page awaits its data at the top level (outside any `Suspense`) so `notFound()` / `permanentRedirect()` run before the shell is flushed.
- **Consequence.** A Phase 1 spike MUST prove, against `next build && next start`, that an unknown slug returns status 404 (not a streamed 200) and a previous slug returns 308 with a `Location` header. If either fails, switch to the classic model (`cacheComponents` off, `fetch` tags / `unstable_cache`, `revalidate = 86400`, `dynamicParams = true`) and record a superseding decision. No other code depends on which model wins because caching is confined to the repository adapters and route files.

### D1b — Caching model: classic ISR (supersedes D1)

- **Context.** The Phase 1 test on `next build && next start` with Cache Components gave `200` for an unknown slug (the 404 UI was streamed under the fallback shell) and `200` plus a client-side redirect for a previous slug. The installed docs confirm it (`loading.md` → "Status codes": streamed responses always start with `200`) and suggest validating slugs in the proxy instead, which would need a slug index fetched by the proxy on every project request. The same applies to `?page=` beyond the last page.
- **Decision.** `cacheComponents` stays off. Routes use segment config: `revalidate = 86400` as the stale-content fallback, `dynamicParams = true` on `projects/[slug]`, `generateStaticParams` for locales and known slugs. Sanity reads go through a small typed GROQ-over-HTTP helper using `fetch` with `next: { tags }` (`@sanity/client` 8 has no Next fetch integration; it is kept for writes and asset uploads). `unstable_cache` is not used (marked as replaced in v16). The fixtures adapter has no fetch, so admin writes call `updateTag` for Sanity tags **and** `revalidatePath` for the affected routes.
- **Verified.** With this setup the production server answers `/en/projects/nope` → `404`, `/en/projects/old-alpha` → `308 Location: /en/projects/alpha`, and `/en`, `/pt` and known slugs are prerendered (`●`).
- **Consequence.** Migrating to Cache Components later (it becomes mandatory in the next major) needs the proxy slug check; caching is confined to the repository adapters and route segment configs, so the change stays contained. `next/root-params` works without Cache Components.

### D2 — next-intl: root params instead of `setRequestLocale`

- **Context.** The spec says to call `setRequestLocale` in every layout/page. In next-intl 4.14 the `setRequestLocale` cache is marked `@deprecated` in favor of `next/root-params`, which is what keeps routes static under Cache Components.
- **Decision.** `[locale]` is the root segment of the public tree (own root layout with `<html lang>`); `src/i18n/request.ts` reads the locale through `next/root-params`. `setRequestLocale` is not used. Typed messages via `AppConfig` module augmentation (`Messages`, `Locale`).
- **Consequence.** Two root layouts (`[locale]/layout.tsx` and `admin/layout.tsx`) instead of one shared `app/layout.tsx`; a global `app/not-found.tsx` with its own `<html>` serves non-localized 404s (D3). Same intent as the spec, current API.

### D3 — URL policy and the indistinguishable 404

- **Context.** next-intl's default middleware redirects every unprefixed path (`/foo` → `/en/foo`). The spec says only `/` negotiates and that anonymous `/admin/**` must be byte-for-byte the same 404 as any non-existent path.
- **Decision.** The proxy invokes next-intl only for `/` (307, cookie → `Accept-Language` → `en`). Any other unprefixed path is a real 404 served by the global `app/not-found.tsx` (English, terminal-flavored). Anonymous `/admin/**` (GET, POST, Server Action posts, `/admin/api/upload`) is rewritten to an internal path that does not exist, so Next renders that same global 404 with status 404. Admin responses never set distinguishing headers before the session check passes (the `X-Robots-Tag` set applies to the 404 as well, since every 404 carries `noindex` anyway).
- **Consequence.** `/random` and `/admin` produce identical HTML, status and headers; an e2e test diffs them (ignoring `Date`). Localized 404s still exist under `/{locale}/...`. Trailing-slash 308 stays Next's default; lowercase 308 lives in the proxy.

### D4 — CSP: static-friendly policy for public pages, nonce for admin

- **Context.** Nonces require dynamic rendering for every page (Next docs, "Static vs Dynamic Rendering with CSP") and are incompatible with PPR. Experimental SRI (`experimental.sri`) adds `integrity` to external chunks but does not cover the inline RSC flight scripts (`self.__next_f.push(...)`) that every App Router page emits; those differ per page and per revalidation, so build-time hashes are impossible under ISR.
- **Decision.**
  - Public routes (`next.config.ts` `headers()`): `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; manifest-src 'self'; worker-src 'self'; upgrade-insecure-requests`, plus `experimental.sri` (`sha384`) on external chunks. `'unsafe-eval'` in development only.
  - Admin routes (proxy): `script-src 'self' 'nonce-…' 'strict-dynamic'`, `style-src 'self' 'nonce-…'` + `style-src-attr 'unsafe-inline'`, otherwise identical.
- **Consequence.** The public policy deviates from "no blanket `unsafe-inline`" for scripts. Mitigation: zero third-party origins (`connect-src`/`script-src` are `'self'` only, so injected script cannot exfiltrate or load remote code), no user-generated HTML, sanitized Markdown, JSON-LD serializer escapes `<`. Revisit when Next ships hash support for inline flight data. `style-src-attr 'unsafe-inline'` is needed by Motion and `next/image` placeholders; verified in Phase 9.

### D5 — TypeScript 6.0, not 7.0

- **Context.** `typescript@latest` is 7.0.2; `typescript-eslint@8.71` peers on `typescript >=4.8.4 <6.1.0`, and `eslint-config-next` depends on it.
- **Decision.** Pin `typescript@~6.0.3`.
- **Consequence.** Revisit when typescript-eslint supports 7.x (Renovate will flag it).

### D6 — ESLint 9, not 10

- **Context.** `eslint@latest` is 10.12; `eslint-plugin-jsx-a11y@6.10.2` peers on ESLint `^3 … ^9`. jsx-a11y strict is a spec requirement.
- **Decision.** Pin `eslint@^9.39`, flat config.
- **Consequence.** Revisit when jsx-a11y supports 10.

### D7 — `@sanity/client` directly, no `next-sanity`

- **Context.** `next-sanity@13` peers on `sanity` (Studio) and `styled-components`; its value is Studio embedding, Live Content and Visual Editing, all out of scope. Caching is handled by Next (D1), not by the client.
- **Decision.** `@sanity/client` + `@sanity/image-url` + GROQ strings typed by zod output.
- **Consequence.** Smaller server bundle, no Studio deps. Live preview is not available (not required: admin saves publish immediately).

### D8 — Sanity client settings

- **Context.** Private dataset, token-authenticated reads, Next is the cache layer.
- **Decision.** Read client: `useCdn: false`, `perspective: 'published'`, `apiVersion` from `SANITY_API_VERSION` (default `2026-10-01`), `token: SANITY_READ_TOKEN`. Write client: `useCdn: false`, `SANITY_WRITE_TOKEN`. Both constructed in `server-only` modules.
- **Consequence.** Every cache miss hits the live API (a cold build issues one query per page type, not per field). Cost is negligible at this traffic; freshness after writes is guaranteed.

### D9 — Revalidation APIs

- **Context.** In v16 `revalidateTag(tag)` without a profile is deprecated; `updateTag(tag)` gives read-your-writes and is Server-Action-only.
- **Decision.** Admin Server Actions call `updateTag(...)` for every affected tag (plus `revalidatePath('/sitemap.xml')` when slugs or visibility change). The webhook Route Handler calls `revalidateTag(tag, { expire: 0 })`. "Revalidate all" calls `updateTag` for every `content:*` tag.
- **Consequence.** The editor sees the change on the next navigation; visitors get fresh pages on their next request.

### D10 — Upload transport and body limits

- **Context.** Server Actions default to a 1 MB body; uploads are up to 10 MB.
- **Decision.** Files go only through `POST /admin/api/upload` (Route Handler, streamed `request.formData()` with a manual size check before parsing large parts) returning an asset reference; forms then submit the reference to a Server Action. `serverActions.bodySizeLimit` stays at `1mb` explicitly; the Route Handler enforces 8 MB / 10 MB itself and the proxy rejects `Content-Length` above 11 MB on that path.
- **Consequence.** Server Actions never carry binaries. Vercel's own request limit (4.5 MB on serverless functions) is below 8–10 MB: recorded as risk R3.

### D11 — Hosting: Vercel, not GitHub Pages

- **Context.** The repo name suggests GitHub Pages, which only serves static files. The spec needs a proxy, Server Actions, Route Handlers and on-demand revalidation.
- **Decision.** Deploy on Vercel (Node runtime, Fluid compute). The repo name can stay; the custom domain points at Vercel.
- **Consequence.** Any GitHub Pages workflow/CNAME setup from the old site must be removed when the domain moves.

### D12 — `text-3` token raised from `#7a8196` to `#828a9f`

- **Context.** Measured contrast: `text-3` is 5.16:1 on `bg-0` but **4.44:1 on `surface-2`** (chips, raised surfaces), failing AA. All other text tokens pass on every surface (`text-1` ≥ 14.3, `text-2` ≥ 7.3, accents ≥ 5.3).
- **Decision.** `--color-text-3: #828a9f` (4.99:1 on `surface-2`, ~5.8:1 on `bg-0`). Visual difference is marginal.
- **Consequence.** The contrast unit test covers every fg token × every surface token and fails below 4.5:1 (body pairs `text-1`/`text-2` on `bg-0` must reach 7:1).

### D13 — Technology icon resolution (audited, not assumed)

- **Context.** Checked every Appendix C item against simple-icons 16.35 and devicon 1.2.71.
- **Decision.** Simple Icons first, Devicon second, monogram last:
  - Devicon fallback: Java (`java`; Simple Icons only has `openjdk`, a different mark), AWS (`amazonwebservices`), Zustand, gRPC, AngularJS (`angularjs`; the Simple Icons `angular` mark is modern Angular, wrong brand), VBA (`visualbasic`, closest legitimate mark; otherwise monogram as the spec expects).
  - Simple Icons: TanStack Query → `reactquery`; Swagger / OpenAPI → `swagger`; Pub/Sub → `googlepubsub`; BigQuery → `googlebigquery`; everything else under its obvious slug.
  - Monogram: SQL (no vendor-neutral mark; `mysql`/`sqlite` would be misleading), Excel / Power Query, Power BI, SharePoint (absent from both sets).
- **Consequence.** Devicon marks are multi-color; they render as `currentColor` single-tone paths, so `icons:audit` also writes a contact sheet (`.cache/icons-audit.html`) for visual review in Phase 2. Any illegible devicon mark falls back to the monogram.
- **Update (Phase 2, audited).** `devicon` resolves through `@iconify-json/devicon-plain` (single-tone, MIT) first and the multicolor set second, converting only plain `path`/`circle`/`ellipse`/`rect`/`polygon` geometry; anything with gradients, transforms, strokes or `evenodd` is rejected. Result: 36 Simple Icons, 5 devicon-plain (Java, Zustand, AngularJS, gRPC, AWS), 5 monograms. VBA is a monogram after all: the `visualbasic` mark is VB.NET's. Monograms can be pinned with the `monogram` field (Excel / Power Query → `XL`, Power BI → `BI`). Dark brand colors (Next.js, Express, Fastify, Prisma, GitHub, Lua) need the Phase 4 luminance correction.

### D14 — Fixture images and PDFs are generated and committed

- **Context.** The spec asks for a deterministic `sharp` generator. Running it at build would make builds depend on generation time and native deps.
- **Decision.** `scripts/generate-fixtures.ts` (deterministic, seeded by slug) writes to `fixtures/images` and `fixtures/pdf`; outputs are committed (WebP/AVIF sized for 1600×1000; ~2–3 MB total). The PDF is a hand-built minimal PDF (no JS, no external fonts), no extra dependency.
- **Consequence.** `fixtures` adapter serves them via a static route; the seed script uploads the same files.
- **Update (Phase 2).** Outputs go to `public/fixtures/{images,pdf}` (Next serves them; `images.localPatterns` allows `/fixtures/images/**`, the proxy passes `/fixtures` through) plus a manifest, `src/lib/content/fixtures/assets.generated.ts` (dimensions, 20 px LQIP data URL, byte sizes). WebP q82 only, since `next/image` produces AVIF on demand: 13 images + 2 PDFs = 129 KB. Regenerate with `bun run fixtures:generate`; output is byte-stable.

### D15 — Dependency build scripts allowlist

- ~~**Decision.** `pnpm-workspace.yaml` `onlyBuiltDependencies: [...]`.~~ Superseded by D24.
- **Decision (D24).** `package.json` `trustedDependencies: []`. Bun blocks lifecycle scripts by default; the three it blocks (`@parcel/watcher`, `@swc/core`, `unrs-resolver`) are build-from-source fallbacks whose prebuilt binaries ship as optional dependencies. Add an entry only when a package fails without its script.

### D16 — View Transitions deferred

- **Context.** Next 16 documents React `<ViewTransition>`; it depends on React canary/experimental features at the time of writing.
- **Decision.** Phase 3 ships a CSS cross-fade between routes. The card → detail morph is Phase 10 and only if `<ViewTransition>` is available in stable React 19.3 without experimental flags.

### D17 — Smaller interpretations

- **Primary button** "solid `text-1` on `bg-0`" is read as background `text-1` with label `bg-0` (inverted, 16.6:1).
- **Skip link** text: "Skip to main content" (§14.1 wins over §3.2's "Skip to content").
- **Experience slugs** for the VFS (`experience/<company-slug>.md`) are derived from `company` with a deterministic slugify; collisions get a numeric suffix.
- **Session cookie** in development is `jm_session` (no `Secure`, `__Host-` requires it).
- **Rate limiting on Vercel**: the in-memory limiter is per instance; production SHOULD set the Upstash vars. `docs/ADMIN.md` documents this.
- **Admin `lang`**: `admin/layout.tsx` is a root layout with `<html lang="en">`.
- **`/dev/ui`**: lives at `src/app/dev/ui/page.tsx`, calls `notFound()` when `NODE_ENV === 'production'`, excluded from the sitemap; it is also outside `[locale]`, so it follows the D3 rule in production (404).

### D18 — Locale negotiation written in the proxy, not next-intl's middleware

- **Context.** next-intl's middleware manages the `NEXT_LOCALE` cookie by its own rules and redirects every unprefixed path. The spec wants the cookie written only on an explicit switch and negotiation only on `/`.
- **Decision.** `src/i18n/negotiate.ts` (pure, unit-tested: cookie → `Accept-Language` with q-values → `en`) is called by `src/proxy.ts` for `/` only (307, `Vary: Accept-Language, Cookie`, `Cache-Control: private, no-store`). next-intl routing sets `localeCookie: false`, `localeDetection: false`. The language switcher writes the cookie on click.
- **Consequence.** Without JavaScript the switch still works (plain links) but no preference is saved; the next visit to `/` falls back to `Accept-Language`.

### D19 — The global 404 is `global-not-found.tsx` (experimental flag)

- **Context.** The public root layout is `[locale]/layout.tsx` and the admin has its own root layout, so there is no single layout to build a shared 404 from; the installed docs recommend `global-not-found.js` for exactly this case.
- **Decision.** `experimental.globalNotFound: true`. The proxy rewrites every path whose first segment is not a locale or a known root file (including anonymous `/admin/**`) to `/404`, which the router cannot match. `[locale]/[...rest]/page.tsx` calls `notFound()` so `/en/unknown` gets the localized 404 with status 404.
- **Verified.** `/random`, `/admin`, `POST /admin`, `/admin/api/upload` and `/foo.php` all return `404` with the same body.

### D20 — Prettier preferences

- **Decision.** Taken from the owner's editor settings: `singleQuote`, `trailingComma: all`, `printWidth: 80`, semicolons, 2 spaces, plus the Tailwind plugin. `endOfLine` is `lf` (the editor default is `crlf`, but the repo lives in WSL/Linux and CI runs on Linux); `.gitattributes` enforces it.

### D21 — Inline motion-init script

- **Context.** A persisted "Pause animations" choice must apply before first paint, or the hero animates for a frame. The spec allows `dangerouslySetInnerHTML` only for JSON-LD.
- **Decision.** One constant, dependency-free inline script (`src/lib/motion-init.ts`) in `<head>` sets `data-motion='reduced'` from `localStorage`. It contains no interpolated user or content data. `<html>` uses `suppressHydrationWarning` for that attribute.
- **Consequence.** Second, documented exception to the `dangerouslySetInnerHTML` rule; covered by the public CSP's `script-src 'unsafe-inline'` (D4).

### D22 — Nav indicator without Motion `layoutId`

- **Context.** `layoutId` requires Motion's `domMax` feature bundle (~10 KB gzip more than `domAnimation`), against the 150 KB initial-JS budget.
- **Decision.** The indicator is an absolutely positioned pill whose `transform` and `width` are set from the active link's box and animated with a CSS transition (`--ease-out-expo`). Motion stays lazy (`LazyMotion` + async `domAnimation`).
- **Consequence.** Same visual result; Motion layout animations remain available for the portfolio filter (loaded only on `/projects`).

### D23 — axe runs on Chromium projects

- **Context.** `@axe-core/playwright` hangs inside WebKit's `page.evaluate` in this environment (timeouts, no violations reported).
- **Decision.** axe checks run on the desktop Chromium and mobile (Pixel 7, Chromium) projects; WebKit runs every functional test. axe rules evaluate the DOM and are engine-agnostic.
- **Addendum.** axe scans of animated UI (the mobile menu) wait for `getAnimations({ subtree: true })` to finish first; otherwise contrast is sampled mid fade-in and the test flakes.

### D24 — Bun 1.4 as package manager and Vercel runtime

- **Context.** Owner request: replace pnpm with Bun and pin Bun 1.4 on Vercel. Vercel's `bunVersion` accepts `"1.4.x"` or `"1.x"` (resolves to 1.3.x); setting it switches Vercel Functions to the Bun runtime (beta). For Next.js with ISR, Vercel requires `next dev/build/start` to run under `bun run --bun`.
- **Decision.**
  - `vercel.json`: `"bunVersion": "1.4.x"`, `installCommand: bun install --frozen-lockfile`. `packageManager: bun@1.4.3`, `engines.bun: >=1.4.0 <1.5.0`, `bun.lock` committed.
  - `dev`/`build`/`start` use `bun run --bun next …`. Repo scripts run as `bun --conditions=react-server scripts/<name>.ts` (resolves `server-only` to its no-op export; `tsx` dropped).
  - Node 24 stays for tooling that spawns `node` through shebangs: ESLint, Vitest, Playwright. `.nvmrc` and `engines.node` are kept, and CI installs both.
  - `audit:deps` = `bun audit --audit-level=high --ignore=GHSA-vfj7-8cjw-p6xm`. That advisory (`braces` ≤ 3.0.3, ReDoS-style stack exhaustion) has no patched release and only reaches the tree through `eslint-config-next` → `fast-glob` (dev-only, never fed untrusted patterns). Remove the ignore when a fix ships.
- **Consequence.** The proxy is expected to stay on Node (Next 16 proxies cannot set `runtime`; unconfirmed how Vercel maps it under `bunVersion`), so production likely mixes the Bun function runtime for pages and route handlers with Node for the proxy. Verified locally under Bun 1.4.3: lint, typecheck, 43 unit tests, build (`/en`, `/pt` ●), e2e 38 passed / 4 skipped. **Risk (speculative):** the Bun runtime is beta on Vercel; if ISR revalidation or `sharp` misbehaves there, remove `bunVersion` (Bun remains the package manager) and record it here.

### D25 — One content pipeline, two thin sources

- **Context.** Two adapters must pass the same contract (§11.1) and handle invalid, hidden and untranslated documents identically.
- **Decision.** Adapters implement `ContentSource` and only fetch raw documents in schema field names (`fixtures` clones memory; `sanity` runs GROQ projections that rename storage fields). `createRepository(source, logger)` owns the shared pipeline: strip nulls → fill an empty `pt` from `en` (warn `missing-translation`) → strict zod parse, skipping invalid documents (warn `invalid-document` with paths and codes, never values) → visibility filter → sort by `order`, then `id` → drop duplicate slugs → drop hidden or unknown technology references → resolve the locale and icons.
- **Consequence.** Behavior can't diverge between adapters, and a test asserts deep equality of every repository method across both. A technology edit invalidates `content:technologies` only, because every read that filters technology references also carries that tag.

### D26 — Sanity reads over plain `fetch` (amends D8)

- **Context.** ISR needs Next's fetch cache with `next.tags`; authorized requests are only cached with an explicit `cache: 'force-cache'` (fetch API reference). Routing the client's request layer through Next's patched `fetch` is an implementation detail, not a contract.
- **Decision.** `src/lib/content/sanity/http.ts` (server-only) calls `GET https://<projectId>.api.sanity.io/v<apiVersion>/data/query/<dataset>` with `perspective=published`, `returnQuery=false`, the Viewer token as a Bearer header, `cache: 'force-cache'`, `next: { revalidate: 86400, tags }`. No CDN (D8 unchanged). `@sanity/client` stays for writes and the seed. Errors carry the HTTP status only.
- **Consequence.** Cache behavior is explicit and testable, and there is no client instance on the read path. Long GROQ queries go in the URL (≤ 1.5 KB URL-encoded today; Sanity asks for POST above 11 KB).

### D27 — The Sanity adapter is contract-tested offline with groq-js

- **Context.** CI has no Sanity credentials, and mocking query results would only test the mocks.
- **Decision.** `tests/support/sanity-memory.ts` converts the fixture dataset into Sanity storage documents (the converter is the seed's own code, `sanity/documents.ts`), synthesizes `sanity.imageAsset`/`sanity.fileAsset` documents, and evaluates the adapter's real GROQ with `groq-js`. `groq-js` is banned outside `src/lib/content` and `scripts` by ESLint.
- **Consequence.** Queries, projections, dereferences and tag wiring are exercised in CI. Remaining gap: `groq-js` vs the hosted engine. This is covered by the live smoke test after seeding (`docs/SANITY.md`).

### D28 — Sanity storage shape and ids

- **Context.** The schema is zod-first. Sanity also needs typed objects, keyed arrays and references.
- **Decision.** Localized fields are `localeString` / `localeText` / `localeMarkdown` objects `{ en, pt }`. Array items get stable `_key`s (sha1 of the path). Technologies are reference arrays, images are `image` objects with a localized `alt` and `hotspot` (focal point), and slugs are `{ current }`. Singletons use their type as `_id` (`profile`, `contact`, `resume`); seeded collection documents use `<type>.<uuid-like sha1(type:key)>`, so re-seeding is idempotent. Documents created later by the admin use plain UUIDs; nothing depends on the id format.
- **Consequence.** Ids with a dot are "path" ids that the public API hides; the dataset is private and every read is authenticated, so this is moot. Confirmed on `development` (2026-10-13): the published perspective returns all 86 seeded documents with a Viewer token.

### D29 — Studio schema as plain data, deployed through MCP (amends §11.10)

- **Context.** §11.10 asks for `sanity/schema/*.ts` with `defineType`. That requires the `sanity` package (Studio, React peers, styled-components) only to type-check data the app never runs.
- **Decision.** One plain-data file, `sanity/schema.ts` (`schemaTypes`: 6 object types, 10 document types), mirrors the storage shape, with no `sanity` dependency. The same declaration is deployed to both datasets as the `default` workspace schema, so Sanity's tooling (Content Lake schema, MCP, a future Studio) knows the types; `bun run sanity:schema` prints it. Validation stays in zod. A unit test walks every converted fixture document and fails if a field is missing from the schema.
- **Consequence.** A separate Studio can later `import { schemaTypes }` into `defineConfig` unchanged. Schema changes mean: edit `sanity/schema.ts` → test → redeploy (`docs/SANITY.md`).

### D30 — Datasets and seeding

- **Context.** Seed data is fictional and must never be mistaken for real content (data policy). Hidden items must not be publicly readable (§11.2).
- **Decision.** Project `njcnsmax` has two private datasets: `production` (real content, entered through the admin) and `development` (fictional seed, the default for local work and previews). `bun run sanity:seed` writes with `createOrReplace` in one transaction, uploads assets (Sanity deduplicates by hash, and only `lqip` metadata is extracted), refuses `production` without `--force`, and `--reset` deletes only `isFixture == true` documents after the dataset name is typed on a TTY. `--dry-run` converts without network writes.
- **Consequence.** Seeding is repeatable and can't touch real documents. Production stays empty until Phase 8 unless someone forces it.

### D31 — Open Graph images via `next/og`

- **Context.** §13.8 wants a 1200×630 dark template per page and locale, with fonts and a photo when available.
- **Decision.** One renderer (`src/lib/seo/og-image.tsx`) uses `ImageResponse` and Geist TTF from the `geist` package (Satori does not read `woff2`). Each public segment has `opengraph-image.tsx` and a `twitter-image.tsx` that re-exports it. Local fixture photos are read from `public/`; Sanity photos are fetched from their absolute URL.
- **Consequence.** Social previews stay on-origin and prerender with the page. A unit test asserts the response is a PNG.

### D32 — `check:seo` starts its own server

- **Context.** §13.10 wants the checker to run against the production build with JavaScript disabled.
- **Decision.** `scripts/check-seo.ts` starts `next start` on `SEO_PORT` (default 3101) unless `SEO_BASE_URL` is set. Canonicals are asserted against `NEXT_PUBLIC_SITE_URL`, not the fetch host, so CI can keep `SITE_URL` on 3100 while the checker uses 3101. Admin session checks wait for Phase 7; anonymous `/admin` is already covered by the 404 e2e.
- **Consequence.** CI can run `check:seo` after `build` without sharing Playwright's port.

### D33 — Invalid project query params are 404s

- **Context.** D1b requires a real 404 for `?page=` past the last page. An unknown `?kind=` is the same class of problem.
- **Decision.** `parseProjectsQuery` rejects unknown kinds and non-positive pages. The index also 404s when the kind has no visible projects or the page is past `totalPages`.
- **Consequence.** Soft-404 filtered URLs never enter the index.

### D34 — Project filter has no Motion layout animation

- **Context.** §8.4 asks for Motion `layout` + `AnimatePresence` on the filter reflow. Putting the grid in a client component would force `ProjectCard` (and `next/image`) across the client boundary.
- **Decision.** The filter is crawlable links; selecting a kind is a navigation, so the new grid is server-rendered. Cards stay Server Components wrapping the existing `Tilt` island. The live region still announces the count.
- **Consequence.** No-JS and RSC stay the default. A client reflow can be added later without changing the URLs.

### D35 — Projects index is dynamic

- **Context.** Awaiting `searchParams` for `?kind=` / `?page=` makes the segment dynamic in Next 16, so `/[locale]/projects` is `ƒ` in the build output while Home, accessibility and known slugs stay `●`.
- **Decision.** Leave it request-rendered (`revalidate = 86400`). The unfiltered HTML is still complete in the first response. Forcing `force-static` would drop the query.
- **Consequence.** First hit after a deploy pays a server render; later hits are cached for 24 h.

### D36 — axe ignores pending reveals; Playwright serializes under load

- **Context.** Below-fold `Reveal` nodes get `data-reveal=pending` (opacity 0) after hydration. axe then reports contrast against the page background. Hiding them with `visibility: hidden` made full-page screenshots empty.
- **Decision.** Leave pending reveals at `opacity: 0` only. axe calls `.exclude('[data-reveal=pending]')`. Screenshot tests emulate `prefers-reduced-motion` so every section stays visible. Playwright uses 2 workers, a 60 s test timeout, and `force` clicks plus `domcontentloaded` on the WebKit language/motion tests — looping hero motion never settles WebKit's actionability check.
- **Consequence.** Contrast is audited on painted content. WebKit still runs the functional assertions; axe stays Chromium-only (D23).

## 5. Contradictions found in the spec and how they are resolved

1. `dynamicParams` "stays on" (§3.1, §8.5) vs Cache Components rejecting the export → D1.
2. `setRequestLocale` in every layout (§6) vs next-intl's deprecation → D2.
3. "No blanket `unsafe-inline`" for scripts (§15) vs static prerendering (§2) → D4.
4. "Latest stable" TypeScript and ESLint (§0, §2) vs peer ranges of typescript-eslint and jsx-a11y → D5, D6.
5. `next-sanity` "if it fits" (§2): it does not → D7.
6. `revalidateTag` in write path (§11.6): deprecated single-arg form → D9 (`updateTag`).
7. `text-3` "still ≥ 4.5:1" (§4.2) is false on `surface-2` → D12.
8. "Skip to content" (§3.2) vs "Skip to main content" (§14.1) → D17.
9. Only `/` negotiates (§3.1, §6) vs next-intl redirecting every unprefixed path → D3.
10. Uploads up to 10 MB (§12.7) vs Vercel's function body limit → R3.
11. Appendix C counts verified: 18 / 17 / 11 = 46; phones render 35 (§7 says "about 36": consistent).
12. `sanity/schema/*.ts` with `defineType` (§11.10) vs no Studio dependency (D7) → D29.
13. Filter Motion layout (§8.4) vs Server Component cards → D34.
14. Prerendered `/projects` vs `searchParams` making the segment dynamic → D35.

## 6. Risks

- **R1 — Status codes under streaming (D1).** Highest technical risk; covered by the Phase 1 spike with a defined fallback.
- **R2 — next-intl + Cache Components + `next/root-params`** are all recent. Mitigation: build verification in Phase 1 that `/en` and `/pt` are emitted as static (`○`/`◐` in build output) and not dynamic.
- **R3 — Vercel 4.5 MB request body limit** vs 8 MB images / 10 MB PDFs. Options in order: client-side downscale before upload for images (canvas, still re-encoded server-side with `sharp`), and for PDFs either cap at 4.5 MB on Vercel or use a short-lived Sanity upload done server-side from a chunked upload. Default chosen: enforce `min(spec limit, platform limit)` and show the effective limit in the admin. Decide definitively in Phase 8.
- **R4 — Devicon single-tone legibility (D13).** Mitigated by the contact sheet review and monogram fallback.
- **R5 — Lighthouse Performance ≥ 95 on mobile** with Motion + an always-mounted window manager. Mitigation: window manager shell is a tiny client component; terminal, sphere and Motion features load lazily (`LazyMotion`), dock chip is plain CSS until interaction.
- **R6 — Activity-preserved routes (Cache Components)** keep hidden routes mounted; rAF loops (sphere, aurora spotlight) must stop on `visibilitychange` _and_ when their route is hidden. Effects are cleaned up on hide per the docs; tests will assert no rAF runs on a hidden route.
- **R7 — Constant-time 404 for admin.** Proxy JWT verification adds microseconds; acceptable ("comparable timing"). The `authenticate` action delay (≥ 800 ms + jitter) is the real timing equalizer.
- **R8 — Server Action origin check behind proxies.** Vercel sets the forwarded host correctly; self-hosting docs must mention `serverActions.allowedOrigins` if a reverse proxy rewrites hosts.

## 7. Assumptions

- Production domain is `https://juliolmuller.com` (`NEXT_PUBLIC_SITE_URL`); preview deployments use their own URL and send `X-Robots-Tag: noindex` (`VERCEL_ENV !== 'production'`).
- Sanity project `njcnsmax` (organization `ow3ahfjbr`) exists with private `production` and `development` datasets (D30). The owner creates the tokens and keeps them in `.env.local`/Vercel; CI runs on fixtures.
- HSTS `preload` is not added until the owner confirms.
- GitHub Actions is available on the repo; Lighthouse CI runs with `@lhci/cli` against `next start`, no LHCI server (temporary public storage disabled; reports kept as artifacts).
- The real résumé, photo and content will be entered later through the admin; nothing real is seeded.
