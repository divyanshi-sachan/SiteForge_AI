import { Form, useActionData, useLoaderData, useNavigation, useSearchParams } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { Logo } from '~/components/ui/Logo';
import {
  clearFailures,
  clientKey,
  codeMatches,
  createSessionToken,
  getAuthConfig,
  isAuthorized,
  isLockedOut,
  jsonResponse,
  recordFailure,
  redirectResponse,
  safeRedirectPath,
  sessionCookie,
} from '~/lib/.server/auth';
import { BRAND } from '~/utils/brand';

export const meta: MetaFunction = () => [{ title: `Sign in · ${BRAND.name}` }];

export async function loader({ request }: LoaderFunctionArgs) {
  const config = getAuthConfig();

  if (config.mode === 'misconfigured') {
    return jsonResponse({ misconfigured: true });
  }

  if (isAuthorized(request, config)) {
    return redirectResponse(safeRedirectPath(new URL(request.url).searchParams.get('redirectTo')));
  }

  return jsonResponse({ misconfigured: false });
}

export async function action({ request }: ActionFunctionArgs) {
  const config = getAuthConfig();

  if (config.mode !== 'enforced') {
    return jsonResponse({ error: 'Access control is not configured.' }, 503);
  }

  const key = clientKey(request);

  if (isLockedOut(key)) {
    return jsonResponse({ error: 'Too many attempts. Please try again in a few minutes.' }, 429);
  }

  const form = await request.formData();
  const code = String(form.get('code') ?? '');
  const redirectTo = safeRedirectPath(String(form.get('redirectTo') ?? '/'));

  if (codeMatches(code, config.code)) {
    clearFailures(key);

    return redirectResponse(redirectTo, { 'Set-Cookie': sessionCookie(createSessionToken(config.secret)) });
  }

  recordFailure(key);

  // slow down guessing
  await new Promise((resolve) => setTimeout(resolve, 600));

  return jsonResponse({ error: 'Incorrect access code.' }, 401);
}

export default function Login() {
  const data = useLoaderData<{ misconfigured: boolean }>();
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const [params] = useSearchParams();
  const busy = navigation.state === 'submitting';

  return (
    <div className="h-full w-full flex items-center justify-center px-6">
      <div className="glass-strong rounded-3xl w-full max-w-sm p-8">
        <div className="flex justify-center mb-6">
          <Logo size={28} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-center text-bolt-elements-textPrimary mb-1">
          Enter access code
        </h1>
        <p className="text-sm text-center text-bolt-elements-textSecondary mb-6">This site is private.</p>

        {data.misconfigured ? (
          <p role="alert" className="text-sm text-center text-bolt-elements-textSecondary">
            Access control is not configured on this deployment.
          </p>
        ) : (
          <Form method="post" className="flex flex-col gap-3">
            <input type="hidden" name="redirectTo" value={params.get('redirectTo') ?? '/'} />
            <input
              name="code"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              placeholder="Access code"
              className="w-full rounded-xl px-4 py-3 bg-white/70 border border-bolt-elements-borderColor text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary focus:outline-none focus:border-bolt-elements-borderColorActive"
            />
            {actionData?.error && (
              <p role="alert" className="text-sm text-red-600">
                {actionData.error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 shadow-md transition-theme"
            >
              {busy ? 'Checking...' : 'Continue'}
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}
