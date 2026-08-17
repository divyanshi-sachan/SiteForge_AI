import { WebContainer } from '@webcontainer/api';
import { atom } from 'nanostores';
import { WORK_DIR_NAME } from '~/utils/constants';

interface WebContainerContext {
  loaded: boolean;
}

export const webcontainerContext: WebContainerContext = import.meta.hot?.data.webcontainerContext ?? {
  loaded: false,
};

/** Set when the WebContainer fails to boot, so the UI can show a friendly message instead of hanging. */
export const webcontainerBootError = import.meta.hot?.data.webcontainerBootError ?? atom<string | undefined>(undefined);

if (import.meta.hot) {
  import.meta.hot.data.webcontainerBootError = webcontainerBootError;
}

if (import.meta.hot) {
  import.meta.hot.data.webcontainerContext = webcontainerContext;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for ssr
});

if (!import.meta.env.SSR) {
  webcontainer =
    import.meta.hot?.data.webcontainer ??
    Promise.resolve()
      .then(() => {
        return WebContainer.boot({ workdirName: WORK_DIR_NAME });
      })
      .then((webcontainer) => {
        webcontainerContext.loaded = true;
        return webcontainer;
      })
      .catch((error) => {
        // log full technical details for developers, the UI surfaces a friendly message instead
        console.error('WebContainer failed to boot', error);
        webcontainerBootError.set("We couldn't start the preview. Please try again.");
        throw error;
      });

  if (import.meta.hot) {
    import.meta.hot.data.webcontainer = webcontainer;
  }
}
