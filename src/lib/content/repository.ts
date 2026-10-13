import type { ContentLocale } from './schema';
import type {
  Contact,
  Education,
  Experience,
  FeaturedLink,
  Practice,
  Profile,
  ProjectLookup,
  ProjectRoute,
  ProjectSummary,
  RecommendedProfile,
  Resume,
  Technology,
} from './types';

/**
 * The only way the app reads content. Every list is visible-only and sorted by
 * `order`; singletons resolve to `null` when missing or invalid.
 */
export interface ContentRepository {
  readonly source: 'sanity' | 'fixtures';

  getProfile(locale: ContentLocale): Promise<Profile | null>;
  getContact(locale: ContentLocale): Promise<Contact | null>;
  getResume(): Promise<Resume | null>;
  getFeaturedLinks(locale: ContentLocale): Promise<FeaturedLink[]>;
  getRecommendedProfiles(locale: ContentLocale): Promise<RecommendedProfile[]>;
  getProjects(locale: ContentLocale): Promise<ProjectSummary[]>;
  /** Resolves current slugs, answers `moved` for previous slugs. */
  getProject(locale: ContentLocale, slug: string): Promise<ProjectLookup>;
  getProjectRoutes(): Promise<ProjectRoute[]>;
  getExperience(locale: ContentLocale): Promise<Experience[]>;
  getEducation(locale: ContentLocale): Promise<Education[]>;
  getTechnologies(locale: ContentLocale): Promise<Technology[]>;
  getPractices(locale: ContentLocale): Promise<Practice[]>;
}
