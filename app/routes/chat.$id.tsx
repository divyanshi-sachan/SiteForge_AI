import type { LoaderFunctionArgs } from '@vercel/remix';
import { authGate, jsonResponse } from '~/lib/.server/auth';
import { default as IndexRoute } from './_index';

export async function loader(args: LoaderFunctionArgs) {
  return authGate(args.request) ?? jsonResponse({ id: args.params.id });
}

export default IndexRoute;
