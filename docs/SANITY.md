# Sanity

Sanity is the content store. The app talks to it only from the server, through `@/lib/content` (D25–D30).

## Project and datasets

|               |                                                                          |
| ------------- | ------------------------------------------------------------------------ |
| Organization  | `ow3ahfjbr`                                                              |
| Project       | `njcnsmax`                                                               |
| `production`  | private; real content, written by the admin                              |
| `development` | private; fictional seed (`isFixture: true`), for local work and previews |

Both datasets are **private**: nothing is readable without a token, so hidden items (`visible: false`) and drafts never leak through the public API. No CORS origins are configured, because the browser never calls Sanity.

## Tokens

Create them in [sanity.io/manage](https://www.sanity.io/manage/project/njcnsmax) → API → Tokens. Paste each value straight into `.env.local` (locally) or the Vercel project settings, and never anywhere else.

| Variable             | Role   | Used by                               |
| -------------------- | ------ | ------------------------------------- |
| `SANITY_READ_TOKEN`  | Viewer | public reads (`sanity/http.ts`)       |
| `SANITY_WRITE_TOKEN` | Editor | admin writes (Phase 8), `sanity:seed` |

Use one token pair per environment (local, preview, production) so a leaked token can be revoked alone. A Viewer token can read every dataset in the project. If previews must never read `production`, add a custom role scoped to `development`. Custom roles need an Enterprise plan; otherwise accept the risk.

```dotenv
CONTENT_SOURCE=sanity
SANITY_PROJECT_ID=njcnsmax
SANITY_DATASET=development
SANITY_API_VERSION=2026-10-01
SANITY_READ_TOKEN=…
SANITY_WRITE_TOKEN=…
```

## Reads

- `GET /v<apiVersion>/data/query/<dataset>` with `perspective=published`, no CDN (D8, D26). Next's fetch cache is the cache layer: every read carries `content:*` tags and `revalidate: 86400`.
- Queries live in `src/lib/content/sanity/queries.ts`. Projections rename storage fields to schema names; the shared pipeline validates with zod and skips invalid documents (logged with paths, never values).
- Images come back as `asset->{ url, metadata.dimensions, metadata.lqip }` plus `alt` and `hotspot`. `next/image` only allows `https://cdn.sanity.io/images/**`.

## Schema

`sanity/schema.ts` is the Studio-ready schema as plain data (D29). It is deployed to both datasets as the `default` workspace. After changing it:

1. `bun run test src/lib/content/sanity/schema.test.ts` (every field the converter writes must be declared);
2. `bun run sanity:schema` prints the declaration;
3. deploy it to `development` and `production` with Sanity's MCP `deploy_schema` (workspace `default`), or wire `schemaTypes` into a Studio and run `sanity schema deploy`.

To run a Studio later, scaffold one in a separate folder (`bun create sanity@latest`), pass `schemaTypes` from `sanity/schema.ts` to `defineConfig`, and keep it out of the app's dependencies. The admin area (Phase 8) is the intended editor.

## Seeding

```sh
bun run sanity:seed --dry-run                 # convert only, no writes
bun run sanity:seed                           # SANITY_DATASET (development)
bun run sanity:seed --dataset development --reset
bun run sanity:seed --dataset production --force   # never for real content
```

- Writes the Appendix A fixtures (86 documents) in one `createOrReplace` transaction with stable ids, so re-running is idempotent.
- Uploads the 13 images and 2 PDFs from `public/fixtures`. Sanity deduplicates assets by content hash, and only `lqip` metadata is extracted.
- `--reset` deletes documents with `isFixture == true` only, after you type the dataset name in an interactive terminal.
- Refuses `production` without `--force`.

### Live smoke test

After seeding `development`, run `bun run content:smoke`. It reads every repository method in both locales from Sanity and from fixtures, and fails on any difference other than asset URLs, LQIPs and revision metadata, or on any content warning. The repository equality test proves the same offline against `groq-js` (D27); the live run covers the hosted GROQ engine, the auth header and the asset pipeline.

Last run, 2026-10-13, on `development`: 86 documents and 15 assets seeded; re-seeding left the totals unchanged (101 documents, 0 drafts); `content:smoke` passed, with all 24 reads matching.

## Webhook (Phase 8)

`POST /api/revalidate` with `SANITY_WEBHOOK_SECRET`, for edits made outside the admin (e.g. a Studio). It maps the document type to `content:*` tags (`tagsForDocument`) and calls `revalidateTag(tag, { expire: 0 })` (D9). Configure it in sanity.io/manage → API → Webhooks with the projection `{ _type, "slug": slug.current, previousSlugs }`, and filter to the dataset the deployment reads.
