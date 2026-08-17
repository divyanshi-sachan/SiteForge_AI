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
      <div className="w-full max-w-2xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold text-bolt-elements-textPrimary mb-3 tracking-tight">
          What do you want to build?
        </h1>
        <p className="text-bolt-elements-textSecondary mb-8 text-base sm:text-lg">
          Describe your website and AI will design and build it for you.
        </p>

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

        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {EXAMPLE_PROMPT_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => onPickExample?.(chip.prompt)}
              className="text-sm px-3 py-1.5 rounded-full border border-bolt-elements-borderColor text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:border-bolt-elements-borderColorActive transition-theme bg-bolt-elements-background-depth-1"
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
