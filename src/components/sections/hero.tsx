import { ArrowRight, FileText } from 'lucide-react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { CSSProperties } from 'react';

import { LinkIcon } from '@/components/content/link-icon';
import { Monogram } from '@/components/layout/monogram';
import { HeroBackdrop } from '@/components/motion/hero-backdrop';
import { Magnetic } from '@/components/motion/magnetic';
import { RotatingWords } from '@/components/motion/rotating-words';
import { ScrollCue } from '@/components/motion/scroll-cue';
import { ButtonAnchor } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Tooltip } from '@/components/ui/tooltip';
import { owner } from '@/config/site';
import type { AppLocale } from '@/i18n/routing';
import type { Experience, FeaturedLink, Profile } from '@/lib/content';
import { formatList } from '@/lib/format';

import { externalRel } from './links';

const ACCENT_WORDS = 2;
const MAX_HERO_LINKS = 5;

interface HeroProps {
  locale: AppLocale;
  profile: Profile | null;
  links: FeaturedLink[];
  experience: Experience[];
  hasResume: boolean;
}

function Headline({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  const accentFrom = Math.max(0, words.length - ACCENT_WORDS);
  return words.map((word, index) => (
    <span key={`${word}-${index}`}>
      {index > 0 ? ' ' : null}
      <span className="reveal-word">
        <span
          className={index >= accentFrom ? 'text-gradient' : undefined}
          style={{ '--word-index': index } as CSSProperties}
        >
          {word}
        </span>
      </span>
    </span>
  ));
}

export async function Hero({
  locale,
  profile,
  links,
  experience,
  hasResume,
}: HeroProps) {
  const [t, tA11y] = await Promise.all([
    getTranslations('hero'),
    getTranslations('a11y'),
  ]);
  const headline = profile?.heroHeadline ?? owner.name;
  const words = profile?.rotatingWords ?? [];
  const heroLinks = links
    .filter((link) => link.placements.includes('hero'))
    .slice(0, MAX_HERO_LINKS);
  const current = experience
    .flatMap((entry) =>
      entry.roles
        .filter((role) => !role.end)
        .map((role) => ({ title: role.title, company: entry.company })),
    )
    .at(0);
  const photo = profile?.photo;

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col"
    >
      <HeroBackdrop />
      <div className="container-page grid flex-1 items-center gap-10 pt-[calc(var(--header-height)+3rem)] pb-24 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        <div className="lg:order-last">
          <Portrait photo={photo} />
        </div>
        <div className="min-w-0">
          <Chip className="mb-6">
            {t('eyebrow', {
              jobTitle: profile?.jobTitle ?? owner.jobTitle,
              city: profile?.location ?? `${owner.city}, ${owner.country}`,
            })}
          </Chip>
          <h1 id="hero-title" className="max-w-[17ch] text-display">
            <Headline text={headline} />
          </h1>

          {words.length > 0 ? (
            <p className="mt-6 text-h3 font-medium text-text-1">
              <span className="sr-only">
                {t('rotatingSentence', { list: formatList(locale, words) })}
              </span>
              <span aria-hidden="true">{t('rotatingPrefix')} </span>
              <RotatingWords words={words} className="text-gradient" />
            </p>
          ) : null}

          {profile?.heroLead ? (
            <p className="mt-5 max-w-[60ch] text-[1.0625rem] text-text-2 lg:text-lg">
              {profile.heroLead}
            </p>
          ) : null}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <ButtonAnchor href="#work">
                {t('seeWork')}
                <ArrowRight
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover/button:translate-x-0.5"
                />
              </ButtonAnchor>
            </Magnetic>
            <ButtonAnchor href="#contact" variant="secondary">
              {t('getInTouch')}
            </ButtonAnchor>
            {hasResume ? (
              <a
                href={`/${locale}/resume`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-small text-text-2 underline-offset-4 hover-fine:text-text-1 hover-fine:underline"
              >
                <FileText aria-hidden="true" className="size-4" />
                {t('resume')}
              </a>
            ) : null}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-4">
            {heroLinks.length > 0 ? (
              <ul
                aria-label={t('linksLabel')}
                className="flex items-center gap-1"
              >
                {heroLinks.map((link) => (
                  <li key={link.id}>
                    <Tooltip content={link.label} side="bottom">
                      <a
                        href={link.url}
                        target="_blank"
                        rel={externalRel(link.isOwnProfile)}
                        aria-label={`${link.label} ${tA11y('opensInNewTab')}`}
                        className="inline-flex size-11 items-center justify-center rounded-full border border-line text-text-2 transition-colors hover-fine:border-line-strong hover-fine:bg-surface-1 hover-fine:text-text-1"
                      >
                        <LinkIcon
                          icon={link.icon}
                          className="size-[1.125rem]"
                        />
                      </a>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            ) : null}
            {current ? (
              <p className="inline-flex items-center gap-2 font-mono text-[0.8125rem] text-text-2">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-term-green shadow-[0_0_10px_rgb(74_222_128/0.6)]"
                />
                {t('currentRole', current)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
        <ScrollCue href="#about" label={t('scrollCue')} />
      </div>
    </section>
  );
}

function Portrait({ photo }: { photo: Profile['photo'] }) {
  return (
    <div className="relative size-20 shrink-0 rounded-lg bg-gradient-accent p-[2px] shadow-[0_20px_60px_-20px_rgb(139_124_255/0.55)] lg:size-72 lg:rounded-xl xl:size-80">
      {photo ? (
        <Image
          src={photo.url}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          sizes="(min-width: 1280px) 320px, (min-width: 1024px) 288px, 80px"
          loading="eager"
          fetchPriority="high"
          placeholder={photo.lqip ? 'blur' : 'empty'}
          blurDataURL={photo.lqip}
          className="size-full rounded-[inherit] bg-surface-1 object-cover"
          style={
            photo.focal
              ? {
                  objectPosition: `${photo.focal.x * 100}% ${photo.focal.y * 100}%`,
                }
              : undefined
          }
        />
      ) : (
        <div className="flex size-full items-center justify-center rounded-[inherit] bg-surface-1">
          <Monogram className="size-1/2" />
        </div>
      )}
    </div>
  );
}
