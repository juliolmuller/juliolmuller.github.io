'use client';

import { Component, type ReactNode } from 'react';

/**
 * A failed geoid must not take down Home. The shell falls back to List.
 */
export class CloudErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: () => void },
  { failed: boolean }
> {
  constructor(props: {
    children: ReactNode;
    fallback: ReactNode;
    onError?: () => void;
  }) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override componentDidCatch(): void {
    this.props.onError?.();
  }

  override render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
