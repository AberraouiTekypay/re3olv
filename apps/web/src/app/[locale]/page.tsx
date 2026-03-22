import React from 'react';
import { useTranslations } from 'next-intl';
import { WaitlistForm } from '@/components/WaitlistForm';
import { Scale, Globe, Zap, ArrowRight, ShieldCheck, Check, X } from 'lucide-react';

export default function LandingPage() {
  const t = useTranslations('Landing');

  return (
    <div className="min-h-screen bg-[#FDFCFB] selection:bg-indigo-100 selection:text-indigo-900 font-sans text-[#1A1F36]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#FDFCFB]/80 backdrop-blur-md border-b border-indigo-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#2D336B] text-white p-2 rounded-xl shadow-lg shadow-indigo-900/20">
              <Scale size={24} />
            </div>
            <span className="font-black text-2xl tracking-tighter text-[#2D336B] uppercase">RE3OLV</span>
          </div>
          <div className="hidden md:flex gap-10 items-center text-[10px] font-black text-[#2D336B]/60 uppercase tracking-[0.2em]">
            <a href="#philosophy" className="hover:text-[#2D336B] transition-colors">{t('navigation.philosophy')}</a>
            <a href="#manifesto" className="hover:text-[#2D336B] transition-colors">{t('navigation.manifesto')}</a>
            <a href="#difference" className="hover:text-[#2D336B] transition-colors">{t('navigation.difference')}</a>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 text-[10px] font-black text-[#2D336B] uppercase tracking-widest">
            <Globe size={12} className="text-[#2D336B]" />
            Global Platform
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden bg-gradient-to-b from-indigo-50/30 to-transparent">
        <div className="max-w-7xl mx-auto px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#2D336B] text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-indigo-50">
              <Zap size={14} className="fill-amber-400 text-amber-400" /> {t('comingSoon')}
            </div>
            <h1 className="text-7xl lg:text-[10rem] font-black tracking-tighter text-[#2D336B] leading-[0.8] mb-4">
              Finance <br/>with a <br/>Pulse.
            </h1>
            <p className="text-xl lg:text-2xl text-[#2D336B]/70 font-medium max-w-lg leading-relaxed italic border-l-4 border-[#2D336B]/10 pl-6">
              "{t('subtitle')}"
            </p>
            
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-14 h-14 rounded-full border-4 border-[#FDFCFB] bg-slate-200 overflow-hidden shadow-xl shadow-indigo-900/10">
                    <img src={`https://images.unsplash.com/photo-${[
                      '1534528741775-53994a69daeb',
                      '1507003211169-0a1dd7228f2d',
                      '1494790108377-be9c29b29330',
                      '1500648767791-00dcc994a43e'
                    ][i-1]}?w=100&h=100&fit=crop`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-black text-[#2D336B]/40 uppercase tracking-[0.2em] leading-relaxed">
                Join 2,400+ Advocates <br/>In the Global Waitlist
              </p>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <WaitlistForm />
          </div>
        </div>
      </header>

      {/* B2C & B2B Dual Path Section */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Advocate Card (B2C) */}
          <div className="group relative overflow-hidden rounded-[3rem] bg-white border border-indigo-50 shadow-2xl shadow-indigo-900/5 hover:shadow-indigo-900/10 transition-all duration-700">
            <div className="aspect-[4/3] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80" 
                alt="Relieved Person" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
            <div className="p-12 space-y-6">
              <h3 className="text-3xl font-black tracking-tight text-[#2D336B]">{t('b2c.title')}</h3>
              <p className="text-lg text-[#2D336B]/70 font-medium leading-relaxed">
                {t('b2c.desc')}
              </p>
              <Button className="h-14 px-8 rounded-2xl bg-[#2D336B] text-white font-black uppercase tracking-widest text-[10px] group-hover:gap-4 transition-all gap-2">
                {t('b2c.cta')} <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          {/* Partner Card (B2B) */}
          <div className="group relative overflow-hidden rounded-[3rem] bg-[#2D336B] text-white shadow-2xl shadow-indigo-900/20 hover:shadow-indigo-900/30 transition-all duration-700">
            <div className="aspect-[4/3] overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
              <img 
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80" 
                alt="Professional Collaboration" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
            <div className="p-12 space-y-6">
              <h3 className="text-3xl font-black tracking-tight">{t('b2b.title')}</h3>
              <p className="text-lg text-white/70 font-medium leading-relaxed">
                {t('b2b.desc')}
              </p>
              <Button className="h-14 px-8 rounded-2xl bg-white text-[#2D336B] font-black uppercase tracking-widest text-[10px] group-hover:gap-4 transition-all gap-2">
                {t('b2b.cta')} <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-32 bg-white relative overflow-hidden border-y border-indigo-50">
        <div className="max-w-7xl mx-auto px-8 text-center space-y-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-[10px] font-black text-[#2D336B] uppercase tracking-[0.4em]">{t('navigation.philosophy')}</h2>
            <h3 className="text-5xl lg:text-7xl font-black text-[#2D336B] tracking-tight leading-[0.9]">
              Debt is a challenge. <br/>The person is a story.
            </h3>
            <div className="w-20 h-2 bg-[#2D336B] mx-auto rounded-full mt-12" />
          </div>

          <p className="text-xl lg:text-3xl text-[#2D336B]/60 font-medium max-w-4xl mx-auto leading-relaxed italic font-serif">
            "The traditional system treats debt like a binary data point. We see the human context behind the balance. RE3OLV uses technology to bridge the gap between institutional assets and individual dignity."
          </p>
        </div>
      </section>

      {/* Manifesto Section (Rich Illuminated Cards) */}
      <section id="manifesto" className="py-32 bg-[#FDFCFB]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-20 text-center">
            <h2 className="text-[10px] font-black text-[#2D336B] uppercase tracking-[0.4em] mb-4">{t('manifesto.title')}</h2>
            <h3 className="text-5xl font-black text-[#2D336B] tracking-tight uppercase">The Three Pillars.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80", 
                title: t('manifesto.pillar1Title'), 
                desc: t('manifesto.pillar1Desc') 
              },
              { 
                img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80", 
                title: t('manifesto.pillar2Title'), 
                desc: t('manifesto.pillar2Desc') 
              },
              { 
                img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80", 
                title: t('manifesto.pillar3Title'), 
                desc: t('manifesto.pillar3Desc') 
              },
            ].map((pillar, i) => (
              <div key={i} className="group relative bg-[#2D336B] rounded-[3.5rem] p-1 overflow-hidden shadow-[0_20px_50px_rgba(45,51,107,0.15)] hover:shadow-[0_20px_80px_rgba(212,175,55,0.2)] transition-all duration-700">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative bg-[#2D336B] rounded-[3.4rem] overflow-hidden h-full flex flex-col">
                  <div className="h-64 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                    <img src={pillar.img} alt={pillar.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-10 space-y-4 flex-grow flex flex-col justify-end">
                    <h4 className="text-xl font-black uppercase tracking-widest text-white leading-tight">{pillar.title}</h4>
                    <p className="text-sm font-medium leading-relaxed text-indigo-100/60 group-hover:text-white transition-colors duration-500">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Difference Section */}
      <section id="difference" className="py-32 bg-[#2D336B] text-white overflow-hidden relative border-t border-white/5">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.4em]">{t('difference.title')}</h2>
            <h3 className="text-6xl lg:text-[8rem] font-black tracking-tighter leading-none italic uppercase opacity-10 absolute -top-10 left-0 w-full">Legacy vs Future</h3>
            <h3 className="text-5xl lg:text-7xl font-black tracking-tight uppercase relative z-10">The Paradigm Shift.</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
            {/* Old Way */}
            <div className="bg-white/5 backdrop-blur-lg p-16 rounded-[4rem] border border-white/10 space-y-12">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-indigo-300/50 uppercase tracking-[0.3em]">Institutional Legacy</p>
                <h4 className="text-3xl font-black flex items-center gap-3 text-white/40">
                  {t('difference.oldLabel')} <X className="text-red-400" size={24} />
                </h4>
              </div>
              <ul className="space-y-8">
                {[t('difference.old1'), t('difference.old2'), t('difference.old3'), t('difference.old4')].map((item, i) => (
                  <li key={i} className="flex items-center gap-6 text-white/30 font-bold group">
                    <div className="w-2 h-2 rounded-full bg-red-400/20 group-hover:bg-red-400 transition-all" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* New Way */}
            <div className="bg-white p-16 rounded-[4rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] space-y-12 relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] opacity-[0.03] text-[#2D336B]">
                <Scale size={400} />
              </div>
              <div className="space-y-2 relative z-10">
                <p className="text-[10px] font-black text-[#2D336B]/40 uppercase tracking-[0.3em]">The New Standard</p>
                <h4 className="text-3xl font-black flex items-center gap-3 text-[#2D336B]">
                  {t('difference.newLabel')} <Check className="text-indigo-600" size={24} />
                </h4>
              </div>
              <ul className="space-y-8 relative z-10">
                {[t('difference.new1'), t('difference.new2'), t('difference.new3'), t('difference.new4')].map((item, i) => (
                  <li key={i} className="flex items-center gap-6 text-[#2D336B] font-black group">
                    <div className="bg-indigo-600/10 p-1 rounded-lg">
                      <Check className="text-indigo-600" size={18} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-24 bg-[#FDFCFB]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 pb-16 border-b border-indigo-50">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-[#2D336B] text-white p-2 rounded-xl">
                <Scale size={24} />
              </div>
              <span className="font-black text-2xl tracking-tighter text-[#2D336B] uppercase">RE3OLV</span>
            </div>
            <p className="text-[#2D336B]/50 font-bold max-w-xs leading-relaxed text-sm">
              Institutional debt resolution through empathetic mediation and artificial intelligence. Built for a more equitable future.
            </p>
          </div>
          <div className="flex gap-12 text-[10px] font-black uppercase text-[#2D336B]/40 tracking-[0.3em]">
            <a href="#" className="hover:text-[#2D336B] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#2D336B] transition-colors">Compliance</a>
            <a href="#" className="hover:text-[#2D336B] transition-colors">Contact</a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 gap-6">
          <p className="text-[10px] font-black text-[#2D336B]/30 uppercase tracking-[0.4em]">
            &copy; 2026 RE3OLV Technologies &middot; Global Advocacy Intel
          </p>
          <div className="flex items-center gap-4 text-[10px] font-black text-[#2D336B]/30 uppercase tracking-widest bg-white border border-indigo-50 px-6 py-3 rounded-full shadow-sm">
            <Globe size={12} /> Regional Deployment: UK / EU / MENA / LATAM
          </div>
        </div>
      </footer>
    </div>
  );
}

function Button({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button 
      className={`inline-flex items-center justify-center transition-all active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
