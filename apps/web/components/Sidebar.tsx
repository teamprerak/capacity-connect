'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Users,
  ShieldCheck,
  CheckCircle,
  FileText,
  PlusCircle,
  Sparkles,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { LogoutConfirmModal } from './LogoutConfirmModal';

interface SidebarProps {
  role: 'trainee' | 'trainer' | 'admin';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const links = {
    trainee: [
      { href: '/trainee', label: 'My Dashboard', icon: LayoutDashboard },
      { href: '/trainee/courses', label: 'Course Catalog', icon: BookOpen },
      { href: '/trainee/certificates', label: 'Certificate Vault', icon: Award },
    ],
    trainer: [
      { href: '/trainer', label: 'Trainer Studio', icon: LayoutDashboard },
      { href: '/trainer/courses/new', label: 'Course Builder', icon: PlusCircle },
      { href: '/trainer/assessments/new', label: 'MCQ Authoring', icon: FileText },
    ],
    admin: [
      { href: '/admin/dashboard', label: 'Executive Analytics', icon: LayoutDashboard },
      { href: '/admin/users', label: 'User & Verification', icon: Users },
      { href: '/admin/courses', label: 'Course Moderation', icon: CheckCircle },
      { href: '/admin/audit-logs', label: 'Audit Log Stream', icon: ShieldCheck },
    ],
  };

  const activeLinks = links[role];

  return (
    <>
      <aside className="w-64 bg-card border border-border shadow-sm border-r border-border flex flex-col p-4 shrink-0 min-h-[calc(100vh-4rem)]">
        <div className="px-3 py-2 mb-4 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-[11px] uppercase font-bold tracking-wider text-primary block">
            {role} portal
          </span>
          <span className="text-xs text-muted-foreground font-medium">Capacity Connect Workspace</span>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          {activeLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/20 text-primary border border-blue-500/30 shadow-sm shadow-blue-500/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          {role === 'trainer' && (
            <div className="p-3 rounded-md bg-gradient-to-tr from-purple-900/30 to-indigo-900/30 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold mb-1">
                <Sparkles className="w-4 h-4 text-purple-400" /> AI Assistant Ready
              </div>
              <p className="text-[11px] text-muted-foreground">
                Generate course outlines & assessment drafts instantly with AI.
              </p>
            </div>
          )}

          <button
            onClick={() => setIsLogoutOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
      <LogoutConfirmModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
    </>
  );
}
