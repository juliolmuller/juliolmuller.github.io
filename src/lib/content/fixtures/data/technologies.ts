import type { DocumentInput, TechCategory } from '../../schema';
import { meta } from '../helpers';

type Icon =
  | { iconSource: 'simple-icons'; iconSlug: string }
  | { iconSource: 'devicon'; iconSlug: string }
  | { iconSource: 'monogram'; monogram?: string };

interface Entry {
  name: string;
  priority: 1 | 2 | 3;
  icon: Icon;
  url: string;
  brandColor?: string;
}

const si = (iconSlug: string): Icon => ({
  iconSource: 'simple-icons',
  iconSlug,
});
const devicon = (iconSlug: string): Icon => ({
  iconSource: 'devicon',
  iconSlug,
});
const monogram = (text?: string): Icon => ({
  iconSource: 'monogram',
  ...(text ? { monogram: text } : {}),
});

/** Appendix C, audited in D13. Real technologies, not claims about anyone. */
const inventory: Record<TechCategory, Entry[]> = {
  language: [
    {
      name: 'JavaScript',
      priority: 1,
      icon: si('javascript'),
      url: 'https://developer.mozilla.org/docs/Web/JavaScript',
    },
    {
      name: 'TypeScript',
      priority: 1,
      icon: si('typescript'),
      url: 'https://www.typescriptlang.org',
    },
    {
      name: 'SQL',
      priority: 1,
      icon: monogram(),
      url: 'https://en.wikipedia.org/wiki/SQL',
    },
    {
      name: 'HTML',
      priority: 1,
      icon: si('html5'),
      url: 'https://html.spec.whatwg.org',
    },
    {
      name: 'CSS',
      priority: 1,
      icon: si('css'),
      url: 'https://www.w3.org/Style/CSS/',
    },
    { name: 'Go', priority: 2, icon: si('go'), url: 'https://go.dev' },
    {
      name: 'Java',
      priority: 2,
      icon: devicon('java'),
      url: 'https://dev.java',
      brandColor: '#f89820',
    },
    { name: 'PHP', priority: 2, icon: si('php'), url: 'https://www.php.net' },
    {
      name: 'Python',
      priority: 2,
      icon: si('python'),
      url: 'https://www.python.org',
    },
    { name: 'Lua', priority: 2, icon: si('lua'), url: 'https://www.lua.org' },
    {
      name: 'Ruby',
      priority: 3,
      icon: si('ruby'),
      url: 'https://www.ruby-lang.org',
    },
    {
      name: 'VBA',
      priority: 3,
      icon: monogram(),
      url: 'https://learn.microsoft.com/office/vba/api/overview/',
    },
  ],
  frontend: [
    { name: 'React', priority: 1, icon: si('react'), url: 'https://react.dev' },
    {
      name: 'Vue.js',
      priority: 1,
      icon: si('vuedotjs'),
      url: 'https://vuejs.org',
    },
    {
      name: 'Next.js',
      priority: 1,
      icon: si('nextdotjs'),
      url: 'https://nextjs.org',
    },
    { name: 'Nuxt', priority: 2, icon: si('nuxt'), url: 'https://nuxt.com' },
    {
      name: 'Zustand',
      priority: 3,
      icon: devicon('zustand'),
      url: 'https://zustand.docs.pmnd.rs',
      brandColor: '#b39069',
    },
    {
      name: 'TanStack Query',
      priority: 3,
      icon: si('reactquery'),
      url: 'https://tanstack.com/query',
    },
    {
      name: 'AngularJS',
      priority: 3,
      icon: devicon('angularjs'),
      url: 'https://angularjs.org',
      brandColor: '#e23237',
    },
  ],
  backend: [
    {
      name: 'Node.js',
      priority: 1,
      icon: si('nodedotjs'),
      url: 'https://nodejs.org',
    },
    {
      name: 'Express',
      priority: 1,
      icon: si('express'),
      url: 'https://expressjs.com',
    },
    {
      name: 'GraphQL',
      priority: 1,
      icon: si('graphql'),
      url: 'https://graphql.org',
    },
    {
      name: 'Fastify',
      priority: 2,
      icon: si('fastify'),
      url: 'https://fastify.dev',
    },
    {
      name: 'NestJS',
      priority: 2,
      icon: si('nestjs'),
      url: 'https://nestjs.com',
    },
    {
      name: 'Prisma',
      priority: 2,
      icon: si('prisma'),
      url: 'https://www.prisma.io',
    },
    {
      name: 'gRPC',
      priority: 2,
      icon: devicon('grpc'),
      url: 'https://grpc.io',
      brandColor: '#2da6b0',
    },
    {
      name: 'Swagger / OpenAPI',
      priority: 3,
      icon: si('swagger'),
      url: 'https://www.openapis.org',
    },
  ],
  data: [
    {
      name: 'PostgreSQL',
      priority: 1,
      icon: si('postgresql'),
      url: 'https://www.postgresql.org',
    },
    { name: 'Redis', priority: 1, icon: si('redis'), url: 'https://redis.io' },
    {
      name: 'MongoDB',
      priority: 2,
      icon: si('mongodb'),
      url: 'https://www.mongodb.com',
    },
    {
      name: 'RabbitMQ',
      priority: 2,
      icon: si('rabbitmq'),
      url: 'https://www.rabbitmq.com',
    },
    {
      name: 'Google Cloud Pub/Sub',
      priority: 2,
      icon: si('googlepubsub'),
      url: 'https://cloud.google.com/pubsub',
    },
    {
      name: 'BigQuery',
      priority: 2,
      icon: si('googlebigquery'),
      url: 'https://cloud.google.com/bigquery',
    },
  ],
  cloud: [
    {
      name: 'AWS',
      priority: 1,
      icon: devicon('amazonwebservices'),
      url: 'https://aws.amazon.com',
      brandColor: '#ff9900',
    },
    {
      name: 'Google Cloud',
      priority: 1,
      icon: si('googlecloud'),
      url: 'https://cloud.google.com',
    },
    {
      name: 'Docker',
      priority: 1,
      icon: si('docker'),
      url: 'https://www.docker.com',
    },
    { name: 'Git', priority: 1, icon: si('git'), url: 'https://git-scm.com' },
    {
      name: 'GitHub',
      priority: 1,
      icon: si('github'),
      url: 'https://github.com',
    },
    {
      name: 'Kubernetes',
      priority: 2,
      icon: si('kubernetes'),
      url: 'https://kubernetes.io',
    },
    {
      name: 'Datadog',
      priority: 3,
      icon: si('datadog'),
      url: 'https://www.datadoghq.com',
    },
  ],
  integration: [
    {
      name: 'Okta',
      priority: 2,
      icon: si('okta'),
      url: 'https://www.okta.com',
    },
    {
      name: 'Stripe',
      priority: 2,
      icon: si('stripe'),
      url: 'https://stripe.com',
    },
    { name: 'SAP', priority: 3, icon: si('sap'), url: 'https://www.sap.com' },
    {
      name: 'Excel / Power Query',
      priority: 3,
      icon: monogram('XL'),
      url: 'https://learn.microsoft.com/power-query/',
      brandColor: '#217346',
    },
    {
      name: 'Power BI',
      priority: 3,
      icon: monogram('BI'),
      url: 'https://www.microsoft.com/power-platform/products/power-bi',
      brandColor: '#f2c811',
    },
    {
      name: 'SharePoint',
      priority: 3,
      icon: monogram(),
      url: 'https://www.microsoft.com/microsoft-365/sharepoint/collaboration',
      brandColor: '#0078d4',
    },
  ],
};

export const technologies: DocumentInput<'technology'>[] = Object.entries(
  inventory,
).flatMap(([category, entries], categoryIndex) =>
  entries.map((entry, index) => ({
    ...meta('technology', entry.name),
    name: entry.name,
    category: category as TechCategory,
    ...entry.icon,
    priority: entry.priority,
    url: entry.url,
    ...(entry.brandColor ? { brandColor: entry.brandColor } : {}),
    order: (categoryIndex + 1) * 100 + index * 10,
    visible: true,
  })),
);
