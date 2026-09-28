'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('trainee');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(email, password, role);
        toast.success('Registration successful! Signing you in...');
        await login(email, password);
        onClose();
      } else {
        await login(email, password);
        toast.success('Signed in successfully');
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
      setIsSubmitting(false);
    }
  };

  // C-5: Demo credentials are only available when NEXT_PUBLIC_DEMO_MODE=true.
  // They must never ship in a production build.
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const setDemoUser = (demoRole: 'admin' | 'trainer' | 'trainee') => {
    if (!isDemoMode) return;
    if (demoRole === 'admin') {
      setEmail('admin@capacityconnect.org');
    } else if (demoRole === 'trainer') {
      setEmail('trainer.devops@capacityconnect.org');
    } else {
      setEmail('trainee1@capacityconnect.org');
    }
    setPassword('Password123!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? 'Create Capacity Connect Account' : 'Sign In to Capacity Connect'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
          />
        </div>

        {isRegister && (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Account Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="trainee">Trainee (Learner)</option>
              <option value="trainer">Trainer (Instructor)</option>
            </select>
          </div>
        )}

        {/* Demo Fast Login Buttons — only visible in demo mode */}
        {isDemoMode && (
          <div className="pt-3 border-t border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" /> Quick Demo Credentials
            </span>
            <div className="grid grid-cols-3 gap-2">
              {/* All demo buttons: neutral outlined, no colored translucency */}
              <button
                type="button"
                onClick={() => setDemoUser('admin')}
                className="btn-secondary text-xs px-2 py-1.5"
              >
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('trainer')}
                className="btn-secondary text-xs px-2 py-1.5"
              >
                Trainer Demo
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('trainee')}
                className="btn-secondary text-xs px-2 py-1.5"
              >
                Trainee Demo
              </button>
            </div>
          </div>
        )}

        {/* Solid primary submit — no gradient */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-2.5 mt-4 disabled:opacity-60"
        >
          {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
          {isSubmitting ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
