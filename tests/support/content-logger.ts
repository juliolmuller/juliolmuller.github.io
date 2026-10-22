import type { ContentLogger } from '@/lib/content/log';

export interface RecordedWarning {
  event: string;
  details: Record<string, unknown>;
}

export function createRecordingLogger(): ContentLogger & {
  warnings: RecordedWarning[];
} {
  const warnings: RecordedWarning[] = [];
  return {
    warnings,
    warn(event, details) {
      warnings.push({ event, details });
    },
  };
}
