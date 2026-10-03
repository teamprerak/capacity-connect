'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export function AccessibilityWidget() {
  const { t } = useTranslation();
  const [fontSize, setFontSize] = useState<number>(16);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('cc-font-size');
    if (saved) {
      setFontSize(parseInt(saved, 10));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.style.fontSize = `${fontSize}px`;
      localStorage.setItem('cc-font-size', fontSize.toString());
    }
  }, [fontSize, mounted]);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1 sm:gap-2 mr-1">
      {/* Font Size Adjuster */}
      <div className="hidden sm:flex items-center bg-accent/50 rounded-md border border-border overflow-hidden">
        <button 
          onClick={() => setFontSize(14)} 
          className={`px-2 py-1 text-xs font-bold transition-colors ${fontSize === 14 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
          title={t("decrease_text_size")}
        >
          A-
        </button>
        <button 
          onClick={() => setFontSize(16)} 
          className={`px-2 py-1 text-xs font-bold transition-colors border-x border-border ${fontSize === 16 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
          title={t("normal_text_size")}
        >
          A
        </button>
        <button 
          onClick={() => setFontSize(18)} 
          className={`px-2 py-1 text-xs font-bold transition-colors ${fontSize === 18 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
          title={t("increase_text_size")}
        >
          A+
        </button>
      </div>

      {/* Reusable Hybrid Language Switcher */}
      <LanguageSwitcher />
    </div>
  );
}
