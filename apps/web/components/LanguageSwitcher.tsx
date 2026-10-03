'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

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

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  const currentLangCode = i18n.language ? i18n.language.split('-')[0].toUpperCase() : 'EN';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-accent transition-colors border border-transparent hover:border-border"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Select Language"
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-foreground hidden sm:inline-block uppercase">
          {currentLangCode} ▾
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-md shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/30">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Language</span>
          </div>
          <ul className="max-h-80 overflow-y-auto py-1" role="menu">
            {LANGUAGES.map((lang) => {
              const isActive = i18n.language?.startsWith(lang.code);
              return (
                <li key={lang.code} role="none">
                  <button
                    role="menuitem"
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-accent transition-colors ${isActive ? 'bg-accent/50 text-primary font-medium' : 'text-foreground'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 flex justify-center">
                        {isActive && <Check className="w-4 h-4" />}
                      </span>
                      <span>{lang.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{lang.native}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
