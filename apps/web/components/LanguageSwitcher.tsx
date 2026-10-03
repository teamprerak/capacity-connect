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

// Helper to manage google translate cookies
function setGoogTransCookie(code: string) {
  document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;
  document.cookie = `googtrans=/en/${code}; path=/`;
}
function clearGoogTransCookie() {
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}
function getGoogTransLang() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
  return match ? match[1] : null;
}

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('en');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial sync
    const googLang = getGoogTransLang();
    if (googLang && googLang !== 'en') {
      setActiveLang(googLang);
    } else {
      setActiveLang(i18n.language ? i18n.language.split('-')[0] : 'en');
    }

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [i18n.language]);

  const changeLanguage = (code: string) => {
    setIsOpen(false);
    
    if (code === 'en' || code === 'hi') {
      // Use native react-i18next translation
      i18n.changeLanguage(code);
      clearGoogTransCookie();
      setActiveLang(code);
      // Reload if we were previously using Google Translate to clear its DOM changes
      if (getGoogTransLang()) {
        window.location.reload();
      }
    } else {
      // Ensure native DOM is english before translating
      if (i18n.language !== 'en') {
        i18n.changeLanguage('en');
      }
      setGoogTransCookie(code);
      setActiveLang(code);
      window.location.reload();
    }
  };

  const currentLangCode = activeLang.toUpperCase();

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
              const isActive = activeLang === lang.code;
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
