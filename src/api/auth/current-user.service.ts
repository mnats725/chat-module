import type { CurrentUser, FetchCurrentOptions, BackendCurrentResponse } from './auth.api.types';

export const fetchCurrentUser = async (
  token: string,
  { backendUrl, timeoutMs = 3000, extraHeaders = {} }: FetchCurrentOptions
): Promise<CurrentUser> => {
  const url = new URL('/api/users/current', backendUrl).toString();

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...extraHeaders,
      },
      signal: ctrl.signal,
    });

    if (!res.ok) throw new Error(`Auth failed: ${res.status} ${res.statusText}`);

    const raw = (await res.json()) as BackendCurrentResponse;
    const user = raw?.data?.user;
    if (!user?.id) throw new Error('Auth failed: invalid /current response (no data.user.id)');

    return { id: user.id, username: user.username, email: user.email };
  } finally {
    clearTimeout(t);
  }
};
