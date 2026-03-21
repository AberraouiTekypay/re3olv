import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface CaseData {
  id: string;
  totalAmount: number;
  status: string;
  selectedOptionId: string | null;
  createdAt: string;
}

async function getCases(): Promise<CaseData[]> {
  const res = await fetch('http://localhost:3001/api/cases', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch cases');
  return res.json();
}

export default async function AgentDashboardPage() {
  const cases = await getCases();

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of all debt resolution cases.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Case Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Selected Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No cases found.
                  </TableCell>
                </TableRow>
              ) : (
                cases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                    <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>${c.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        c.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {c.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {c.selectedOptionId ? (
                        <span className="capitalize">{c.selectedOptionId.replace('-', ' ')}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
