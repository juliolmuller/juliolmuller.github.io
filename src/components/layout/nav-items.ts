export const NAV_SECTIONS = [
  'about',
  'experience',
  'stack',
  'work',
  'contact',
] as const;

export type NavSection = (typeof NAV_SECTIONS)[number];
