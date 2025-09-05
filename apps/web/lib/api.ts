// ./apps/web/lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    // cache: 'no-store', // uncomment if you want SSR fresh data every time
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}
