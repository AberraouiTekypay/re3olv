import { BankOfSpainDisclosures } from '@/components/legal';

export default function ESPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-8 selection:bg-brand-navy selection:text-white">
      <div className="max-w-4xl mx-auto">
        <header className="mb-20 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
            Re3olv: ES
          </h1>
          <p className="text-slate-400 mt-4 text-lg font-light uppercase tracking-[0.2em]">
            Plataforma de Resolución de Deudas
          </p>
        </header>

        <BankOfSpainDisclosures />

        <div className="mt-12 p-1 border-white/5 bg-white/5 rounded-3xl overflow-hidden glass-bank">
           <div className="p-8 border border-white/10 rounded-2xl bg-slate-900/40">
              <h4 className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-4">Información Supervisor</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Re3olv opera bajo las directrices de transparencia del <strong>Banco de España</strong>. Todas las tasas se calculan utilizando el método francés de amortización con transparencia total de la TAE.
              </p>
           </div>
        </div>

        <footer className="mt-20 text-center text-[10px] uppercase tracking-widest text-slate-600 font-bold">
           Regulado por el Banco de España | Re3olv Global EU
        </footer>
      </div>
    </div>
  );
}
