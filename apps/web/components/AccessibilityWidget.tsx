'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Settings2, Type } from 'lucide-react';

export function AccessibilityWidget() {
  const [fontSize, setFontSize] = useState<number>(16);
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('cc-font-size');
    if (saved) {
      setFontSize(parseInt(saved, 10));
    }
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
    const domain = window.location.hostname;
    const cookieString = newLang === 'HI' ? 'googtrans=/en/hi' : 'googtrans=/en/en';
    
    document.cookie = `${cookieString}; path=/`;
    document.cookie = `${cookieString}; domain=${domain}; path=/`;
    document.cookie = `${cookieString}; domain=.${domain}; path=/`;
    
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1 sm:gap-2 mr-1">
      {/* Font Size Adjuster */}
      <div className="hidden sm:flex items-center bg-accent/50 rounded-md border border-border overflow-hidden">
        <button 
          onClick={() => setFontSize(14)} 
          className={`px-2 py-1 text-xs font-bold transition-colors ${fontSize === 14 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
          title="Decrease text size"
        >
          A-
        </button>
        <button 
          onClick={() => setFontSize(16)} 
          className={`px-2 py-1 text-xs font-bold transition-colors border-x border-border ${fontSize === 16 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
          title="Normal text size"
        >
          A
        </button>
        <button 
          onClick={() => setFontSize(18)} 
          className={`px-2 py-1 text-xs font-bold transition-colors ${fontSize === 18 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
          title="Increase text size"
        >
          A+
        </button>
      </div>

      {/* Language Toggle */}
      <button 
        onClick={toggleLanguage} 
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-accent transition-colors border border-transparent hover:border-border"
        title="Toggle Language"
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-foreground hidden sm:inline-block">
          {lang === 'EN' ? 'EN' : 'HI'}
        </span>
      </button>
    </div>
  );
}
