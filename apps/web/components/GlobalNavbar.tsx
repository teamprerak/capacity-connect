'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

export function GlobalNavbar() {
  const pathname = usePathname();

  // Hide the navbar entirely on authentication routes
  if (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password') {
    return null;
  }

  // Render the persistent Navbar wrapped in Suspense to prevent CSR bailout errors during static generation
  return (
    <Suspense fallback={<header className="h-14 border-b border-border/60 bg-background/80" />}>
      <Navbar />
    </Suspense>
  );
}
