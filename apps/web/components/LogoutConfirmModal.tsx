'use client';

import React from 'react';
import { Modal } from './Modal';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutConfirmModal({ isOpen, onClose }: LogoutConfirmModalProps) {
  const { logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign out?"
      description="You'll be returned to the landing page."
    >
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Are you sure you want to sign out of Capacity Connect? Your progress and settings are saved.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          {/* Muted danger — not neon red */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold
              bg-red-50 text-red-700 border border-red-200
              hover:bg-red-100 hover:border-red-300
              dark:bg-red-950 dark:text-red-700 dark:border-red-900 dark:hover:bg-red-900
              transition-colors duration-150 disabled:opacity-50"
          >
            {isLoggingOut
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <LogOut className="w-4 h-4" />}
            {isLoggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
