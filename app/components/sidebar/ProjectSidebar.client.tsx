import { useStore } from '@nanostores/react';
import { motion, type Variants } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { IconButton } from '~/components/ui/IconButton';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { db, deleteById, getAll, chatId, type ChatHistoryItem } from '~/lib/persistence';
import { projectSidebarOpen } from '~/lib/stores/ui';
import { cubicEasingFn } from '~/utils/easings';
import { logger } from '~/utils/logger';
import { HistoryItem } from './HistoryItem';
import { binDates } from './date-binning';

const sidebarVariants = {
  closed: {
    opacity: 0,
    visibility: 'hidden',
    left: '-350px',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    opacity: 1,
    visibility: 'initial',
    left: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

type DialogContent = { type: 'delete'; item: ChatHistoryItem } | null;

export function ProjectSidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<ChatHistoryItem[]>([]);
  const open = useStore(projectSidebarOpen);
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);

  const loadEntries = useCallback(() => {
    if (db) {
      getAll(db)
        .then((list) => list.filter((item) => item.urlId && item.description))
        .then((list) => list.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)))
        .then(setList)
        .catch((error) => toast.error(error.message));
    }
  }, []);

  const deleteItem = useCallback((event: React.UIEvent, item: ChatHistoryItem) => {
    event.preventDefault();

    if (db) {
      deleteById(db, item.id)
        .then(() => {
          loadEntries();

          if (chatId.get() === item.id) {
            // hard page navigation to clear the stores
            window.location.pathname = '/';
          }
        })
        .catch((error) => {
          toast.error('Failed to delete project');
          logger.error(error);
        });
    }
  }, []);

  const closeDialog = () => {
    setDialogContent(null);
  };

  useEffect(() => {
    if (open) {
      loadEntries();
    }
  }, [open]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        projectSidebarOpen.set(false);
      }
    }

    if (open) {
      window.addEventListener('mousedown', onClickOutside);
    }

    return () => window.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 z-sidebar" onClick={() => projectSidebarOpen.set(false)} />}
      <motion.div
        ref={sidebarRef}
        initial="closed"
        animate={open ? 'open' : 'closed'}
        variants={sidebarVariants}
        className="flex flex-col fixed top-0 w-[340px] h-full bg-bolt-elements-background-depth-2 border-r border-bolt-elements-borderColor z-sidebar shadow-xl shadow-bolt-elements-sidebar-dropdownShadow text-sm"
      >
        <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-bolt-elements-textPrimary font-semibold text-base">Projects</span>
            <IconButton icon="i-ph:x" title="Close" onClick={() => projectSidebarOpen.set(false)} />
          </div>
          <div className="px-4 pb-2">
            <a
              href="/"
              className="flex gap-2 items-center justify-center bg-bolt-elements-sidebar-buttonBackgroundDefault text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover rounded-lg p-2.5 transition-theme font-medium"
            >
              <span className="i-ph:plus scale-110" />
              New Project
            </a>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4 mt-2">
            {list.length === 0 && (
              <div className="px-2 py-6 text-center text-bolt-elements-textTertiary">No projects yet</div>
            )}
            <DialogRoot open={dialogContent !== null}>
              {binDates(list).map(({ category, items }) => (
                <div key={category} className="mt-4 first:mt-0 space-y-1">
                  <div className="text-bolt-elements-textTertiary text-xs font-medium uppercase tracking-wide sticky top-0 z-1 bg-bolt-elements-background-depth-2 px-2 pt-2 pb-1">
                    {category}
                  </div>
                  {items.map((item) => (
                    <HistoryItem
                      key={item.id}
                      item={item}
                      onDelete={() => setDialogContent({ type: 'delete', item })}
                      onRenamed={loadEntries}
                    />
                  ))}
                </div>
              ))}
              <Dialog onBackdrop={closeDialog} onClose={closeDialog}>
                {dialogContent?.type === 'delete' && (
                  <>
                    <DialogTitle>Delete Project?</DialogTitle>
                    <DialogDescription asChild>
                      <div>
                        <p>
                          You are about to delete <strong>{dialogContent.item.description}</strong>.
                        </p>
                        <p className="mt-1">This can't be undone.</p>
                      </div>
                    </DialogDescription>
                    <div className="px-5 pb-4 bg-bolt-elements-background-depth-2 flex gap-2 justify-end">
                      <DialogButton type="secondary" onClick={closeDialog}>
                        Cancel
                      </DialogButton>
                      <DialogButton
                        type="danger"
                        onClick={(event) => {
                          deleteItem(event, dialogContent.item);
                          closeDialog();
                        }}
                      >
                        Delete
                      </DialogButton>
                    </div>
                  </>
                )}
              </Dialog>
            </DialogRoot>
          </div>
          <div className="flex items-center border-t border-bolt-elements-borderColor p-4">
            <ThemeSwitch className="ml-auto" />
          </div>
        </div>
      </motion.div>
    </>
  );
}
