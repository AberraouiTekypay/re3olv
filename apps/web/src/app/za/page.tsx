import { SAIDLuhnValidation } from '@/components/fintech';
import { NCRFooter } from '@/components/legal';

export default function ZAPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-8 selection:bg-brand-navy selection:text-white">
      <div className="max-w-4xl mx-auto">
        <header className="mb-20 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
            Re3olv: ZA
          </h1>
          <p className="text-slate-400 mt-4 text-lg font-light uppercase tracking-[0.2em]">
            Debt Resolution Platform
          </p>
        </header>

        <SAIDLuhnValidation />

        <div className="grid md:grid-cols-2 gap-8 mt-12">
           <div className="p-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-2xl shadow-2xl">
              <h4 className="text-brand-navy font-bold text-xs uppercase mb-4">Regulatory Cap</h4>
              <p className="text-3xl font-black text-white">27.0% APR</p>
              <p className="text-xs text-slate-500 mt-2">Maximum interest rate permitted under the National Credit Act (ZA).</p>
           </div>
           <div className="p-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-2xl shadow-2xl">
              <h4 className="text-brand-navy font-bold text-xs uppercase mb-4">Edge Residency</h4>
              <p className="text-3xl font-black text-white">CPT-01</p>
              <p className="text-xs text-slate-500 mt-2">Data pinned to AWS af-south-1 (Cape Town) for sovereignty.</p>
           </div>
        </div>

        <NCRFooter />
      </div>
    </div>
  );
}
