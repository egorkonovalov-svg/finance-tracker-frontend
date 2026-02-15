/**
 * Base HTTP client for the FastAPI backend.
 * Toggle USE_MOCK to switch between real API and local mock data.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const USE_MOCK = true; // flip to false when backend is live

// ─── Types ───────────────────────────────────────────────────────────────────

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    super(`API error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts?: RequestOptions,
): Promise<T> {
  const url = buildUrl(path, opts?.params);

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...opts?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: opts?.signal,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new ApiError(res.status, errBody);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const api = {
  get<T>(path: string, opts?: RequestOptions) {
    return request<T>('GET', path, undefined, opts);
  },
  post<T>(path: string, body: unknown, opts?: RequestOptions) {
    return request<T>('POST', path, body, opts);
  },
  put<T>(path: string, body: unknown, opts?: RequestOptions) {
    return request<T>('PUT', path, body, opts);
  },
  patch<T>(path: string, body: unknown, opts?: RequestOptions) {
    return request<T>('PATCH', path, body, opts);
  },
  del<T = void>(path: string, opts?: RequestOptions) {
    return request<T>('DELETE', path, undefined, opts);
  },
};

export { ApiError };
