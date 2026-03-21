'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';

export function ViewTracker({ caseId }: { caseId: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const trackView = async () => {
      try {
        await fetchApi(`/cases/${caseId}/view${token ? `?token=${token}` : ''}`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Failed to track view', error);
      }
    };

    trackView();
  }, [caseId, token]);

  return null;
}
