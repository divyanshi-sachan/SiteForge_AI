import type { ActionFunctionArgs } from '@vercel/remix';
import { authGate } from '~/lib/.server/auth';
import { MAX_RESPONSE_SEGMENTS, MAX_TOKENS } from '~/lib/.server/llm/constants';
import { CONTINUE_PROMPT } from '~/lib/.server/llm/prompts';
import { streamText, type Messages, type StreamingOptions } from '~/lib/.server/llm/stream-text';
import SwitchableStream from '~/lib/.server/llm/switchable-stream';

// generations stream for a minute or more
export const config = { maxDuration: 300 };

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}

async function chatAction({ request }: ActionFunctionArgs) {
  const blocked = authGate(request, { api: true });

  if (blocked) {
    return blocked;
  }

  const { messages } = (await request.json()) as { messages: Messages };

  const stream = new SwitchableStream();

  try {
    const options: StreamingOptions = {
      toolChoice: 'none',
      onFinish: async ({ text: content, finishReason }) => {
        if (finishReason !== 'length') {
          return stream.close();
        }

        if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
          // end the response cleanly instead of throwing, so the client does not hang on "Generating..."
          console.warn('Maximum response segments reached: closing the stream');

          return stream.close();
        }

        const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;

        console.log(`Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`);

        messages.push({ role: 'assistant', content });
        messages.push({ role: 'user', content: CONTINUE_PROMPT });

        const result = await streamText(messages, process.env as unknown as Env, options);

        return stream.switchSource(result.toAIStream());
      },
    };

    const result = await streamText(messages, process.env as unknown as Env, options);

    stream.switchSource(result.toAIStream());

    return new Response(stream.readable, {
      status: 200,
      headers: {
        contentType: 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.log(error);

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
