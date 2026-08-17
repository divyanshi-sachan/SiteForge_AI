import { useStore } from '@nanostores/react';
import { computed } from 'nanostores';
import { memo, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  type OnChangeCallback as OnEditorChange,
  type OnScrollCallback as OnEditorScroll,
} from '~/components/editor/codemirror/CodeMirrorEditor';
import { IconButton } from '~/components/ui/IconButton';
import { Slider, type SliderOptions } from '~/components/ui/Slider';
import { workbenchStore, type WorkbenchViewType } from '~/lib/stores/workbench';
import { mobileActiveTab } from '~/lib/stores/ui';
import { downloadProjectZip } from '~/utils/downloadProject';
import { renderLogger } from '~/utils/logger';
import { EditorPanel } from './EditorPanel';
import { Preview } from './Preview';

interface WorkspaceProps {
  isStreaming?: boolean;
}

const sliderOptions: SliderOptions<WorkbenchViewType> = {
  left: {
    value: 'preview',
    text: 'Preview',
  },
  right: {
    value: 'code',
    text: 'Code',
  },
};

export const Workbench = memo(({ isStreaming }: WorkspaceProps) => {
  renderLogger.trace('Workbench');

  const [isDownloading, setIsDownloading] = useState(false);

  const selectedFile = useStore(workbenchStore.selectedFile);
  const currentDocument = useStore(workbenchStore.currentDocument);
  const unsavedFiles = useStore(workbenchStore.unsavedFiles);
  const files = useStore(workbenchStore.files);
  const selectedView = useStore(workbenchStore.currentView);
  const showTerminal = useStore(workbenchStore.showTerminal);
  const hasPreview = useStore(computed(workbenchStore.previews, (previews) => previews.length > 0));

  const setSelectedView = (view: WorkbenchViewType) => {
    workbenchStore.currentView.set(view);
  };

  // transition into the preview automatically the first time it becomes available
  useEffect(() => {
    if (hasPreview) {
      workbenchStore.currentView.set('preview');
      mobileActiveTab.set('preview');
    }
  }, [hasPreview]);

  useEffect(() => {
    workbenchStore.setDocuments(files);
  }, [files]);

  const onEditorChange = useCallback<OnEditorChange>((update) => {
    workbenchStore.setCurrentDocumentContent(update.content);
  }, []);

  const onEditorScroll = useCallback<OnEditorScroll>((position) => {
    workbenchStore.setCurrentDocumentScrollPosition(position);
  }, []);

  const onFileSelect = useCallback((filePath: string | undefined) => {
    workbenchStore.setSelectedFile(filePath);
  }, []);

  const onFileSave = useCallback(() => {
    workbenchStore.saveCurrentDocument().catch(() => {
      toast.error('Failed to update file content');
    });
  }, []);

  const onFileReset = useCallback(() => {
    workbenchStore.resetCurrentDocument();
  }, []);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);

    try {
      await downloadProjectZip(files);
    } catch (error) {
      console.error(error);
      toast.error("We couldn't prepare your code download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [files]);

  const hasFiles = Object.keys(files ?? {}).length > 0;

  return (
    <div className="h-full flex flex-col bg-bolt-elements-background-depth-1">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-bolt-elements-borderColor shrink-0">
        <div className="hidden md:flex">
          <Slider selected={selectedView} options={sliderOptions} setSelected={setSelectedView} />
        </div>
        <div className="ml-auto flex items-center gap-1">
          {selectedView === 'code' && (
            <IconButton
              title="Developer tools (terminal)"
              icon="i-ph:terminal-window"
              className={showTerminal ? 'text-bolt-elements-item-contentAccent' : 'text-bolt-elements-textTertiary'}
              onClick={() => workbenchStore.toggleTerminal(!showTerminal)}
            />
          )}
          <IconButton
            title="Download code as .zip"
            icon={isDownloading ? 'i-svg-spinners:90-ring-with-bg' : 'i-ph:download-simple'}
            disabled={!hasFiles || isDownloading}
            onClick={handleDownload}
          />
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0" style={{ display: selectedView === 'code' ? 'block' : 'none' }}>
          <EditorPanel
            editorDocument={currentDocument}
            isStreaming={isStreaming}
            selectedFile={selectedFile}
            files={files}
            unsavedFiles={unsavedFiles}
            onFileSelect={onFileSelect}
            onEditorScroll={onEditorScroll}
            onEditorChange={onEditorChange}
            onFileSave={onFileSave}
            onFileReset={onFileReset}
          />
        </div>
        <div className="absolute inset-0" style={{ display: selectedView === 'preview' ? 'block' : 'none' }}>
          <Preview />
        </div>
      </div>
    </div>
  );
});
