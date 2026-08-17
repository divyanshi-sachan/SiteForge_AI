import { memo } from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Friendly, non-technical error placeholder. Full technical details should
 * be logged to the console (console.error) by the caller — never shown here.
 */
export const ErrorState = memo(
  ({
    title = "We couldn't finish generating this website.",
    message = 'Something went wrong. You can try again, or keep editing what you have so far.',
    onRetry,
    retryLabel = 'Try Again',
  }: ErrorStateProps) => {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full w-full p-8 gap-3">
        <div className="i-ph:warning-circle-duotone text-4xl text-bolt-elements-icon-error" />
        <h3 className="text-bolt-elements-textPrimary font-medium">{title}</h3>
        <p className="text-bolt-elements-textSecondary text-sm max-w-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white transition-theme"
          >
            {retryLabel}
          </button>
        )}
      </div>
    );
  },
);
