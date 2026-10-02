'use client';

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function AccessibilityBar() {
  const [fontSize, setFontSize] = useState<number>(16);
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('cc-font-size');
    if (saved) {
      setFontSize(parseInt(saved, 10));
    }
    
    // Check google translate cookie for Hindi
    const hasHiCookie = document.cookie.includes('googtrans=/en/hi');
    if (hasHiCookie) setLang('HI');
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.style.fontSize = `${fontSize}px`;
      localStorage.setItem('cc-font-size', fontSize.toString());
    }
  }, [fontSize, mounted]);

  const toggleLanguage = () => {
    const newLang = lang === 'EN' ? 'HI' : 'EN';
    
    // Google translate requires cookies to be set on domain and path
    const domain = window.location.hostname;
    const cookieString = newLang === 'HI' ? 'googtrans=/en/hi' : 'googtrans=/en/en';
    
    document.cookie = `${cookieString}; path=/`;
    document.cookie = `${cookieString}; domain=${domain}; path=/`;
    document.cookie = `${cookieString}; domain=.${domain}; path=/`;
    
    window.location.reload();
  };

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div className="bg-[#0f172a] text-white flex justify-end items-center px-4 sm:px-8 py-1.5 gap-4 text-sm border-b border-white/10 z-50 relative">
      <div className="flex bg-[#1e293b] rounded overflow-hidden shadow-inner border border-white/5">
        <button 
          onClick={() => setFontSize(14)} 
          className={`px-3 py-1 font-bold transition-colors ${fontSize === 14 ? 'bg-[#0ea5e9] text-white' : 'text-slate-300 hover:bg-white/10'}`}
          aria-label="Decrease text size"
        >
          A-
        </button>
        <button 
          onClick={() => setFontSize(16)} 
          className={`px-3 py-1 font-bold transition-colors border-x border-white/5 ${fontSize === 16 ? 'bg-[#0ea5e9] text-white' : 'text-slate-300 hover:bg-white/10'}`}
          aria-label="Normal text size"
        >
          A
        </button>
        <button 
          onClick={() => setFontSize(18)} 
          className={`px-3 py-1 font-bold transition-colors ${fontSize === 18 ? 'bg-[#0ea5e9] text-white' : 'text-slate-300 hover:bg-white/10'}`}
          aria-label="Increase text size"
        >
          A+
        </button>
      </div>
      
      <button 
        onClick={toggleLanguage} 
        className="flex items-center gap-2 border border-orange-400/30 bg-orange-400/10 rounded px-3 py-1 hover:bg-orange-400/20 transition-colors"
      >
        <Globe className="w-4 h-4 text-orange-400" />
        <span className="font-semibold text-orange-400">{lang === 'EN' ? 'English (EN)' : 'हिन्दी (HI)'}</span>
      </button>
      
      {/* Hidden div required by Google Translate */}
      <div id="google_translate_element" className="hidden"></div>
    </div>
  );
}
