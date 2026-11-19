import { clearedCookie, redirectResponse } from '~/lib/.server/auth';

export async function action() {
  return redirectResponse('/login', { 'Set-Cookie': clearedCookie() });
}

export async function loader() {
  return redirectResponse('/login');
}
