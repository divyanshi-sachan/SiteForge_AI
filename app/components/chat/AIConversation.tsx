import { useStore } from '@nanostores/react';
import type { Message } from 'ai';
import { computed } from 'nanostores';
import React, { type RefCallback, useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { REFINE_PLACEHOLDER } from '~/utils/brand';
import { Messages } from './Messages.client';
import { PromptComposer } from './PromptComposer';

interface AiConversationProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  messageRef?: RefCallback<HTMLDivElement>;
  scrollRef?: RefCallback<HTMLDivElement>;
  isStreaming?: boolean;
  messages?: Message[];
  input: string;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  onInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: (event: React.UIEvent) => void;
  onStop?: () => void;
  onEnhance?: () => void;
}

export function AiConversation({
  textareaRef,
  messageRef,
  scrollRef,
  isStreaming = false,
  messages,
  input,
  enhancingPrompt,
  promptEnhanced,
  onInputChange,
  onSubmit,
  onStop,
  onEnhance,
}: AiConversationProps) {
  const hasPreview = useStore(computed(workbenchStore.previews, (previews) => previews.length > 0));
  const [everBuilt, setEverBuilt] = useState(false);

  useEffect(() => {
    if (hasPreview) {
      setEverBuilt(true);
    }
  }, [hasPreview]);

  const status = !isStreaming ? 'Ready' : everBuilt ? 'Updating website...' : 'Generating...';

  return (
    <div className="flex flex-col h-full min-w-0">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-bolt-elements-borderColor shrink-0">
        <span className="font-medium text-bolt-elements-textPrimary">AI Designer</span>
        <span
          className={classNames('flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ml-auto', {
            'text-bolt-elements-icon-success bg-bolt-elements-item-backgroundDefault': !isStreaming,
            'text-bolt-elements-item-contentAccent bg-bolt-elements-item-backgroundAccent': isStreaming,
          })}
        >
          {isStreaming && <span className="i-svg-spinners:3-dots-fade text-sm" />}
          {status}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <ClientOnly>
          {() => (
            <Messages ref={messageRef} className="flex flex-col w-full" messages={messages} isStreaming={isStreaming} />
          )}
        </ClientOnly>
      </div>

      <div className="p-3 border-t border-bolt-elements-borderColor shrink-0">
        <PromptComposer
          variant="compact"
          textareaRef={textareaRef}
          input={input}
          placeholder={REFINE_PLACEHOLDER}
          isStreaming={isStreaming}
          enhancingPrompt={enhancingPrompt}
          promptEnhanced={promptEnhanced}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          onStop={onStop}
          onEnhance={onEnhance}
        />
      </div>
    </div>
  );
}
