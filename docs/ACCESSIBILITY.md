# Accessibility

Target: WCAG 2.2 AA (AAA contrast on body text where it is cheap). The public statement lives at `/{locale}/accessibility`.

## Automated

- `eslint-plugin-jsx-a11y` (strict) in CI.
- `@axe-core/playwright` on Home (menu open), `/projects`, a project detail (lightbox open) and `/accessibility`, both locales, Chromium. WebKit is skipped (D23). Pending `Reveal` nodes are excluded (D36).
- Token contrast is unit-tested (`src/styles/tokens.test.ts`).

## Manual checklist (Phase 9)

Run once before launch, and after any large UI change.

| Flow                                      | NVDA + Firefox | VoiceOver + Safari (macOS) | VoiceOver + Safari (iOS) | TalkBack + Chrome |
| ----------------------------------------- | -------------- | -------------------------- | ------------------------ | ----------------- |
| Home: skip link, nav, language switch     |                |                            |                          |                   |
| Project filter and pagination (no JS too) |                |                            |                          |                   |
| Project detail, gallery lightbox          |                |                            |                          |                   |
| Reduced motion + Pause animations         |                |                            |                          |                   |
| 200% / 400% zoom, forced-colors           |                |                            |                          |                   |

Known limitations are listed on the statement page: decorative motion has no text equivalent, and linked third-party sites are outside this standard.
