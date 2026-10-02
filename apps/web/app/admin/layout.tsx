'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { RouteGuard } from '@/components/RouteGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['admin']}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 max-w-7xl mx-auto w-full overflow-hidden">
          <Sidebar role="admin" />
          <main className="flex-1 min-w-0 p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
