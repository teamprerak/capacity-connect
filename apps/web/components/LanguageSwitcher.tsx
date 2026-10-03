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
  const { i18n, t } = useTranslation();
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
    
    if (code === 'en') {
      i18n.changeLanguage(code);
      clearGoogTransCookie();
      setActiveLang(code);
      
      // When switching back to the base language, we must reload the page 
      // to completely flush Google Translate's DOM mutations.
      window.location.reload();
    } else {
      if (i18n.language !== 'en') {
        i18n.changeLanguage('en');
      }
      setGoogTransCookie(code);
      setActiveLang(code);
      
      // Attempt instant translation without reload
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event('change'));
      } else {
        window.location.reload();
      }
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === activeLang) || LANGUAGES[0];
  const currentLangCode = currentLang.code.toUpperCase();

  return (
    <div className="relative notranslate" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-accent transition-colors border border-transparent hover:border-border"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Select Language"
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-foreground hidden sm:inline-block uppercase">
          {currentLangCode}
        </span>
        <span className="text-[10px] ml-0.5 text-muted-foreground">▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 max-h-[80vh] overflow-y-auto bg-background text-foreground rounded-md border border-border shadow-lg z-50">
          <div className="px-3 py-2 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
             {t("language", "Language")} 
          </div>
          <ul className="py-1" role="menu">
            {LANGUAGES.map((lang) => {
              const isActive = activeLang === lang.code;
              return (
                <li key={lang.code} role="none">
                  <button
                    role="menuitem"
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-accent transition-colors ${isActive ? 'bg-accent/50 text-primary font-medium' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 flex justify-center flex-shrink-0">
                        {isActive && <Check className="w-4 h-4 text-primary" />}
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
