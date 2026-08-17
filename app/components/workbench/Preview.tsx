import { useStore } from '@nanostores/react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ErrorState } from '~/components/ui/ErrorState';
import { IconButton } from '~/components/ui/IconButton';
import { workbenchStore, type PreviewViewport } from '~/lib/stores/workbench';
import { webcontainerBootError } from '~/lib/webcontainer';
import { classNames } from '~/utils/classNames';
import { PortDropdown } from './PortDropdown';

const VIEWPORTS: { id: PreviewViewport; icon: string; label: string; width: string | null }[] = [
  { id: 'desktop', icon: 'i-ph:desktop-duotone', label: 'Desktop', width: null },
  { id: 'tablet', icon: 'i-ph:device-tablet-duotone', label: 'Tablet', width: '768px' },
  { id: 'mobile', icon: 'i-ph:device-mobile-duotone', label: 'Mobile', width: '390px' },
];

export const Preview = memo(() => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isPortDropdownOpen, setIsPortDropdownOpen] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const hasSelectedPreview = useRef(false);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];
  const viewport = useStore(workbenchStore.previewViewport);
  const bootError = useStore(webcontainerBootError);

  const [url, setUrl] = useState('');
  const [iframeUrl, setIframeUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!activePreview) {
      setUrl('');
      setIframeUrl(undefined);

      return;
    }

    const { baseUrl } = activePreview;

    setUrl(baseUrl);
    setIframeUrl(baseUrl);
  }, [activePreview, iframeUrl]);

  const validateUrl = useCallback(
    (value: string) => {
      if (!activePreview) {
        return false;
      }

      const { baseUrl } = activePreview;

      if (value === baseUrl) {
        return true;
      } else if (value.startsWith(baseUrl)) {
        return ['/', '?', '#'].includes(value.charAt(baseUrl.length));
      }

      return false;
    },
    [activePreview],
  );

  const findMinPortIndex = useCallback(
    (minIndex: number, preview: { port: number }, index: number, array: { port: number }[]) => {
      return preview.port < array[minIndex].port ? index : minIndex;
    },
    [],
  );

  // when previews change, display the lowest port if user hasn't selected a preview
  useEffect(() => {
    if (previews.length > 1 && !hasSelectedPreview.current) {
      const minPortIndex = previews.reduce(findMinPortIndex, 0);

      setActivePreviewIndex(minPortIndex);
    }
  }, [previews]);

  const reloadPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const activeViewport = VIEWPORTS.find((v) => v.id === viewport) ?? VIEWPORTS[0];

  return (
    <div className="w-full h-full flex flex-col bg-bolt-elements-background-depth-2">
      {isPortDropdownOpen && (
        <div className="z-iframe-overlay w-full h-full absolute" onClick={() => setIsPortDropdownOpen(false)} />
      )}

      {/* Preview toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-1">
        <IconButton icon="i-ph:arrow-clockwise" title="Reload preview" onClick={reloadPreview} />

        <div
          className="flex items-center gap-1.5 flex-grow bg-bolt-elements-preview-addressBar-background border border-bolt-elements-borderColor text-bolt-elements-preview-addressBar-text rounded-full px-3 py-1 text-sm min-w-0 cursor-text"
          onClick={() => {
            setIsEditingUrl(true);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
        >
          <div className="i-ph:globe-hemisphere-west shrink-0 opacity-60" />
          {isEditingUrl ? (
            <input
              ref={inputRef}
              className="w-full bg-transparent outline-none"
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onBlur={() => setIsEditingUrl(false)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && validateUrl(url)) {
                  setIframeUrl(url);
                  inputRef.current?.blur();
                } else if (event.key === 'Escape') {
                  setUrl(iframeUrl ?? '');
                  inputRef.current?.blur();
                }
              }}
            />
          ) : (
            <span className="truncate opacity-80">{activePreview ? 'Live Preview' : 'No preview yet'}</span>
          )}
        </div>

        {previews.length > 1 && (
          <PortDropdown
            activePreviewIndex={activePreviewIndex}
            setActivePreviewIndex={setActivePreviewIndex}
            isDropdownOpen={isPortDropdownOpen}
            setHasSelectedPreview={(value) => (hasSelectedPreview.current = value)}
            setIsDropdownOpen={setIsPortDropdownOpen}
            previews={previews}
          />
        )}

        {/* Viewport switcher */}
        <div className="hidden sm:flex items-center gap-0.5 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-full p-0.5 shrink-0">
          {VIEWPORTS.map((v) => (
            <button
              key={v.id}
              title={v.label}
              onClick={() => workbenchStore.previewViewport.set(v.id)}
              className={classNames(
                'flex items-center justify-center w-7 h-7 rounded-full text-base transition-theme',
                {
                  'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent': viewport === v.id,
                  'text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary': viewport !== v.id,
                },
              )}
            >
              <div className={v.icon} />
            </button>
          ))}
        </div>
      </div>

      {/* Viewport frame */}
      <div className="flex-1 overflow-auto flex items-start justify-center bg-bolt-elements-background-depth-3 p-0 sm:p-4">
        <div
          className="h-full bg-white transition-[width] duration-300 ease-out shadow-sm"
          style={{
            width: activeViewport.width ?? '100%',
            maxWidth: '100%',
          }}
        >
          {bootError ? (
            <ErrorState
              title="We couldn't start the preview."
              message={bootError}
              onRetry={() => window.location.reload()}
            />
          ) : activePreview ? (
            <iframe ref={iframeRef} className="border-none w-full h-full bg-white" src={iframeUrl} />
          ) : (
            <div className="flex w-full h-full min-h-[200px] justify-center items-center bg-white text-gray-400 text-sm">
              Preparing your website...
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
