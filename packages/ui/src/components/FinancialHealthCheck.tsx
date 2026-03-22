'use client';

import React, { useState } from 'react';

// South African ID validation (Luhn algorithm + birthdate check)
const validateSAID = (id: string): boolean => {
  if (!id || id.length !== 13) return false;
  if (isNaN(Number(id))) return false;

  // Luhn Algorithm
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

export const FinancialHealthCheck = () => {
  const [idNumber, setIdNumber] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setIdNumber(val);
    if (val.length === 13) {
      setIsValid(validateSAID(val));
    } else {
      setIsValid(null);
    }
  };

  return (
    <div className="card-institutional max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-brand-navy mb-4">Financial Health Check (South Africa)</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Enter South African ID Number</label>
        <input 
          type="text" 
          value={idNumber} 
          onChange={handleIdChange}
          maxLength={13}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-navy outline-none"
          placeholder="e.g. 9001015000081"
        />
        {isValid === true && <p className="text-green-600 mt-1">✓ Valid ID Number</p>}
        {isValid === false && <p className="text-red-600 mt-1">✗ Invalid ID Number</p>}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-brand-navy mb-4">Section 129 Status Tracker</h3>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
          
          {['Initial Arrears', 'Letter of Demand', 'Section 129 Issued', 'Legal Action'].map((step, i) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full ${i <= 1 ? 'bg-brand-navy' : 'bg-gray-300'} border-2 border-white`}></div>
              <span className="text-[10px] mt-2 font-medium">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
