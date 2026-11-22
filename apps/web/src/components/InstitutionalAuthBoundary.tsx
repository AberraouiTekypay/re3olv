'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getOidcManager } from '@/lib/oidc-client';

export function InstitutionalAuthBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const protectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/agent') || pathname.startsWith('/alpha');
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    if (!protectedRoute || pathname.startsWith('/auth/callback')) {
      setReady(true);
      return;
    }

    const manager = getOidcManager();
    if (!manager) {
      setConfigured(false);
      setReady(true);
      return;
    }

    let active = true;
    const update = () => {
      void manager.getUser().then((user) => {
        if (active) setAuthenticated(Boolean(user && !user.expired && user.access_token));
      });
    };
    manager.events.addUserLoaded(update);
    manager.events.addUserUnloaded(update);
    manager.events.addAccessTokenExpired(update);
    void manager.getUser().then((user) => {
      if (active) {
        setAuthenticated(Boolean(user && !user.expired && user.access_token));
        setReady(true);
      }
    }).catch(() => {
      if (active) setReady(true);
    });

    return () => {
      active = false;
      manager.events.removeUserLoaded(update);
      manager.events.removeUserUnloaded(update);
      manager.events.removeAccessTokenExpired(update);
    };
  }, [pathname, protectedRoute]);

  if (!protectedRoute || pathname.startsWith('/auth/callback')) return <>{children}</>;
  if (!ready) return <main className="grid min-h-[60vh] place-items-center">Checking institutional session…</main>;
  if (authenticated) return <>{children}</>;

  const manager = getOidcManager();
  return (
    <main className="grid min-h-[60vh] place-items-center p-6">
      <section className="max-w-lg rounded-3xl border bg-white p-8 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">Institutional sign-in</h1>
        <p className="mt-3 text-slate-600">
          {configured
            ? 'Sign in through your organization to access institutional records.'
            : 'Institutional sign-in is not configured. Set the OIDC issuer and client ID to continue.'}
        </p>
        {configured && (
          <button
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white"
            onClick={() => manager?.signinRedirect({ state: { returnTo: pathname } })}
          >
            Sign in
          </button>
        )}
      </section>
    </main>
  );
}
