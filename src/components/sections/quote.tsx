import { Reveal } from '@/components/ui/reveal';
import type { Profile } from '@/lib/content';

/** Full-width pull quote between About and Experience; hidden when empty. */
export function Quote({ quote }: { quote: Profile['featuredQuote'] }) {
  if (!quote?.text) return null;
  return (
    <div className="border-y border-line bg-bg-1">
      <Reveal className="container-page py-16 md:py-24">
        <figure className="mx-auto max-w-4xl text-center">
          <span
            aria-hidden="true"
            className="decorative block text-gradient font-serif text-[5rem] leading-[0.6]"
          >
            “
          </span>
          <blockquote className="mt-4 text-[clamp(1.5rem,1.1rem+2vw,2.75rem)] leading-tight font-semibold tracking-[-0.02em] text-balance text-text-1">
            <p>{quote.text}</p>
          </blockquote>
          {quote.attribution ? (
            <figcaption className="mt-6 font-label text-text-3">
              {quote.attribution}
            </figcaption>
          ) : null}
        </figure>
      </Reveal>
    </div>
  );
}
