'use client';

import { useEffect } from 'react';
import { fetchApi } from '@/lib/api-client';

export function ViewTracker({ caseId, token }: { caseId: string; token: string }) {
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetchApi(`/cases/${caseId}/track`, {
          method: 'POST',
          headers: { 'x-borrower-token': token },
        });
      } catch (error) {
        console.error('Failed to track view', error);
      }
    };

    trackView();
  }, [caseId, token]);

  return null;
}
