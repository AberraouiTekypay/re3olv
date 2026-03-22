'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function WaitlistForm() {
  const t = useTranslations('Landing');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate server action
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast.success(t('success'));
    }, 1500);
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-100 p-8 rounded-[2rem] text-center space-y-4 animate-in zoom-in-95 duration-500">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-green-600">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-black text-green-900">{t('success')}</h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-950/10 border border-slate-100">
      <div className="space-y-2">
        <Label className="font-bold text-xs uppercase tracking-widest text-slate-400 px-1">{t('emailPlaceholder')}</Label>
        <Input 
          type="email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="founder@yourbusiness.com"
          className="rounded-2xl h-14 border-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="font-bold text-xs uppercase tracking-widest text-slate-400 px-1">{t('selectCountry')}</Label>
          <Select onValueChange={setCountry} required>
            <SelectTrigger className="rounded-2xl h-14 border-2">
              <SelectValue placeholder="..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UK">United Kingdom</SelectItem>
              <SelectItem value="MA">Morocco</SelectItem>
              <SelectItem value="ES">Spain</SelectItem>
              <SelectItem value="FR">France</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-xs uppercase tracking-widest text-slate-400 px-1">{t('userType')}</Label>
          <Select onValueChange={setUserType} required>
            <SelectTrigger className="rounded-2xl h-14 border-2">
              <SelectValue placeholder="..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FOUNDER">{t('founder')}</SelectItem>
              <SelectItem value="LENDER">{t('lender')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-tighter text-lg shadow-xl shadow-indigo-900/20 gap-3"
      >
        {loading ? <Loader2 className="animate-spin" /> : null}
        {t('registerInterest')}
      </Button>
    </form>
  );
}
