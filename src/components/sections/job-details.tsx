'use client';

import { type ReactNode, type ToggleEvent, useState } from 'react';

/** Uncontrolled-feeling `<details>` that can start open (D46). */
export function JobDetails({
  openByDefault,
  className,
  children,
}: {
  openByDefault: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(openByDefault);

  function onToggle(event: ToggleEvent<HTMLDetailsElement>) {
    setOpen(event.currentTarget.open);
  }

  return (
    <details className={className} open={open} onToggle={onToggle}>
      {children}
    </details>
  );
}
