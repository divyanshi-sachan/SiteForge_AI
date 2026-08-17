import { useStore } from '@nanostores/react';
import { mobileActiveTab, type MobileTab } from '~/lib/stores/ui';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';

const TABS: { id: MobileTab; label: string; icon: string }[] = [
  { id: 'ai', label: 'AI', icon: 'i-ph:chat-circle-dots-duotone' },
  { id: 'preview', label: 'Preview', icon: 'i-ph:eye-duotone' },
  { id: 'code', label: 'Code', icon: 'i-ph:code-duotone' },
];

export function MobileTabBar({ className }: { className?: string }) {
  const active = useStore(mobileActiveTab);

  return (
    <div
      className={classNames(
        'flex items-center justify-around border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 shrink-0',
        className,
      )}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            mobileActiveTab.set(tab.id);

            if (tab.id === 'preview' || tab.id === 'code') {
              workbenchStore.currentView.set(tab.id);
            }
          }}
          className={classNames('flex flex-col items-center gap-0.5 py-2 px-6 text-xs transition-theme', {
            'text-bolt-elements-item-contentAccent': active === tab.id,
            'text-bolt-elements-textTertiary': active !== tab.id,
          })}
        >
          <div className={classNames(tab.icon, 'text-xl')} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
