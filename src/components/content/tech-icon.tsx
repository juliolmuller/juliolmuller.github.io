import { cn } from '@/lib/cn';
import type { TechIcon as TechIconData } from '@/lib/content';

/** Logo (single-tone paths in `currentColor`) or a monogram badge. */
export function TechIcon({
  icon,
  className,
}: {
  icon: TechIconData;
  className?: string;
}) {
  if ('monogram' in icon) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] border border-current font-mono text-[0.5625rem] leading-none font-semibold',
          className,
        )}
      >
        {icon.monogram}
      </span>
    );
  }
  return (
    <svg
      viewBox={icon.viewBox}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      className={cn('size-5 shrink-0', className)}
    >
      {icon.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
