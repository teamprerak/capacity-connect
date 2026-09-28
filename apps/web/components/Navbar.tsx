'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import {
  ShieldCheck, User, LogOut, QrCode, BookOpen, Layers,
  LayoutDashboard, Loader2, Moon, Sun,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { QRScannerModal } from './QRScannerModal';
import { LogoutConfirmModal } from './LogoutConfirmModal';

export function Navbar() {
  const { user, isLoggingOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('auth') === 'true') {
      setIsAuthOpen(true);
    }
  }, [searchParams]);

  // Detect scroll to switch between glass-clear and glass-frosted
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Glass header: subtle blur + border, more opaque when scrolled */}
      <header
        className={`sticky top-0 z-40 w-full border-b border-border/60 transition-all duration-200 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-xs'
            : 'bg-background/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

          {/* Logo — visible in both themes */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            {/* logo-tile: slate-800 in light mode, primary blue in dark — both show white icon */}
            <div className="logo-tile icon-on-primary w-8 h-8 rounded-md flex items-center justify-center shadow-sm transition-all group-hover:opacity-90 group-hover:scale-[1.04]">
              <Layers className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Capacity Connect
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-primary -mt-0.5">
                Enterprise LMS
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground flex-1 justify-center">
            <Link href="/" className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-accent transition-all duration-150">
              Overview
            </Link>
            <Link href="/trainee/courses" className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-accent transition-all duration-150 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Courses
            </Link>
            <button
              onClick={() => setIsQROpen(true)}
              className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-accent transition-all duration-150 flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" /> Verify Cert
            </button>
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Theme toggle — always visible on all pages */}
            <button
              onClick={toggleTheme}
              className="btn-ghost p-2 rounded-md"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <>
                {/* Separator */}
                <div className="w-px h-5 bg-border mx-0.5" />

                {user.roles.includes('admin') && (
                  <Link
                    href="/admin/dashboard"
                    className="btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1.5"
                    title="Admin Console"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                {user.roles.includes('trainer') && (
                  <Link
                    href="/trainer"
                    className="btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1.5"
                    title="Trainer Studio"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Studio</span>
                  </Link>
                )}
                <Link
                  href="/trainee"
                  className="btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1.5"
                  title="My Portal"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Portal</span>
                </Link>

                {/* Sign out */}
                <button
                  onClick={() => setIsLogoutOpen(true)}
                  disabled={isLoggingOut}
                  className="btn-ghost p-2 disabled:opacity-50 text-muted-foreground hover:text-error"
                  title="Sign Out"
                >
                  {isLoggingOut
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <LogOut className="w-4 h-4" />}
                </button>
              </>
            ) : (
              <>
                <div className="w-px h-5 bg-border mx-0.5" />
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="btn-primary text-sm px-4 py-1.5"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <QRScannerModal isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
      <LogoutConfirmModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
    </>
  );
}
