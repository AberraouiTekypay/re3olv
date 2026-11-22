function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (!configured) {
    if (process.env.NODE_ENV === 'production') throw new Error('NEXT_PUBLIC_API_URL must be configured in production');
    return 'http://localhost:3001/api';
  }
  const url = new URL(configured);
  if (url.username || url.password || url.search || url.hash || (process.env.NODE_ENV === 'production' && url.protocol !== 'https:')) {
    throw new Error('NEXT_PUBLIC_API_URL must be a valid HTTPS API URL in production');
  }
  return configured.replace(/\/+$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl();

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = typeof window !== 'undefined'
    ? await (await import('@/lib/oidc-client')).getOidcAccessToken()
    : undefined;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}
