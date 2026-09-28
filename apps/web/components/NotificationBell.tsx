'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, X, CheckCheck, BookOpen, Award, AlertTriangle, UserPlus, ShieldCheck } from 'lucide-react';
import { useNotifications, AppNotification } from '@/lib/use-notifications';
import { useAuth } from '@/lib/auth-context';

function notificationIcon(type: string) {
  const cls = 'w-4 h-4 shrink-0';
  switch (type) {
    case 'enrollment':         return <BookOpen className={`${cls} text-primary`} />;
    case 'new_enrollment':     return <UserPlus className={`${cls} text-success`} />;
    case 'course_approved':    return <ShieldCheck className={`${cls} text-success`} />;
    case 'course_rejected':    return <AlertTriangle className={`${cls} text-error`} />;
    case 'assessment_passed':  return <Award className={`${cls} text-success`} />;
    case 'assessment_failed':  return <AlertTriangle className={`${cls} text-warning`} />;
    case 'certificate_issued': return <Award className={`${cls} text-primary`} />;
    default:                   return <Bell className={`${cls} text-muted-foreground`} />;
  }
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead, dismiss } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  // Mark all read when panel opens
  useEffect(() => {
    if (open && unreadCount > 0) {
      setTimeout(markAllRead, 1000); // 1 s delay so user sees the badge briefly
    }
  }, [open, unreadCount, markAllRead]);

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-[7px] h-[7px] rounded-full bg-primary border-2 border-background" />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-80 bg-card border border-border rounded-xl shadow-lg z-[200] overflow-hidden"
          role="dialog"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1"
                  title="Mark all read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-7 h-7 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationRow key={n.id} n={n} onDismiss={() => dismiss(n.id)} onClose={() => setOpen(false)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  n,
  onDismiss,
  onClose,
}: {
  n: AppNotification;
  onDismiss: () => void;
  onClose: () => void;
}) {
  const inner = (
    <div className={`flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors group ${!n.read ? 'bg-primary/5' : ''}`}>
      <div className="mt-0.5">{notificationIcon(n.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">{timeAgo(n.createdAt)}</p>
      </div>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDismiss(); }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-foreground transition-all shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );

  if (n.link) {
    return (
      <Link href={n.link} onClick={onClose}>
        {inner}
      </Link>
    );
  }
  return <div>{inner}</div>;
}
