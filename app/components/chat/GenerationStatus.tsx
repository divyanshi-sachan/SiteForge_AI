import { memo } from 'react';

interface GenerationStatusProps {
  hasArtifact: boolean;
  hasPreview: boolean;
}

/**
 * Friendly status line shown while the AI is working, mapped to real
 * generation state (no fabricated progress percentages).
 */
export const GenerationStatus = memo(({ hasArtifact, hasPreview }: GenerationStatusProps) => {
  const label = !hasArtifact
    ? 'Understanding your request...'
    : !hasPreview
      ? 'Building your website...'
      : 'Updating your website...';

  return (
    <div className="flex items-center gap-2 text-bolt-elements-textSecondary text-sm w-full py-2">
      <div className="i-svg-spinners:3-dots-fade text-xl text-bolt-elements-loader-progress shrink-0" />
      {label}
    </div>
  );
});
