'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

export function GlobalNavbar() {
  const pathname = usePathname();

  // Hide the navbar entirely on authentication routes
  if (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password') {
    return null;
  }

  // Render the persistent Navbar
  return <Navbar />;
}
