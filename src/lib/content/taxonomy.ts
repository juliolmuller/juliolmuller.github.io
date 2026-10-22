/** Client-safe category ids. Keep this file free of zod and `server-only`. */

export const techCategories = [
  'language',
  'frontend',
  'backend',
  'data',
  'cloud',
  'integration',
  'ai',
] as const;

export type TechCategory = (typeof techCategories)[number];
