'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, BarChart3, Users, Building2, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

const PulseAnimation = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
    <svg width="800" height="400" viewBox="0 0 800 400" className="w-full h-full max-w-4xl">
      <motion.path
        d="M0 200 L150 200 L170 150 L200 250 L220 200 L300 200 L320 50 L360 350 L380 200 L450 200 L470 180 L500 220 L520 200 L800 200"
        fill="transparent"
        stroke="#10b981"
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "loop"
        }}
      />
      <motion.circle
        cx="0"
        cy="200"
        r="3"
        fill="#10b981"
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ offsetPath: "path('M0 200 L150 200 L170 150 L200 250 L220 200 L300 200 L320 50 L360 350 L380 200 L450 200 L470 180 L500 220 L520 200 L800 200')" }}
      />
    </svg>
  </div>
);

const SectionHeading = ({ children, badge }: { children: React.ReactNode, badge: string }) => (
  <div className="mb-16">
    <motion.span 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="inline-block px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6"
    >
      {badge}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl md:text-6xl font-black tracking-tight"
    >
      {children}
    </motion.h2>
  </div>
);

export default function PremiumLandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-400 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
          <div className="text-2xl font-black tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_30px_-5px_rgba(16,185,129,0.6)]">
              <Zap size={22} className="text-black fill-current" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">RE3OLV</span>
          </div>
          <div className="hidden lg:flex gap-12 text-[11px] uppercase tracking-[0.25em] font-black text-slate-500">
            <Link href="#solutions" className="hover:text-emerald-400 transition-all hover:tracking-[0.3em]">Solutions</Link>
            <Link href="#tech" className="hover:text-emerald-400 transition-all hover:tracking-[0.3em]">Infrastructure</Link>
            <Link href="#track" className="hover:text-emerald-400 transition-all hover:tracking-[0.3em]">Tracks</Link>
          </div>
          <Link 
            href="/api/register-redirect" 
            className="group relative px-8 py-3 bg-white text-black font-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 text-[11px] uppercase tracking-widest"
          >
            <span className="relative z-10">Access Portal</span>
            <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[12vw] md:text-9xl font-black tracking-tighter mb-8 leading-[0.8] mix-blend-difference">
              Finance <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/10">
                with a Pulse.
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-xl md:text-2xl text-slate-400 font-light mb-16 leading-relaxed tracking-tight">
              Re3olv transforms debt from a liability into a recovery journey. 
              Intelligent advocacy meeting institutional rigor across 4 global jurisdictions.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                href="/api/register-redirect" 
                className="group px-12 py-6 bg-emerald-500 text-black font-black rounded-full transition-all hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.5)] active:scale-95 text-xs uppercase tracking-[0.3em] flex items-center gap-3"
              >
                Get Started <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#tech" 
                className="px-12 py-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full transition-all backdrop-blur-xl text-xs uppercase tracking-[0.3em]"
              >
                Explore Tech
              </Link>
            </div>
          </motion.div>
        </div>

        <PulseAnimation />
        
        {/* Ambient Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
      </section>

      {/* Dual-Track Section */}
      <section id="track" className="py-40 px-6 relative bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <SectionHeading badge="The Dual Track">Tailored Recovery Paths.</SectionHeading>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* B2C Track */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="group p-12 md:p-20 rounded-[3rem] bg-[#0a0a0a] border border-white/5 hover:border-emerald-500/30 transition-all relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                  <Users size={32} />
                </div>
                <h3 className="text-4xl font-bold mb-6">For Individuals.</h3>
                <p className="text-slate-400 text-lg font-light mb-10 leading-relaxed">
                  Protect your credit future with Nova, our advocacy AI. We identify genuine hardship and build plans that actually work for your life.
                </p>
                <div className="space-y-4 mb-12">
                  {['Fair-Share Settlements', 'Credit Health Scorecard', 'Automated Dispute Engine'].map(i => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-500" /> {i}
                    </div>
                  ))}
                </div>
                <Link href="/api/register-redirect" className="inline-flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] group-hover:gap-4 transition-all">
                  Access Borrower Portal <ArrowRight size={14} />
                </Link>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
            </motion.div>

            {/* B2B Track */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="group p-12 md:p-20 rounded-[3rem] bg-[#0a0a0a] border border-white/5 hover:border-blue-500/30 transition-all relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Building2 size={32} />
                </div>
                <h3 className="text-4xl font-bold mb-6">For Enterprises.</h3>
                <p className="text-slate-400 text-lg font-light mb-10 leading-relaxed">
                  High-velocity recovery without the reputation risk. Our API-first approach integrates directly into your existing MFI workflow.
                </p>
                <div className="space-y-4 mb-12">
                  {['Multi-Tenant RLS Architecture', 'Regional Regulatory Sync', 'Recovery Velocity Analytics'].map(i => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                      <CheckCircle2 size={16} className="text-blue-500" /> {i}
                    </div>
                  ))}
                </div>
                <Link href="/api/register-redirect" className="inline-flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] group-hover:gap-4 transition-all">
                  MFI Executive Dashboard <ArrowRight size={14} />
                </Link>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Tech Stack Bento Grid */}
      <section id="tech" className="py-40 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <SectionHeading badge="The Tech Stack">Global Logic. At the Edge.</SectionHeading>
          
          <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-6">
            <div className="md:col-span-3 md:row-span-2 p-12 rounded-[3.5rem] bg-white/[0.03] border border-white/10 flex flex-col justify-between group overflow-hidden">
              <div className="relative z-10">
                <Shield className="text-emerald-500 mb-8" size={48} />
                <h4 className="text-3xl font-bold mb-6">JurisdictionEngine™</h4>
                <p className="text-slate-400 text-lg font-light leading-relaxed">
                  Our proprietary engine that detects user locality and injects regional legal logic instantly. 
                  Whether it's South Africa's NCR rules, France's CCD2 cooling-off, or Spain's Bank of Spain disclosures—compliance is hardcoded.
                </p>
              </div>
              <div className="mt-12 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {['ZA', 'FR', 'MA', 'ES'].map(country => (
                  <div key={country} className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-widest text-slate-500 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all">
                    {country} COMPLIANT
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 p-12 rounded-[3.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-between group">
              <div className="max-w-[60%]">
                <h4 className="text-xl font-bold mb-2">Regional Data Residency</h4>
                <p className="text-sm text-slate-500 font-light leading-relaxed">
                  Pinning data to Cape Town or Frankfurt to meet strict local sovereignty laws.
                </p>
              </div>
              <Globe className="text-slate-700 group-hover:text-emerald-500/50 transition-all" size={80} />
            </div>

            <div className="md:col-span-2 p-12 rounded-[3.5rem] bg-white/[0.03] border border-white/10 flex flex-col justify-center">
              <BarChart3 className="text-slate-500 mb-4" size={24} />
              <h4 className="text-xl font-bold mb-2">Recovery Velocity</h4>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Real-time tracking of ROI and social impact metrics.
              </p>
            </div>

            <div 
              onClick={() => window.location.href='/api/register-redirect'}
              className="md:col-span-1 p-8 rounded-[3.5rem] bg-emerald-500 flex flex-col items-center justify-center cursor-pointer hover:rotate-2 transition-all active:scale-95 group"
            >
              <Zap className="text-black mb-4 group-hover:scale-125 transition-transform" size={32} />
              <span className="text-[10px] font-black text-black text-center uppercase tracking-tighter leading-none">LAUNCH<br/>NOW</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-60 px-6 text-center relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-16"
          >
            Ready to <br/><span className="text-emerald-500">Restore the Pulse?</span>
          </motion.h2>
          <Link 
            href="/api/register-redirect" 
            className="inline-block px-16 py-8 bg-white text-black font-black rounded-full transition-all hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 text-sm uppercase tracking-[0.4em]"
          >
            Start Integration
          </Link>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none" />
      </section>

      <footer className="py-20 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-2xl font-black tracking-tighter">RE3OLV.</div>
          <div className="text-[10px] uppercase tracking-[0.5em] text-slate-700 font-bold text-center">
            Global Debt Infrastructure | Re3olv Global © 2026
          </div>
          <div className="flex gap-8">
            <Link href="#" className="text-slate-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Privacy</Link>
            <Link href="#" className="text-slate-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Legal</Link>
            <Link href="#" className="text-slate-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
