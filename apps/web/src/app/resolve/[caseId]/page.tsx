import React from 'react';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';
import { SettlementSelector } from './SettlementSelector';
import { AdvocacyShield } from './AdvocacyShield';
import { ViewTracker } from './ViewTracker';
import { EvidenceDrawer } from './EvidenceDrawer';
import { fetchApi } from '@/lib/api-client';

interface SettlementOption {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: string;
  savings?: number;
  installments?: number;
  monthlyPayment?: number;
}

interface CaseData {
  id: string;
  borrowerName: string;
  isSME: boolean;
  founderName: string | null;
  founderImpact: string | null;
  verificationMethod: 'OFFICIAL_REGISTER' | 'CASH_FLOW_PROXY' | 'HYBRID';
  totalAmount: number;
  status: string;
  isFeeFrozen: boolean;
  penaltyWaived: number;
  hardshipReason: string | null;
}

async function getCaseData(caseId: string): Promise<CaseData> {
  return fetchApi<CaseData>(`/cases/${caseId}`, { cache: 'no-store' });
}

async function getSettlementOptions(caseId: string): Promise<SettlementOption[]> {
  return fetchApi<SettlementOption[]>(`/cases/${caseId}/options`, { cache: 'no-store' });
}

export default async function ResolvePage({ params }: { params: { caseId: string } }) {
  const { caseId } = await params;
  
  try {
    const caseData = await getCaseData(caseId);
    const options = await getSettlementOptions(caseId);

    const title = caseData.isSME ? `Founder Stability Portal` : "Resolve Your Debt";
    const greeting = caseData.isSME 
      ? `We understand your business is your life's work, ${caseData.founderName || caseData.borrowerName}. Nova is here to help you stabilize both.`
      : `Hi ${caseData.borrowerName}, I'm Nova. Let's work together to resolve your debt and secure your financial future.`;

    return (
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        <ViewTracker caseId={caseId} />
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-4">
            <Scale size={14} /> Official {caseData.isSME ? 'SME' : 'Institutional'} Advocacy
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">{title}</h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto mb-8">{greeting}</p>
          
          <div className="mt-6 p-6 bg-muted rounded-xl inline-block">
            <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-1">Total Outstanding</p>
            <p className="text-3xl font-bold text-red-500">${caseData.totalAmount.toLocaleString()}</p>
          </div>
        </header>

        <AdvocacyShield 
          caseId={caseId} 
          isFeeFrozen={caseData.isFeeFrozen} 
          penaltyWaived={caseData.penaltyWaived}
          hardshipReason={caseData.hardshipReason}
          isSME={caseData.isSME}
        />

        <SettlementSelector caseId={caseId} options={options} initialStatus={caseData.status} />

        {caseData.isSME && (caseData.verificationMethod === 'CASH_FLOW_PROXY' || caseData.verificationMethod === 'HYBRID') && (
          <EvidenceDrawer caseId={caseId} />
        )}

        <footer className="mt-24 pt-12 border-t border-slate-100 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 mb-4 tracking-widest">Regulatory Disclosures</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                RE3OLV is an institutional debt facilitator. All AI interactions with Nova are recorded for quality and compliance under FDCPA 2026 and GDPR standards.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 mb-4 tracking-widest">Legal Links</h4>
              <ul className="space-y-2 text-[10px] font-bold text-slate-400">
                <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-600">Privacy & Data Consent</a></li>
                <li><a href="#" className="hover:text-indigo-600 text-indigo-500 underline decoration-2">Right to Speak to a Human</a></li>
              </ul>
            </div>
            <div className="flex flex-col items-center md:items-end justify-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Scale size={24} className="text-slate-400" />
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-900 uppercase">Institutional Grade</p>
                  <p className="text-[9px] text-slate-400 font-bold">Audit-Ready Compliance</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
            &copy; 2026 RE3OLV Technologies &middot; Institutional Debt Advocacy
          </div>
        </footer>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Oops! Something went wrong</h2>
        <p className="text-muted-foreground">We couldn't find the case you're looking for or it's already resolved.</p>
        <Button className="mt-6" asChild>
          <a href="/">Go Back Home</a>
        </Button>
      </div>
    );
  }
}
