import { CCD2CoolingOff } from '@/components/legal';

export default function FRPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-8 selection:bg-brand-navy selection:text-white">
      <div className="max-w-4xl mx-auto">
        <header className="mb-20 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
            Re3olv: FR
          </h1>
          <p className="text-slate-400 mt-4 text-lg font-light uppercase tracking-[0.2em]">
            Plateforme de Résolution de Dette
          </p>
        </header>

        <section className="p-10 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
           <h3 className="text-brand-navy font-black text-sm uppercase tracking-[0.3em] mb-6">Compliance Data</h3>
           <div className="grid gap-4">
              <div className="p-4 bg-brand-navy/5 rounded-xl flex justify-between items-center">
                 <span className="text-slate-400 text-xs font-bold uppercase">Juridiction</span>
                 <span className="font-mono text-xs">EU-FR-GDPR</span>
              </div>
              <div className="p-4 bg-brand-navy/5 rounded-xl flex justify-between items-center">
                 <span className="text-slate-400 text-xs font-bold uppercase">Rate Cap (Usury)</span>
                 <span className="font-mono text-xs text-blue-400 font-bold">21.0%</span>
              </div>
           </div>

           <CCD2CoolingOff />
        </section>

        <footer className="mt-20 text-center text-[10px] uppercase tracking-widest text-slate-600 font-bold">
           Conformité RGPD / CNIL No. 987654321 | Re3olv Global EU
        </footer>
      </div>
    </div>
  );
}
