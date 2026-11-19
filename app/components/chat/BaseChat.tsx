import type { Message } from 'ai';
import React, { type RefCallback } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { ProjectSidebar } from '~/components/sidebar/ProjectSidebar.client';
import { Workbench } from '~/components/workbench/Workbench.client';
import { useStore } from '@nanostores/react';
import { mobileActiveTab } from '~/lib/stores/ui';
import { classNames } from '~/utils/classNames';
import { AiConversation } from './AIConversation';
import { MobileTabBar } from './MobileTabBar';
import { NewProjectScreen } from './NewProjectScreen';

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
}

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      chatStarted = false,
      isStreaming = false,
      enhancingPrompt = false,
      promptEnhanced = false,
      messages,
      input = '',
      sendMessage,
      handleInputChange,
      enhancePrompt,
      handleStop,
    },
    ref,
  ) => {
    return (
      <div ref={ref} className="relative flex h-full w-full overflow-hidden">
        <ClientOnly>{() => <ProjectSidebar />}</ClientOnly>

        {!chatStarted ? (
          <div className="flex flex-col h-full w-full">
            <NewProjectScreen
              textareaRef={textareaRef}
              input={input}
              isStreaming={isStreaming}
              enhancingPrompt={enhancingPrompt}
              promptEnhanced={promptEnhanced}
              onInputChange={handleInputChange}
              onSubmit={sendMessage}
              onEnhance={enhancePrompt}
              onPickExample={(prompt) => {
                handleInputChange?.({ target: { value: prompt } } as React.ChangeEvent<HTMLTextAreaElement>);
              }}
            />
          </div>
        ) : (
          <ClientOnly>
            {() => (
              <BuilderWorkspace
                textareaRef={textareaRef}
                messageRef={messageRef}
                scrollRef={scrollRef}
                isStreaming={isStreaming}
                messages={messages}
                input={input}
                enhancingPrompt={enhancingPrompt}
                promptEnhanced={promptEnhanced}
                handleInputChange={handleInputChange}
                sendMessage={sendMessage}
                handleStop={handleStop}
                enhancePrompt={enhancePrompt}
              />
            )}
          </ClientOnly>
        )}
      </div>
    );
  },
);

type BuilderWorkspaceProps = Omit<BaseChatProps, 'showChat' | 'chatStarted'>;

function BuilderWorkspace({
  textareaRef,
  messageRef,
  scrollRef,
  isStreaming,
  messages,
  input = '',
  enhancingPrompt,
  promptEnhanced,
  handleInputChange,
  sendMessage,
  handleStop,
  enhancePrompt,
}: BuilderWorkspaceProps) {
  const activeTab = useStore(mobileActiveTab);

  return (
    <div className="flex flex-col md:flex-row w-full h-full min-h-0 gap-3 p-3 md:p-4 md:pt-2">
      <div
        className={classNames(
          'flex-col min-h-0 md:flex md:w-[380px] lg:w-[420px] md:shrink-0 glass rounded-2xl overflow-hidden',
          {
            flex: activeTab === 'ai',
            hidden: activeTab !== 'ai',
          },
        )}
      >
        <AiConversation
          textareaRef={textareaRef}
          messageRef={messageRef}
          scrollRef={scrollRef}
          isStreaming={isStreaming}
          messages={messages}
          input={input}
          enhancingPrompt={enhancingPrompt}
          promptEnhanced={promptEnhanced}
          onInputChange={handleInputChange}
          onSubmit={sendMessage}
          onStop={handleStop}
          onEnhance={enhancePrompt}
        />
      </div>

      <div
        className={classNames('flex-1 min-h-0 min-w-0 md:flex glass rounded-2xl overflow-hidden', {
          flex: activeTab !== 'ai',
          hidden: activeTab === 'ai',
        })}
      >
        <Workbench isStreaming={isStreaming} />
      </div>

      <MobileTabBar className="md:hidden" />
    </div>
  );
}
