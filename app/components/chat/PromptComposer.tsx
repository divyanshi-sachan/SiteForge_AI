import React from 'react';
import { IconButton } from '~/components/ui/IconButton';
import { classNames } from '~/utils/classNames';

interface PromptComposerProps {
  variant?: 'hero' | 'compact';
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  input: string;
  placeholder: string;
  isStreaming?: boolean;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  submitLabel?: string;
  onInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: (event: React.UIEvent) => void;
  onStop?: () => void;
  onEnhance?: () => void;
}

const MIN_HEIGHT = { hero: 88, compact: 56 };
const MAX_HEIGHT = { hero: 220, compact: 200 };

export function PromptComposer({
  variant = 'compact',
  textareaRef,
  input,
  placeholder,
  isStreaming = false,
  enhancingPrompt = false,
  promptEnhanced = false,
  submitLabel,
  onInputChange,
  onSubmit,
  onStop,
  onEnhance,
}: PromptComposerProps) {
  const isHero = variant === 'hero';
  const canSubmit = input.trim().length > 0 && !isStreaming;

  return (
    <div
      className={classNames(
        'w-full border border-bolt-elements-borderColor bg-bolt-elements-prompt-background backdrop-filter backdrop-blur-[8px] overflow-hidden transition-theme',
        isHero ? 'rounded-2xl shadow-lg' : 'rounded-xl shadow-sm',
      )}
    >
      <textarea
        ref={textareaRef}
        className={classNames(
          'w-full pl-4 pt-4 pr-4 focus:outline-none resize-none bg-transparent text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary',
          isHero ? 'text-lg pb-2' : 'text-sm pb-1',
        )}
        style={{
          minHeight: MIN_HEIGHT[variant],
          maxHeight: MAX_HEIGHT[variant],
        }}
        value={input}
        placeholder={placeholder}
        translate="no"
        onChange={onInputChange}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit?.(event);
          }
        }}
      />
      <div className="flex items-center justify-between gap-2 px-3 pb-3">
        <button
          type="button"
          title="Enhance prompt"
          disabled={input.length === 0 || enhancingPrompt}
          onClick={onEnhance}
          className={classNames(
            'flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-theme disabled:opacity-40 disabled:cursor-not-allowed',
            promptEnhanced
              ? 'text-bolt-elements-item-contentAccent bg-bolt-elements-item-backgroundAccent'
              : 'text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive',
          )}
        >
          {enhancingPrompt ? (
            <>
              <div className="i-svg-spinners:90-ring-with-bg text-base" />
              Enhancing...
            </>
          ) : (
            <>
              <div className="i-ph:sparkle text-base" />
              {promptEnhanced ? 'Prompt enhanced' : 'Enhance prompt'}
            </>
          )}
        </button>

        {isHero ? (
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-theme"
          >
            {submitLabel ?? 'Generate Website'}
            <div className="i-ph:arrow-right text-base" />
          </button>
        ) : (
          <IconButton
            title={isStreaming ? 'Stop' : 'Send message'}
            disabled={!isStreaming && input.length === 0}
            className={classNames(
              'rounded-lg',
              !isStreaming && input.length > 0
                ? 'bg-accent-500 hover:bg-accent-600 text-white'
                : 'text-bolt-elements-textTertiary',
            )}
            onClick={(event) => {
              if (isStreaming) {
                onStop?.();
                return;
              }

              onSubmit?.(event);
            }}
          >
            <div className={isStreaming ? 'i-ph:stop-fill' : 'i-ph:arrow-up-bold'} />
          </IconButton>
        )}
      </div>
    </div>
  );
}
