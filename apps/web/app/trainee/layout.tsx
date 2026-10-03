'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RouteGuard } from '@/components/RouteGuard';
import { PageTransition } from '@/components/PageTransition';

export default function TraineeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['trainee']}>
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-1 max-w-7xl mx-auto w-full">
          <Sidebar role="trainee" />
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
