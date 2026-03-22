'use client';

import { useState } from 'react';
import { ArabicToggle } from '@/components/fintech';

export default function MAPage() {
  const [isArabic, setIsArabic] = useState(false);

  return (
    <div className={`min-h-screen bg-slate-900 text-white font-sans p-8 selection:bg-brand-navy selection:text-white ${isArabic ? 'font-arabic' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-8">
           <ArabicToggle onToggle={setIsArabic} />
        </div>

        <header className="mb-20 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
            {isArabic ? 'Re3olv: MA | ريزولف' : 'Re3olv: MA'}
          </h1>
          <p className="text-slate-400 mt-4 text-lg font-light uppercase tracking-[0.2em]">
            {isArabic ? 'منصة حل الديون' : 'Plateforme de Résolution de Dette'}
          </p>
        </header>

        <section className="p-10 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-3xl glass-bank">
           <div className="flex flex-col gap-6">
              <div className="p-6 border border-white/10 rounded-xl bg-slate-900/40">
                 <h4 className="text-[10px] text-blue-500 font-black uppercase mb-2">Compliance CNDP</h4>
                 <p className="text-sm text-slate-300">
                    {isArabic 
                      ? 'تتم معالجة بياناتك الشخصية وفقاً للقانون رقم 09-08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي.'
                      : 'Vos données personnelles sont traitées conformément à la loi 09-08 relative à la protection des personnes physiques à l\'égard du traitement des données à caractère personnel.'
                    }
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Currency</span>
                    <span className="text-xl font-bold">12,500.00 MAD</span>
                 </div>
                 <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Interest Cap (BAM)</span>
                    <span className="text-xl font-bold text-blue-400">18.0%</span>
                 </div>
              </div>
           </div>
        </section>

        <footer className="mt-20 text-center text-[10px] uppercase tracking-widest text-slate-600 font-bold">
           Conformité CNDP Loi 09-08 | Re3olv Global MA
        </footer>
      </div>
    </div>
  );
}
