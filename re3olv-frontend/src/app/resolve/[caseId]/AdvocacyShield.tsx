'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

interface AdvocacyShieldProps {
  caseId: string;
  isFeeFrozen: boolean;
  penaltyWaived: number;
}

export function AdvocacyShield({ caseId, isFeeFrozen, penaltyWaived }: AdvocacyShieldProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleActivate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/cases/${caseId}/apply-advocacy`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to apply advocacy');
      setShowModal(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error applying advocacy');
    } finally {
      setLoading(false);
    }
  };

  if (isFeeFrozen) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-8 text-center" role="alert">
        <strong className="font-bold">Advocacy Shield Active! </strong>
        <span className="block sm:inline">Fees are frozen and ${penaltyWaived.toLocaleString()} in penalties have been waived.</span>
      </div>
    );
  }

  return (
    <div className="mb-8 flex justify-center">
      <Button variant="secondary" onClick={() => setShowModal(true)}>
        Activate Advocacy Shield
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Activate Advocacy Shield</CardTitle>
              <CardDescription>
                Are you facing financial hardship? Activate the Advocacy Shield to freeze your fees and waive eligible penalties.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleActivate} disabled={loading}>
                {loading ? 'Activating...' : 'Activate'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
