import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

let manager: UserManager | undefined;

export function getOidcManager(): UserManager | null {
  if (typeof window === 'undefined') return null;
  const authority = process.env.NEXT_PUBLIC_OIDC_ISSUER;
  const clientId = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID;
  if (!authority || !clientId) return null;

  const extraQueryParams: Record<string, string> = {};
  if (process.env.NEXT_PUBLIC_OIDC_AUDIENCE) {
    extraQueryParams.audience = process.env.NEXT_PUBLIC_OIDC_AUDIENCE;
  }
  if (process.env.NEXT_PUBLIC_OIDC_RESOURCE) {
    extraQueryParams.resource = process.env.NEXT_PUBLIC_OIDC_RESOURCE;
  }

  manager ??= new UserManager({
    authority,
    client_id: clientId,
    redirect_uri: `${window.location.origin}/auth/callback`,
    post_logout_redirect_uri: window.location.origin,
    response_type: 'code',
    scope: process.env.NEXT_PUBLIC_OIDC_SCOPE || 'openid profile email',
    extraQueryParams,
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  });
  return manager;
}

export async function getOidcAccessToken(): Promise<string | undefined> {
  const user = await getOidcManager()?.getUser();
  if (!user || user.expired || !user.access_token) return undefined;
  return user.access_token;
}
