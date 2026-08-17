import { useStore } from '@nanostores/react';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { chatId, db, description } from './useChatHistory';
import { updateChatDescription } from './db';

/**
 * Displays the current project name in the header. Click to rename — the
 * change is saved to local history immediately.
 */
export function ChatDescription() {
  const currentDescription = useStore(description);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(currentDescription ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!currentDescription) {
    return null;
  }

  const startEditing = () => {
    setDraft(currentDescription);
    setIsEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const commit = async () => {
    setIsEditing(false);

    const trimmed = draft.trim();

    if (!trimmed || trimmed === currentDescription) {
      return;
    }

    description.set(trimmed);

    const id = chatId.get();

    if (db && id) {
      try {
        await updateChatDescription(db, id, trimmed);
      } catch {
        toast.error('Failed to rename project');
      }
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        className="bg-transparent text-center outline-none border-b border-bolt-elements-borderColorActive text-bolt-elements-textPrimary max-w-full"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          } else if (event.key === 'Escape') {
            setIsEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      title="Rename project"
      onClick={startEditing}
      className="truncate max-w-full hover:text-bolt-elements-textSecondary transition-theme"
    >
      {currentDescription}
    </button>
  );
}
