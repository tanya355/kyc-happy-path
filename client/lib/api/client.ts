/**
 * Base API client — wraps fetch with auth headers, base URL, and error normalization.
 *
 * All TanStack Query hooks in lib/api/queries/ call through this client.
 * No component or page may call fetch() directly.
 *
 * Base URL is read from VITE_API_BASE_URL env var; defaults to "" (same origin).
 */

const BASE_URL = (import.meta as unknown as { env: Record<string, string> }).env
  ?.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API ${res.status} — ${res.statusText}: ${path}`);
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get:    <T>(path: string)                      => request<T>(path),
  post:   <T>(path: string, body: unknown)       => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)       => request<T>(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: <T>(path: string)                      => request<T>(path, { method: "DELETE" }),
};
