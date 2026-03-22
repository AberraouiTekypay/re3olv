import React from 'react';
import { useTranslations } from 'next-intl';
import { WaitlistForm } from '@/components/WaitlistForm';
import { Scale, Globe, ShieldCheck, Zap, Heart, MessageSquare, LineChart, Check, X } from 'lucide-react';

export default function LandingPage() {
  const t = useTranslations('Landing');

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl">
              <Scale size={24} />
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">RE3OLV</span>
          </div>
          <div className="hidden md:flex gap-8 items-center text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#philosophy" className="hover:text-indigo-600 transition-colors">{t('navigation.philosophy')}</a>
            <a href="#manifesto" className="hover:text-indigo-600 transition-colors">{t('navigation.manifesto')}</a>
            <a href="#difference" className="hover:text-indigo-600 transition-colors">{t('navigation.difference')}</a>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
            <Globe size={12} />
            Global Platform
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-50" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px] opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-[0.2em]">
              <Zap size={14} /> {t('comingSoon')}
            </div>
            <h1 className="text-7xl lg:text-9xl font-black tracking-tighter text-slate-900 leading-[0.85]">
              {t('title')}
            </h1>
            <p className="text-xl lg:text-2xl text-slate-500 font-medium max-w-lg leading-relaxed italic">
              "{t('subtitle')}"
            </p>
            
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/150?u=re3olv${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Join 2,400+ Advocates <br/>in the waitlist
              </p>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <WaitlistForm />
          </div>
        </div>
      </header>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 text-center space-y-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em]">{t('navigation.philosophy')}</h2>
            <h3 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Debt is a math problem. <br/>The debtor is a human being.
            </h3>
            <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full mt-8" />
          </div>

          <p className="text-xl lg:text-2xl text-slate-500 font-medium max-w-4xl mx-auto leading-relaxed">
            Traditional debt collection is built on friction and fear. RE3OLV is built on <strong>mediation</strong>. 
            We use artificial intelligence not to automate pressure, but to automate <strong>understanding</strong>. 
            By placing a "Human in the Loop," we ensure every resolution is sustainable, dignified, and mutually beneficial.
          </p>
        </div>
      </section>

      {/* Manifesto Section */}
      <section id="manifesto" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-20 text-center lg:text-left">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">{t('manifesto.title')}</h2>
            <h3 className="text-5xl font-black text-slate-900 tracking-tight">Three Pillars of Advocacy.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Heart className="text-pink-500" size={32} />, title: t('manifesto.pillar1Title'), desc: t('manifesto.pillar1Desc') },
              { icon: <ShieldCheck className="text-indigo-600" size={32} />, title: t('manifesto.pillar2Title'), desc: t('manifesto.pillar2Desc') },
              { icon: <LineChart className="text-green-600" size={32} />, title: t('manifesto.pillar3Title'), desc: t('manifesto.pillar3Desc') },
            ].map((pillar, i) => (
              <div key={i} className="group space-y-6 p-10 rounded-[3rem] bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all duration-500 shadow-xl shadow-slate-200/50">
                <div className="bg-white p-4 rounded-2xl shadow-md w-fit group-hover:scale-110 transition-transform duration-500">
                  {pillar.icon}
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight">{pillar.title}</h4>
                <p className="font-medium leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Difference Section */}
      <section id="difference" className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em]">{t('difference.title')}</h2>
            <h3 className="text-5xl lg:text-7xl font-black tracking-tight">The Paradigm Shift.</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-800 rounded-[4rem] overflow-hidden border border-slate-800 shadow-3xl">
            {/* Old Way */}
            <div className="bg-slate-900 p-16 space-y-12">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">The Legacy Approach</p>
                <h4 className="text-3xl font-black flex items-center gap-3 text-slate-400">
                  {t('difference.oldLabel')} <X className="text-red-500" size={24} />
                </h4>
              </div>
              <ul className="space-y-6">
                {[t('difference.old1'), t('difference.old2'), t('difference.old3'), t('difference.old4')].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-500 font-bold group">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/30 group-hover:bg-red-500 transition-colors" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* New Way */}
            <div className="bg-indigo-600 p-16 space-y-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Scale size={200} />
              </div>
              <div className="space-y-2 relative z-10">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">The Future of Finance</p>
                <h4 className="text-3xl font-black flex items-center gap-3">
                  {t('difference.newLabel')} <Check className="text-white" size={24} />
                </h4>
              </div>
              <ul className="space-y-6 relative z-10">
                {[t('difference.new1'), t('difference.new2'), t('difference.new3'), t('difference.new4')].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-white font-black group">
                    <Check className="text-indigo-200" size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-20 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 justify-between items-end gap-12 pb-12 border-b border-slate-100">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-2 rounded-xl">
                <Scale size={24} />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">RE3OLV</span>
            </div>
            <p className="text-slate-400 font-bold max-w-xs leading-relaxed">
              Human-centric advocacy for institutional debt resolution. Built for the new economy.
            </p>
          </div>
          <div className="flex gap-12 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] md:justify-end">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Compliance</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>
        </div>
        <p className="text-center md:text-left text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-12">
          &copy; 2026 RE3OLV Technologies &middot; Institutional Resolution Intelligence
        </p>
      </footer>
    </div>
  );
}
