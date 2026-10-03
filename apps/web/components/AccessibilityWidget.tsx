'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'brx', name: 'Bodo', native: 'बड़ो' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ks', name: 'Kashmiri', native: 'कश्मीरी' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'mni', name: 'Manipuri', native: 'ꯃꯤꯇꯩ ꯂꯣꯟ' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'sat', name: 'Santali', native: 'संताली' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ur', name: 'Urdu', native: 'اردو' }
];

export function AccessibilityWidget() {
  const { i18n } = useTranslation();
  const [fontSize, setFontSize] = useState<number>(16);
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('selectedLanguage', code);
    setIsDropdownOpen(false);
  };

  if (!mounted) return null;

  const currentLangCode = i18n.language || 'en';
  const currentLang = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];

  return (
    <div className="flex items-center gap-1 sm:gap-2 mr-1">
      {/* Font Size Adjuster */}
      <div className="hidden sm:flex items-center bg-accent/50 rounded-md border border-border overflow-hidden">
        <button 
          onClick={() => setFontSize(14)} 
          className={`px-2 py-1 text-xs font-bold transition-colors ${fontSize === 14 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
          title={t("decrease_text_size")}
        >
           {t("a_")} </button>
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
           {t("a__1")} </button>
      </div>

      {/* Language Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-accent transition-colors border border-transparent hover:border-border"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
          aria-label="Select Language"
        >
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-foreground hidden sm:inline-block uppercase">
            {currentLang.code}
          </span>
          <span className="text-[10px] ml-0.5 text-muted-foreground">▾</span>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto bg-popover text-popover-foreground rounded-md border border-border shadow-md z-50">
            <div className="px-3 py-2 border-b border-border text-xs font-semibold text-muted-foreground">
               {t("language")} </div>
            <ul className="py-1">
              {LANGUAGES.map((lang) => {
                const isActive = lang.code === currentLangCode;
                return (
                  <li key={lang.code}>
                    <button
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-accent transition-colors ${isActive ? 'bg-accent/50 font-medium' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 flex-shrink-0">
                          {isActive && <Check className="w-4 h-4 text-primary" />}
                        </span>
                        <span>{lang.name}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">{lang.native}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
