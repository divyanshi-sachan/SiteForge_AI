import React from 'react';
import { EXAMPLE_PROMPT_CHIPS, NEW_PROJECT_PLACEHOLDER } from '~/utils/brand';
import { PromptComposer } from './PromptComposer';

interface NewProjectScreenProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  input: string;
  isStreaming?: boolean;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  onInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: (event: React.UIEvent, messageInput?: string) => void;
  onEnhance?: () => void;
  onPickExample?: (prompt: string) => void;
}

export function NewProjectScreen({
  textareaRef,
  input,
  isStreaming,
  enhancingPrompt,
  promptEnhanced,
  onInputChange,
  onSubmit,
  onEnhance,
  onPickExample,
}: NewProjectScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 glass-pill rounded-full px-3.5 py-1 text-xs text-bolt-elements-textSecondary mb-6">
          <span className="i-ph:sparkle-fill text-bolt-elements-textPrimary" />
          AI website builder
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-bolt-elements-textPrimary mb-4 tracking-tight">
          What do you want to build?
        </h1>
        <p className="text-bolt-elements-textSecondary mb-8 text-base sm:text-lg">
          Describe your website and AI will design and build it for you.
        </p>

        <div className="max-w-2xl mx-auto">
          <PromptComposer
            variant="hero"
            textareaRef={textareaRef}
            input={input}
            placeholder={NEW_PROJECT_PLACEHOLDER}
            isStreaming={isStreaming}
            enhancingPrompt={enhancingPrompt}
            promptEnhanced={promptEnhanced}
            submitLabel="Generate Website"
            onInputChange={onInputChange}
            onSubmit={onSubmit}
            onEnhance={onEnhance}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {EXAMPLE_PROMPT_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => onPickExample?.(chip.prompt)}
              className="text-sm px-3.5 py-1.5 rounded-full glass-pill text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:-translate-y-0.5 transition-all duration-150"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-bolt-elements-textTertiary mt-6">
          Describe your business, style, pages and features.
        </p>
      </div>
    </div>
  );
}
