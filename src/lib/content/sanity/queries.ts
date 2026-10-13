/**
 * GROQ projections. They rename Sanity's storage shape (`_id`, `slug.current`,
 * references, asset documents) to the field names of `schema.ts`, so the
 * shared pipeline validates Sanity and fixture reads the same way.
 */

const META = /* groq */ `"id": _id, "rev": _rev, "updatedAt": _updatedAt, isFixture`;

const IMAGE = /* groq */ `"asset": asset->{ url, "width": metadata.dimensions.width, "height": metadata.dimensions.height, "lqip": metadata.lqip }, alt, "focal": hotspot{ x, y }`;

const VISIBLE = /* groq */ `visible != false`;

const TECH_REFS = /* groq */ `*[_type == "technology"]{ "id": _id, visible }`;

export const PROFILE_QUERY = /* groq */ `*[_id == "profile"][0]{
  ${META}, displayName, jobTitle, heroHeadline, heroLead, rotatingWords,
  "photo": photo{ ${IMAGE} },
  bio, location, spokenLanguages, focus,
  metrics[]{ value, label, countTo, prefix, suffix },
  featuredQuote{ text, attribution }
}`;

export const CONTACT_QUERY = /* groq */ `*[_id == "contact"][0]{
  ${META}, email, phone, showPhone, bookingUrl, ctaHeading, ctaText
}`;

export const RESUME_QUERY = /* groq */ `*[_id == "resume"][0]{
  ${META},
  "file": {
    "en": file.en.asset->{ url, size, mimeType },
    "pt": file.pt.asset->{ url, size, mimeType }
  }
}`;

export const FEATURED_LINKS_QUERY = /* groq */ `*[_type == "featuredLink" && ${VISIBLE}] | order(order asc){
  ${META}, label, url, kind, icon, placements, isOwnProfile, order, visible
}`;

export const RECOMMENDED_QUERY = /* groq */ `*[_type == "recommendedProfile" && ${VISIBLE}] | order(order asc){
  ${META}, name, role, note,
  "avatar": avatar{ "asset": asset->{ url, "width": metadata.dimensions.width, "height": metadata.dimensions.height, "lqip": metadata.lqip }, "focal": hotspot{ x, y } },
  url, order, visible
}`;

const PROJECT_SUMMARY = /* groq */ `
  ${META}, "slug": slug.current, previousSlugs, featured, visible, order,
  year, kind, status, "techIds": technologies[]._ref,
  "cover": cover{ ${IMAGE} },
  links{ live, repo },
  title, tagline, summary, role, context, approach, highlights, outcome`;

export const PROJECTS_QUERY = /* groq */ `{
  "projects": *[_type == "project" && ${VISIBLE}] | order(order asc){ ${PROJECT_SUMMARY} },
  "technologies": ${TECH_REFS}
}`;

export const PROJECTS_BY_SLUG_QUERY = /* groq */ `{
  "projects": *[_type == "project" && ${VISIBLE} && (slug.current == $slug || $slug in previousSlugs)] | order(order asc){
    ${PROJECT_SUMMARY},
    "gallery": gallery[]{ ${IMAGE}, caption },
    body
  },
  "technologies": ${TECH_REFS}
}`;

export const EXPERIENCE_QUERY = /* groq */ `{
  "entries": *[_type == "experience" && ${VISIBLE}] | order(order asc){
    ${META}, company, companyUrl, location,
    roles[]{ title, start, end, summary, bullets },
    "techIds": technologies[]._ref,
    collapsedByDefault, order, visible
  },
  "technologies": ${TECH_REFS}
}`;

export const EDUCATION_QUERY = /* groq */ `*[_type == "education" && ${VISIBLE}] | order(order asc){
  ${META}, kind, title, institution, start, end, url, order, visible
}`;

export const TECHNOLOGIES_QUERY = /* groq */ `*[_type == "technology" && ${VISIBLE}] | order(order asc){
  ${META}, name, category, iconSource, iconSlug,
  customSvg{ viewBox, paths }, monogram, brandColor, url, priority, order, visible
}`;

export const PRACTICES_QUERY = /* groq */ `*[_type == "practice" && ${VISIBLE}] | order(order asc){
  ${META}, label, order, visible
}`;
