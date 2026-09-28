'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { ShieldCheck, User, LogOut, QrCode, BookOpen, Layers, Award, LayoutDashboard, Loader2, Moon, Sun } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { QRScannerModal } from './QRScannerModal';
import { LogoutConfirmModal } from './LogoutConfirmModal';

export function Navbar() {
  const { user, isLoggingOut } = useAuth();
  const { theme, toggleTheme, isPortal } = useTheme();
  const searchParams = useSearchParams();

  // L-5: Derive theme-aware class sets.
  // Non-portal pages (landing) always render dark. Portal pages respect theme.
  const isDark = !isPortal || theme === 'dark';

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('auth') === 'true') {
      setIsAuthOpen(true);
    }
  }, [searchParams]);

  return (
    <>
      {/* Solid header — no backdrop-blur, 1px bottom border only */}
      <header className="sticky top-0 z-40 bg-background border-b border-border w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Solid primary tile — no gradient, no glow */}
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center transition-opacity group-hover:opacity-85">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              {/* Solid text — no gradient */}
              <span className="text-sm font-semibold text-foreground tracking-tight">
                Capacity Connect
              </span>
              <span className="text-[11px] tracking-wider uppercase font-medium text-muted-foreground -mt-0.5">
                Enterprise LMS
              </span>
            </div>
          </Link>

          {/* Nav links — one hover style */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors duration-150">
              Overview
            </Link>
            <Link href="/trainee/courses" className="hover:text-foreground transition-colors duration-150 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Courses
            </Link>
            <button
              onClick={() => setIsQROpen(true)}
              className="hover:text-foreground transition-colors duration-150 flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" /> Verify Cert
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Neutral role badges — no colored translucency */}
                {user.roles.includes('admin') && (
                  <Link
                    href="/admin/dashboard"
                    className="btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Console
                  </Link>
                )}
                {user.roles.includes('trainer') && (
                  <Link
                    href="/trainer"
                    className="btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Trainer Studio
                  </Link>
                )}
                <Link
                  href="/trainee"
                  className="btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" /> Portal
                </Link>
                {isPortal && (
                  <button
                    onClick={toggleTheme}
                    className="btn-ghost p-2"
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => setIsLogoutOpen(true)}
                  disabled={isLoggingOut}
                  className="btn-ghost p-2 disabled:opacity-50"
                  title="Log Out"
                >
                  {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              /* Solid primary button — no gradient */
              <button
                onClick={() => setIsAuthOpen(true)}
                className="btn-primary text-sm px-4 py-2"
              >
                Sign In
              </button>
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
