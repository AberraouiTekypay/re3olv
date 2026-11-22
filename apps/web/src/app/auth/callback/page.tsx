'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOidcManager } from '@/lib/oidc-client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const manager = getOidcManager();
    if (!manager) {
      setError('OIDC sign-in is not configured.');
      return;
    }
    void manager.signinRedirectCallback().then((user) => {
      const returnTo = (user.state as { returnTo?: string } | undefined)?.returnTo;
      router.replace(returnTo?.startsWith('/') ? returnTo : '/agent/dashboard');
    }).catch(() => setError('Sign-in could not be completed. Please try again.'));
  }, [router]);

  return (
    <main className="grid min-h-[60vh] place-items-center p-6 text-center">
      {error || 'Completing institutional sign-in…'}
    </main>
  );
}
