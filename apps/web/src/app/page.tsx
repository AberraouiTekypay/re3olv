import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-brand-navy selection:text-white">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
          RE3OLV
        </div>
        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
          <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
          <Link href="#compliance" className="hover:text-white transition-colors">Compliance</Link>
          <Link href="/api/register-redirect" className="text-white border-b border-blue-500 pb-1">Enter Portal</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
          Institutional <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
            Debt Resolution.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-light mb-12 leading-relaxed">
          The global platform for Microfinance Institutions to automate hardship detection, 
          enforce regional compliance, and facilitate empathetic debt settlements at scale.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link 
            href="/api/register-redirect" 
            className="w-full md:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-95 text-sm uppercase tracking-widest"
          >
            Get Started
          </Link>
          <Link 
            href="#solutions" 
            className="w-full md:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full transition-all backdrop-blur-xl text-sm uppercase tracking-widest"
          >
            View Solutions
          </Link>
        </div>

        {/* Glass Cards Preview */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
           {[
             { title: 'NCR Compliant', region: 'South Africa', code: 'ZA' },
             { title: 'GDPR / CCD2', region: 'European Union', code: 'FR/ES' },
             { title: 'CNDP Protected', region: 'Morocco', code: 'MA' }
           ].map((item) => (
             <div key={item.code} className="p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-3xl text-left hover:border-blue-500/30 transition-colors group">
                <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">{item.region}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Automated regional logic and edge-data residency for {item.region} jurisdictions.</p>
             </div>
           ))}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 text-center">
         <div className="text-[10px] uppercase tracking-[0.4em] text-slate-600 font-bold">
            Re3olv Global © 2026 | Hardened Institutional Infrastructure
         </div>
      </footer>
    </div>
  );
}
