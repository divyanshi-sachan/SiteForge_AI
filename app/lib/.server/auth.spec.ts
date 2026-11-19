import { afterEach, describe, expect, it } from 'vitest';
import {
  authGate,
  clearFailures,
  codeMatches,
  createSessionToken,
  getAuthConfig,
  isLockedOut,
  readCookie,
  recordFailure,
  safeRedirectPath,
  verifySessionToken,
} from './auth';

const SECRET = 'test-secret-that-is-long-enough';
const KEYS = ['NODE_ENV', 'ACCESS_CODE', 'AUTH_SECRET'] as const;
const saved = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));

// restore individual keys (the object itself must not be replaced)
afterEach(() => {
  for (const key of KEYS) {
    if (saved[key] === undefined) {
      delete process.env[key];
    } else {
      (process.env as Record<string, string | undefined>)[key] = saved[key];
    }
  }
});

describe('getAuthConfig', () => {
  it('is open outside production when no code is set', () => {
    expect(getAuthConfig({ NODE_ENV: 'development' })).toEqual({ mode: 'open' });
  });

  it('fails closed in production without a code or secret', () => {
    expect(getAuthConfig({ NODE_ENV: 'production' })).toEqual({ mode: 'misconfigured' });
    expect(getAuthConfig({ NODE_ENV: 'production', ACCESS_CODE: 'abc' })).toEqual({ mode: 'misconfigured' });
  });

  it('rejects a short secret', () => {
    expect(getAuthConfig({ NODE_ENV: 'production', ACCESS_CODE: 'abc', AUTH_SECRET: 'short' })).toEqual({
      mode: 'misconfigured',
    });
  });

  it('is enforced when code and secret are set', () => {
    expect(getAuthConfig({ NODE_ENV: 'production', ACCESS_CODE: ' abc ', AUTH_SECRET: SECRET })).toEqual({
      mode: 'enforced',
      code: 'abc',
      secret: SECRET,
    });
  });
});

describe('session tokens', () => {
  it('accepts a fresh token', () => {
    expect(verifySessionToken(createSessionToken(SECRET), SECRET)).toBe(true);
  });

  it('rejects an expired token', () => {
    const old = createSessionToken(SECRET, Date.now() - 8 * 24 * 60 * 60 * 1000);

    expect(verifySessionToken(old, SECRET)).toBe(false);
  });

  it('rejects a tampered expiry, a wrong secret and garbage', () => {
    const [expires, signature] = createSessionToken(SECRET).split('.');

    expect(verifySessionToken(`${Number(expires) + 1000}.${signature}`, SECRET)).toBe(false);
    expect(verifySessionToken(createSessionToken(SECRET), 'another-secret-long-enough')).toBe(false);
    expect(verifySessionToken('not-a-token', SECRET)).toBe(false);
    expect(verifySessionToken(undefined, SECRET)).toBe(false);
  });
});

describe('codeMatches', () => {
  it('matches only the exact code (ignoring surrounding spaces)', () => {
    expect(codeMatches('  open-sesame ', 'open-sesame')).toBe(true);
    expect(codeMatches('open-sesame!', 'open-sesame')).toBe(false);
    expect(codeMatches('', 'open-sesame')).toBe(false);
  });
});

describe('safeRedirectPath', () => {
  it('allows relative paths and blocks open redirects', () => {
    expect(safeRedirectPath('/chat/abc?x=1')).toBe('/chat/abc?x=1');
    expect(safeRedirectPath('https://evil.example')).toBe('/');
    expect(safeRedirectPath('//evil.example')).toBe('/');
    expect(safeRedirectPath('/\\evil.example')).toBe('/');
    expect(safeRedirectPath(null)).toBe('/');
  });
});

describe('readCookie', () => {
  it('reads a named cookie', () => {
    expect(readCookie('a=1; sf_auth=tok.en; b=2', 'sf_auth')).toBe('tok.en');
    expect(readCookie('a=1', 'sf_auth')).toBeUndefined();
    expect(readCookie(null, 'sf_auth')).toBeUndefined();
  });
});

describe('lockout', () => {
  it('locks after repeated failures and can be cleared', () => {
    const key = 'test-client';

    for (let i = 0; i < 8; i++) {
      recordFailure(key);
    }

    expect(isLockedOut(key)).toBe(true);
    clearFailures(key);
    expect(isLockedOut(key)).toBe(false);
  });
});

describe('authGate', () => {
  it('lets requests through when open and blocks when misconfigured', () => {
    delete process.env.ACCESS_CODE;
    delete process.env.AUTH_SECRET;
    process.env.NODE_ENV = 'test';
    expect(authGate(new Request('http://localhost/'))).toBeNull();

    process.env.NODE_ENV = 'production';
    expect(authGate(new Request('http://localhost/'))?.status).toBe(503);
  });

  it('redirects pages and returns 401 for API calls when enforced and signed out', () => {
    process.env.NODE_ENV = 'production';
    process.env.ACCESS_CODE = 'open-sesame';
    process.env.AUTH_SECRET = SECRET;

    const page = authGate(new Request('http://localhost/chat/abc?x=1'));

    expect(page?.status).toBe(302);
    expect(page?.headers.get('Location')).toBe('/login?redirectTo=%2Fchat%2Fabc%3Fx%3D1');
    expect(authGate(new Request('http://localhost/api/chat', { method: 'POST' }), { api: true })?.status).toBe(401);

    const token = createSessionToken(SECRET);

    expect(authGate(new Request('http://localhost/', { headers: { cookie: `sf_auth=${token}` } }))).toBeNull();
  });
});
