import { useStore } from '@nanostores/react';
import type { Message } from 'ai';
import { computed } from 'nanostores';
import React from 'react';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { AssistantMessage } from './AssistantMessage';
import { GenerationStatus } from './GenerationStatus';
import { UserMessage } from './UserMessage';

interface MessagesProps {
  id?: string;
  className?: string;
  isStreaming?: boolean;
  messages?: Message[];
}

export const Messages = React.forwardRef<HTMLDivElement, MessagesProps>((props: MessagesProps, ref) => {
  const { id, isStreaming = false, messages = [] } = props;

  const hasArtifact = useStore(computed(workbenchStore.artifacts, (artifacts) => Object.keys(artifacts).length > 0));
  const hasPreview = useStore(computed(workbenchStore.previews, (previews) => previews.length > 0));

  return (
    <div id={id} ref={ref} className={props.className}>
      {messages.length > 0
        ? messages.map((message, index) => {
            const { role, content } = message;
            const isUserMessage = role === 'user';
            const isFirst = index === 0;

            if (isUserMessage) {
              return (
                <div key={index} className={classNames('flex justify-end w-full', { 'mt-6': !isFirst })}>
                  <div className="max-w-[85%] bg-bolt-elements-item-backgroundAccent text-bolt-elements-textPrimary rounded-2xl rounded-tr-md px-4 py-3">
                    <UserMessage content={content} />
                  </div>
                </div>
              );
            }

            return (
              <div key={index} className={classNames('flex w-full', { 'mt-6': !isFirst })}>
                <div className="grid grid-col-1 w-full">
                  <AssistantMessage content={content} />
                </div>
              </div>
            );
          })
        : null}
      {isStreaming && <GenerationStatus hasArtifact={hasArtifact} hasPreview={hasPreview} />}
    </div>
  );
});
