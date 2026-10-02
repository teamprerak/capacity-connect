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
  UserCheck,
  Video,
  Target,
  BarChart3,
  ShieldAlert,
  Database,
  Bell,
  User
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
      { href: '/profile', label: 'My Profile', icon: User },
    ],
    trainer: [
      { href: '/trainer', label: 'Trainer Studio', icon: LayoutDashboard },
      { href: '/trainer/courses/new', label: 'Course Builder', icon: PlusCircle },
      { href: '/trainer/assessments/new', label: 'MCQ Authoring', icon: FileText },
      { href: '/profile', label: 'My Profile', icon: User },
      { href: '/trainer/students', label: 'Student Approval', icon: Users },
    ],
    admin: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/users', label: 'User Approval', icon: UserCheck },
      { href: '/admin/trainers', label: 'Trainer Management', icon: Users },
      { href: '/admin/courses', label: 'Course Management', icon: BookOpen },
      { href: '/admin/media', label: 'Media Governance', icon: Video },
      { href: '/admin/competencies', label: 'Competencies', icon: Target },
      { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
      { href: '/admin/readiness', label: 'Readiness Command', icon: ShieldAlert },
      { href: '/admin/knowledge', label: 'Knowledge Continuity', icon: Database },
      { href: '/admin/content-notifications', label: 'Content & Notifications', icon: Bell },
    ],
  };

  const activeLinks = links[role];

  return (
    <>
      <aside className="w-60 bg-card border-r border-border flex flex-col p-3 shrink-0 min-h-[calc(100vh-3.5rem)]">
        {/* Role label — neutral, no colored translucency */}
        <div className="px-3 py-2 mb-3 rounded-md bg-accent border border-border">
          <span className="text-xs uppercase font-semibold tracking-wider text-muted-foreground block">
            {role} portal
          </span>
          <span className="text-xs text-muted-foreground">Capacity Connect</span>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1">
          {activeLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 pt-3 border-t border-border">
          {role === 'trainer' && (
            /* Neutral AI card — no gradient, no purple glow */
            <div className="p-3 rounded-md bg-accent border border-border">
              <div className="flex items-center gap-1.5 text-foreground text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Assistant Ready
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate course outlines &amp; assessment drafts instantly with AI.
              </p>
            </div>
          )}

          <button
            onClick={() => setIsLogoutOpen(true)}
            className="btn-ghost w-full justify-start px-3 py-2 text-sm"
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
