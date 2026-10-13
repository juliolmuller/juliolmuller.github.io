/**
 * Placeholder art rendered by `scripts/generate-fixtures.ts` into
 * `public/fixtures/`. Abstract only: no text, logos or fake UI screenshots.
 */

export type FixtureArtStyle = 'cover' | 'avatar' | 'portrait';

export interface FixtureImageSpec {
  key: string;
  style: FixtureArtStyle;
  width: number;
  height: number;
}

const cover = (key: string): FixtureImageSpec => ({
  key,
  style: 'cover',
  width: 1600,
  height: 1000,
});

const avatar = (key: string): FixtureImageSpec => ({
  key,
  style: 'avatar',
  width: 256,
  height: 256,
});

export const fixtureImageSpecs = [
  { key: 'profile-photo', style: 'portrait', width: 800, height: 800 },
  avatar('avatar-ada-sample'),
  avatar('avatar-marco-placeholder'),
  avatar('avatar-lin-example'),
  avatar('avatar-sofia-demo'),
  cover('project-orbit-dashboard-cover'),
  cover('project-orbit-dashboard-gallery-1'),
  cover('project-orbit-dashboard-gallery-2'),
  cover('project-orbit-dashboard-gallery-3'),
  cover('project-pocket-ledger-cover'),
  cover('project-tidy-desk-cover'),
  cover('project-pay-bridge-cover'),
  cover('project-lint-kit-cover'),
] as const satisfies readonly FixtureImageSpec[];

export type FixtureImageKey = (typeof fixtureImageSpecs)[number]['key'];

export const fixturePdfKeys = ['resume-en', 'resume-pt'] as const;
export type FixturePdfKey = (typeof fixturePdfKeys)[number];
