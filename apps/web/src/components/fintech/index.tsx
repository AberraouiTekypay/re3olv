'use client';

import React, { useState } from 'react';

// South African ID Luhn Algorithm
const validateLuhn = (id: string): boolean => {
  if (!id || id.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let digit = parseInt(id.charAt(i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
};

export const SAIDLuhnValidation = () => {
  const [id, setId] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setId(val);
    if (val.length === 13) {
      setIsValid(validateLuhn(val));
    } else {
      setIsValid(null);
    }
  };

  return (
    <div className="bg-white/40 p-6 rounded-xl border border-white/20 glass-bank mt-4">
      <h3 className="text-brand-navy font-bold text-sm mb-4 tracking-wider uppercase flex items-center gap-2">
        Financial Health Check (ZA)
      </h3>
      <div className="flex flex-col gap-2">
         <label className="text-[10px] text-brand-slate uppercase font-bold">SA ID NUMBER</label>
         <input 
            type="text" 
            value={id} 
            onChange={handleChange}
            maxLength={13}
            placeholder="900101 5000 081"
            className="w-full bg-white/50 border border-brand-navy/10 px-4 py-3 rounded-lg text-lg font-mono tracking-widest focus:ring-2 focus:ring-brand-navy outline-none"
         />
         {isValid === true && <p className="text-green-600 text-[10px] font-bold mt-1">✓ NCR COMPLIANT ID DETECTED</p>}
         {isValid === false && <p className="text-red-600 text-[10px] font-bold mt-1">✗ INVALID ID SEQUENCE</p>}
      </div>
    </div>
  );
};

export const ArabicToggle = ({ onToggle }: { onToggle: (isArabic: boolean) => void }) => {
  const [isArabic, setIsArabic] = useState(false);

  const handleToggle = () => {
    const newVal = !isArabic;
    setIsArabic(newVal);
    onToggle(newVal);
    document.documentElement.dir = newVal ? 'rtl' : 'ltr';
  };

  return (
    <button 
      onClick={handleToggle}
      className="btn-institutional bg-brand-navy/10 text-brand-navy text-xs border border-brand-navy/20 px-4 py-2 hover:bg-brand-navy/20 transition-all font-bold tracking-widest uppercase flex items-center gap-2"
    >
      <span>{isArabic ? 'Version Française' : 'النسخة العربية'}</span>
      <span className="text-lg">🌐</span>
    </button>
  );
};
