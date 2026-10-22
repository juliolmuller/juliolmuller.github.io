import { cn } from '@/lib/cn';
import type { TechIcon } from '@/lib/content/types';
import { cloudIconFill } from '@/lib/tech-cloud/geoid';

function attr(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;');
}

/** Rasterizable SVG mark — `<img>` matches the prototype and stays on-origin. */
function svgDataUri(viewBox: string, paths: readonly string[], fill: string) {
  const body = paths
    .map((d) => `<path d="${attr(d)}" fill="${attr(fill)}"/>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${attr(viewBox)}">${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Brand-colored glyph for the geoid (D37). List view keeps single-tone TechIcon. */
export function CloudMark({
  icon,
  brandColor,
  className,
}: {
  icon: TechIcon;
  brandColor?: string;
  className?: string;
}) {
  const fill = cloudIconFill(brandColor);
  if ('monogram' in icon) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex size-8 items-center justify-center rounded-[6px] border border-current font-mono text-[0.625rem] leading-none font-semibold max-[640px]:size-7',
          className,
        )}
        style={{ color: fill }}
      >
        {icon.monogram}
      </span>
    );
  }
  return (
    // next/image rejects data: URIs; a data-URI <img> rasterizes once like the prototype.
    // eslint-disable-next-line @next/next/no-img-element -- D37 geoid compositor path
    <img
      src={svgDataUri(icon.viewBox, icon.paths, fill)}
      alt=""
      draggable={false}
      className={cn('size-8 object-contain max-[640px]:size-7', className)}
    />
  );
}
