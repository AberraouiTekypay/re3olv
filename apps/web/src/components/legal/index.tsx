'use client';

import React, { useState, useEffect } from 'react';

export const CCD2CoolingOff = () => {
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="bg-brand-navy/10 border border-brand-navy/20 p-4 rounded-lg glass-bank mt-4">
      <h4 className="text-brand-navy font-bold text-sm uppercase">CCD2 Cooling-Off Period (France)</h4>
      <p className="text-xs text-brand-slate mt-1">
        Conformément à la directive CCD2, vous disposez d'un délai de réflexion de 24 heures.
      </p>
      <div className="mt-2 text-lg font-mono font-bold text-brand-navy">
        Temps restant: {formatTime(timeLeft)}
      </div>
    </div>
  );
};

export const BankOfSpainDisclosures = () => {
  return (
    <div className="bg-white/40 p-6 rounded-xl border border-white/20 glass-bank shadow-xl mt-6">
      <h3 className="text-brand-navy font-bold mb-3 flex items-center gap-2">
        <span>🇪🇸</span> Transparencia Bancaria (España)
      </h3>
      <div className="text-sm space-y-3 text-brand-slate">
        <p>
          Este servicio está sujeto a la normativa de transparencia y protección del cliente del <strong>Banco de España</strong>.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li>Ficha de Información Normalizada (FEIN)</li>
          <li>Ficha de Advertencias Estandarizadas (FiAE)</li>
          <li>Cálculo de la TAE según directrices del supervisor</li>
        </ul>
      </div>
    </div>
  );
};

export const NCRFooter = () => (
  <footer className="mt-20 border-t border-brand-navy/10 pt-8 pb-12 px-4 text-center">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-brand-slate/60 font-medium">
      <span>Registered Credit Provider NCRCP12345</span>
      <span className="hidden md:block">|</span>
      <span>POPIA Compliant Data Processing</span>
      <span className="hidden md:block">|</span>
      <span>© 2026 Re3olv Global</span>
    </div>
  </footer>
);
