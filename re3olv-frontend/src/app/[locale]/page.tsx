import React from 'react';
import { useTranslations } from 'next-intl';
import { WaitlistForm } from '@/components/WaitlistForm';
import { Scale, Globe, ShieldCheck, Zap } from 'lucide-react';

export default function LandingPage() {
  const t = useTranslations('Landing');

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <Scale size={24} />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">RE3OLV</span>
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm text-xs font-bold text-slate-500">
            <Globe size={14} className="text-indigo-600" />
            Global Platform v1.0
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-[0.2em]">
            <Zap size={14} /> {t('comingSoon')}
          </div>
          <h1 className="text-6xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[0.9]">
            {t('title')}
          </h1>
          <p className="text-xl lg:text-2xl text-slate-500 font-medium max-w-lg leading-relaxed">
            {t('subtitle')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-50">
                <ShieldCheck className="text-indigo-600" size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 uppercase text-xs mb-1">Empathetic AI</h4>
                <p className="text-xs text-slate-400 font-medium">Human-centric debt resolution via Nova.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-50">
                <Globe className="text-indigo-600" size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 uppercase text-xs mb-1">Global Compliance</h4>
                <p className="text-xs text-slate-400 font-medium">Tailored for UK, EU, and Emerging Markets.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
          <WaitlistForm />
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-8 py-12 border-t border-slate-100 mt-20 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          &copy; 2026 RE3OLV Technologies &middot; Bridging the Gap in Financial Stability
        </p>
        <div className="flex gap-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Compliance</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
