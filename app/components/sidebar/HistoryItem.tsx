import * as Dialog from '@radix-ui/react-dialog';
import { formatDistanceToNow } from 'date-fns';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { db, updateChatDescription, type ChatHistoryItem } from '~/lib/persistence';

interface HistoryItemProps {
  item: ChatHistoryItem;
  onDelete?: (event: React.UIEvent) => void;
  onRenamed?: () => void;
}

export function HistoryItem({ item, onDelete, onRenamed }: HistoryItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draft, setDraft] = useState(item.description ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const commitRename = async () => {
    setIsRenaming(false);

    const trimmed = draft.trim();

    if (!trimmed || trimmed === item.description || !db) {
      return;
    }

    try {
      await updateChatDescription(db, item.id, trimmed);
      onRenamed?.();
    } catch {
      toast.error('Failed to rename project');
    }
  };

  return (
    <div className="group rounded-lg text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 overflow-hidden px-2.5 py-2 transition-theme">
      {isRenaming ? (
        <input
          ref={inputRef}
          autoFocus
          className="w-full bg-transparent outline-none border-b border-bolt-elements-borderColorActive text-bolt-elements-textPrimary text-sm"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitRename}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitRename();
            } else if (event.key === 'Escape') {
              setIsRenaming(false);
              setDraft(item.description ?? '');
            }
          }}
        />
      ) : (
        <a href={`/chat/${item.urlId}`} className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm">{item.description}</div>
            <div className="text-xs text-bolt-elements-textTertiary mt-0.5">
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </div>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0 transition-theme">
            <button
              className="i-ph:pencil-simple text-base p-1 rounded hover:bg-bolt-elements-item-backgroundActive"
              title="Rename"
              onClick={(event) => {
                event.preventDefault();
                setDraft(item.description ?? '');
                setIsRenaming(true);
                requestAnimationFrame(() => inputRef.current?.select());
              }}
            />
            <Dialog.Trigger asChild>
              <button
                className="i-ph:trash text-base p-1 rounded hover:bg-bolt-elements-item-backgroundDanger hover:text-bolt-elements-item-contentDanger"
                title="Delete"
                onClick={(event) => {
                  event.preventDefault();
                  onDelete?.(event);
                }}
              />
            </Dialog.Trigger>
          </div>
        </a>
      )}
    </div>
  );
}
