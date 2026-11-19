import { createAnthropic } from '@ai-sdk/anthropic';
import { fetch as nativeFetch } from 'undici';

/**
 * Compatibility shims for current Claude models with this version of the Vercel AI SDK:
 * - the models reject `temperature` ("`temperature` is deprecated for this model") but the SDK always sends 0;
 * - the models stream `thinking` content blocks by default, which this SDK's response schema cannot parse,
 *   so thinking before the response is turned off;
 * - on Vercel, Remix replaces the global `fetch` with a polyfill whose response streams do not interoperate with
 *   the native stream transforms the AI SDK uses, so requests go through undici's fetch instead.
 */
const fetchWithoutTemperature: typeof fetch = async (input, init) => {
  if (typeof init?.body === 'string') {
    try {
      const body = JSON.parse(init.body);

      delete body.temperature;
      body.thinking = { type: 'between_tools' };

      return nativeFetch(input as Parameters<typeof nativeFetch>[0], {
        ...(init as Parameters<typeof nativeFetch>[1]),
        body: JSON.stringify(body),
      }) as unknown as Promise<Response>;
    } catch {
      // not JSON: forward unchanged
    }
  }

  return nativeFetch(
    input as Parameters<typeof nativeFetch>[0],
    init as Parameters<typeof nativeFetch>[1],
  ) as unknown as Promise<Response>;
};

export function getAnthropicModel(apiKey: string) {
  const anthropic = createAnthropic({
    apiKey,
    fetch: fetchWithoutTemperature,
  });

  return anthropic('claude-sonnet-5-5');
}
