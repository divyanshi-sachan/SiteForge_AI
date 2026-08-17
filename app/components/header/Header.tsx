import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { Logo } from '~/components/ui/Logo';
import { IconButton } from '~/components/ui/IconButton';
import { chatStore } from '~/lib/stores/chat';
import { projectSidebarOpen } from '~/lib/stores/ui';
import { classNames } from '~/utils/classNames';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';

export function Header() {
  const chat = useStore(chatStore);
  const sidebarOpen = useStore(projectSidebarOpen);

  return (
    <header
      className={classNames(
        'flex items-center bg-bolt-elements-background-depth-1 px-4 sm:px-5 border-b h-[var(--header-height)] gap-3 shrink-0',
        {
          'border-transparent': !chat.started,
          'border-bolt-elements-borderColor': chat.started,
        },
      )}
    >
      <div className="flex items-center gap-2 shrink-0">
        <IconButton
          title="Projects"
          icon="i-ph:list"
          onClick={() => projectSidebarOpen.set(!sidebarOpen)}
          className="text-bolt-elements-textSecondary"
        />
        <a href="/" className="flex items-center">
          <Logo size={24} />
        </a>
      </div>

      <span className="flex-1 min-w-0 px-2 text-center text-bolt-elements-textPrimary text-sm font-medium truncate">
        <ClientOnly>{() => <ChatDescription />}</ClientOnly>
      </span>

      {chat.started && (
        <a
          href="/"
          className="hidden sm:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-bolt-elements-borderColor text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-theme shrink-0"
        >
          <div className="i-ph:plus" />
          New Project
        </a>
      )}
    </header>
  );
}
