export const TITLE_MAX = 60;
export const DESCRIPTION_MIN = 70;
export const DESCRIPTION_MAX = 160;

/** Collapses whitespace and strips Markdown emphasis, links and code marks. */
export function plainText(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cuts at a word boundary and adds an ellipsis when over `max`. */
export function truncate(text: string, max: number) {
  const clean = plainText(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const boundary = cut.lastIndexOf(' ');
  const base = boundary > 0 ? cut.slice(0, boundary) : cut;
  return `${base.replace(/[\s,;:.–—-]+$/, '')}…`;
}

/**
 * First candidate that reaches the minimum length, truncated to the maximum.
 * Falls back to the longest candidate, so a description is never empty.
 */
export function pickDescription(...candidates: (string | undefined)[]) {
  const texts = candidates
    .filter((text): text is string => Boolean(text?.trim()))
    .map(plainText);
  const good = texts.find((text) => text.length >= DESCRIPTION_MIN);
  const chosen =
    good ?? texts.reduce((a, b) => (b.length > a.length ? b : a), '');
  return truncate(chosen, DESCRIPTION_MAX);
}
