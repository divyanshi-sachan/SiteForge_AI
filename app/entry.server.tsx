import { Readable, Transform } from 'node:stream';
import { RemixServer } from '@remix-run/react';
import type { AppLoadContext, EntryContext } from '@vercel/remix';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/lib/stores/theme';

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  return new Promise<Response>((resolve, reject) => {
    let status = responseStatusCode;
    const readyEvent = isbot(request.headers.get('user-agent') || '') ? 'onAllReady' : 'onShellReady';

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />,
      {
        [readyEvent]() {
          const head = renderHeadToString({ request, remixContext, Head });

          // wrap the streamed app in the same HTML shell as before (remix-island renders <head>)
          const body = new Transform({
            transform(chunk, _encoding, callback) {
              callback(null, chunk);
            },
            flush(callback) {
              this.push('</div></body></html>');
              callback();
            },
          });

          body.push(
            `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`,
          );

          responseHeaders.set('Content-Type', 'text/html');

          // required for WebContainers (cross-origin isolation)
          responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
          responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

          pipe(body);

          resolve(
            new Response(Readable.toWeb(body) as unknown as ReadableStream, {
              headers: responseHeaders,
              status,
            }),
          );
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          status = 500;
          console.error(error);
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
