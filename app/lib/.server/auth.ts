/**
 * Access-code gate. A shared code (ACCESS_CODE) is exchanged for a signed, HttpOnly session cookie
 * (HMAC-SHA256 with AUTH_SECRET). In production the gate fails closed: if either variable is
 * missing nothing is served. Outside production, an unset ACCESS_CODE leaves the app open.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { env as processEnv } from 'node:process';

export const AUTH_COOKIE = 'sf_auth';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const MIN_SECRET_LENGTH = 16;

// the real environment: the build's polyfill replaces the global `process` with an empty shim in server code
type Env = Record<string, string | undefined>;

export type AuthConfig =
  | { mode: 'open' }
  | { mode: 'misconfigured' }
  | { mode: 'enforced'; code: string; secret: string };

export function getAuthConfig(env: Env = processEnv): AuthConfig {
  const code = env.ACCESS_CODE?.trim();
  const secret = env.AUTH_SECRET?.trim();
  const production = env.NODE_ENV === 'production';

  if (!code && !production) {
    return { mode: 'open' };
  }

  if (!code || !secret || secret.length < MIN_SECRET_LENGTH) {
    return { mode: 'misconfigured' };
  }

  return { mode: 'enforced', code, secret };
}

function digest(value: string) {
  return createHash('sha256').update(value).digest();
}

function safeEqual(a: string, b: string) {
  return timingSafeEqual(digest(a), digest(b));
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function codeMatches(input: string, code: string) {
  return safeEqual(input.trim(), code);
}

export function createSessionToken(secret: string, nowMs: number = Date.now()) {
  const expires = Math.floor(nowMs / 1000) + SESSION_MAX_AGE_SECONDS;

  return `${expires}.${sign(String(expires), secret)}`;
}

export function verifySessionToken(token: string | undefined, secret: string, nowMs: number = Date.now()) {
  if (!token) {
    return false;
  }

  const [expires, signature] = token.split('.');

  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < nowMs / 1000) {
    return false;
  }

  return safeEqual(signature, sign(expires, secret));
}

export function readCookie(header: string | null, name: string) {
  if (!header) {
    return undefined;
  }

  for (const part of header.split(';')) {
    const index = part.indexOf('=');

    if (index > 0 && part.slice(0, index).trim() === name) {
      return part.slice(index + 1).trim();
    }
  }

  return undefined;
}

export function sessionCookie(token: string, env: Env = processEnv) {
  const secure = env.NODE_ENV === 'production' ? '; Secure' : '';

  return `${AUTH_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
}

export function clearedCookie(env: Env = processEnv) {
  const secure = env.NODE_ENV === 'production' ? '; Secure' : '';

  return `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

/** Only same-site relative paths are allowed as post-login targets (prevents open redirects). */
export function safeRedirectPath(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/';
  }

  return value;
}

export function isAuthorized(request: Request, config: AuthConfig = getAuthConfig()) {
  if (config.mode === 'open') {
    return true;
  }

  if (config.mode === 'misconfigured') {
    return false;
  }

  return verifySessionToken(readCookie(request.headers.get('cookie'), AUTH_COOKIE), config.secret);
}

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

export function redirectResponse(location: string, headers: Record<string, string> = {}) {
  return new Response(null, { status: 302, headers: { Location: location, ...headers } });
}

const MISCONFIGURED_MESSAGE = 'Access control is not configured. Set ACCESS_CODE and AUTH_SECRET.';

/**
 * Returns a Response when the request must be blocked, or null when it may proceed.
 * API callers get 401/503 JSON; page requests are redirected to the login page.
 */
export function authGate(request: Request, options: { api?: boolean } = {}): Response | null {
  const config = getAuthConfig();

  if (config.mode === 'open') {
    return null;
  }

  if (config.mode === 'misconfigured') {
    return jsonResponse({ error: MISCONFIGURED_MESSAGE }, 503);
  }

  if (isAuthorized(request, config)) {
    return null;
  }

  if (options.api) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(request.url);

  return redirectResponse(`/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
}

// best-effort brute-force limit: in-memory, so per serverless instance, not global
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 8;
const failures = new Map<string, { count: number; resetAt: number }>();

export function clientKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export function isLockedOut(key: string, nowMs: number = Date.now()) {
  const entry = failures.get(key);

  return !!entry && entry.resetAt > nowMs && entry.count >= MAX_FAILURES;
}

export function recordFailure(key: string, nowMs: number = Date.now()) {
  const entry = failures.get(key);

  if (!entry || entry.resetAt <= nowMs) {
    failures.set(key, { count: 1, resetAt: nowMs + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function clearFailures(key: string) {
  failures.delete(key);
}
