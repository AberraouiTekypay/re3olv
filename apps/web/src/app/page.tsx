'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, BarChart3, Users, Building2, ArrowRight } from 'lucide-react';

const PulseAnimation = () => (
  <svg width="400" height="200" viewBox="0 0 400 200" className="opacity-30">
    <motion.path
      d="M0 100 L50 100 L60 40 L80 160 L90 100 L150 100 L160 20 L180 180 L190 100 L250 100 L260 60 L280 140 L290 100 L400 100"
      fill="transparent"
      stroke="#10b981"
      strokeWidth="2"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: "linear",
        opacity: { duration: 1 }
      }}
    />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="text-xl font-black tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]">
              <Zap size={18} className="text-black fill-current" />
            </div>
            <span>RE3OLV</span>
          </div>
          <div className="hidden md:flex gap-10 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
            <Link href="#solutions" className="hover:text-emerald-400 transition-colors">Solutions</Link>
            <Link href="#tech" className="hover:text-emerald-400 transition-colors">Technology</Link>
            <Link href="#compliance" className="hover:text-emerald-400 transition-colors">Regulatory</Link>
          </div>
          <Link 
            href="/api/register-redirect" 
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-all text-xs uppercase tracking-widest active:scale-95"
          >
            Enter Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85]">
              Finance <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
                with a Pulse.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-light mb-12 leading-relaxed">
              Intelligent debt resolution for a global economy. 
              Regionalized compliance and AI-driven advocacy for MFIs and borrowers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/api/register-redirect" 
                className="group px-10 py-5 bg-white text-black font-bold rounded-full transition-all hover:bg-emerald-500 active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#tech" 
                className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full transition-all backdrop-blur-xl text-xs uppercase tracking-widest"
              >
                The Architecture
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Hero Background Animation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 -z-0">
          <PulseAnimation />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
      </section>

      {/* Dual-Track Section */}
      <section id="solutions" className="py-32 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-px bg-white/5">
          {/* B2C Track */}
          <div className="bg-[#0a0a0a] p-16 md:p-24 flex flex-col justify-center border-r border-white/5">
            <Users className="text-emerald-500 mb-8" size={40} />
            <h2 className="text-4xl font-bold mb-6 tracking-tight">For Individuals.</h2>
            <p className="text-slate-400 mb-10 leading-relaxed font-light text-lg">
              Recover your credit health with dignity. Our AI-driven advocacy shield 
              detects hardship and facilitates settlement plans tailored to your reality.
            </p>
            <ul className="space-y-4 mb-12">
              {['Nova Hardship Detection', 'Zero-Penalty Plans', 'Legal Advocacy Shield'].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm font-bold tracking-wider text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {feat.toUpperCase()}
                </li>
              ))}
            </ul>
            <Link href="/api/register-redirect" className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2 hover:gap-4 transition-all group">
              Individual Portal <ArrowRight size={14} />
            </Link>
          </div>

          {/* B2B Track */}
          <div className="bg-[#0a0a0a] p-16 md:p-24 flex flex-col justify-center">
            <Building2 className="text-blue-500 mb-8" size={40} />
            <h2 className="text-4xl font-bold mb-6 tracking-tight">For Enterprises.</h2>
            <p className="text-slate-400 mb-10 leading-relaxed font-light text-lg">
              Maximize recovery velocity with API-first infrastructure. Enforce regional 
              regulations automatically while maintaining institutional reputation.
            </p>
            <ul className="space-y-4 mb-12">
              {['Multi-Regional Compliance', 'Real-time ROI Dashboard', 'White-label Integration'].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm font-bold tracking-wider text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {feat.toUpperCase()}
                </li>
              ))}
            </ul>
            <Link href="/api/register-redirect" className="text-blue-400 font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2 hover:gap-4 transition-all group">
              MFI Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Stack Bento Grid */}
      <section id="tech" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.5em] mb-4">The Infrastructure</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">Global Logic. Edge-Resident.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
            <div className="md:col-span-2 md:row-span-2 p-10 rounded-[2.5rem] bg-white/5 border border-white/10 relative overflow-hidden flex flex-col justify-end">
              <div className="absolute top-10 left-10 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <Shield className="text-emerald-500" size={32} />
              </div>
              <h4 className="text-2xl font-bold mb-4">JurisdictionEngine™</h4>
              <p className="text-slate-400 font-light leading-relaxed">
                Automated enforcement of NCR (ZA), GDPR (EU), and CNDP (MA) regulations at the network edge. 
                Our middleware ensures every transaction is compliant by default.
              </p>
            </div>

            <div className="md:col-span-2 p-10 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col justify-between">
              <Globe className="text-slate-500" size={24} />
              <div>
                <h4 className="text-xl font-bold mb-2">Regional Pinning</h4>
                <p className="text-sm text-slate-500 font-light leading-relaxed">
                  Data Sovereignty via CPT-01 (ZA) and FRA-01 (EU) regional pinning.
                </p>
              </div>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col justify-between">
              <BarChart3 className="text-slate-500" size={24} />
              <div>
                <h4 className="text-xl font-bold mb-2">ROI Analytics</h4>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  High-fidelity tracking of recovery velocity.
                </p>
              </div>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-emerald-500 group cursor-pointer overflow-hidden relative flex flex-col justify-between" onClick={() => window.location.href='/api/register-redirect'}>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-black/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <Zap className="text-black" size={24} />
              <div className="relative z-10">
                <h4 className="text-xl font-black text-black uppercase tracking-tighter leading-none mb-1">Launch<br/>Portal</h4>
                <ArrowRight className="text-black" size={20} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 text-center bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.1)_0%,transparent_50%)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-10">Ready to Re3olv?</h2>
          <Link 
            href="/api/register-redirect" 
            className="inline-block px-12 py-6 bg-white text-black font-black rounded-full transition-all hover:bg-emerald-500 active:scale-95 text-sm uppercase tracking-[0.3em]"
          >
            Start Integration
          </Link>
        </div>
      </section>

      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-lg font-black tracking-tighter">RE3OLV.</div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-slate-600 font-bold text-center">
            Institutional Debt Resolution Platform | Global Infrastructure 2026
          </div>
          <div className="flex gap-6">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer">
              <Globe size={14} />
            </div>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer">
              <Shield size={14} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
