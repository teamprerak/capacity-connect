'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { LogIn, UserPlus, Mail, Lock, ChevronRight, Sparkles, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('trainee');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(email, password, role);
        toast.success('Account created! Signing you in…');
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

  const setDemoUser = (demoRole: 'admin' | 'trainer' | 'trainee') => {
    if (!isDemoMode) return;
    if (demoRole === 'admin') setEmail('admin@capacityconnect.org');
    else if (demoRole === 'trainer') setEmail('trainer.devops@capacityconnect.org');
    else setEmail('trainee1@capacityconnect.org');
    setPassword('Password123!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? 'Create your account' : 'Sign in to Capacity Connect'}
      description={isRegister ? 'Start building competency today.' : 'Enter your credentials to continue.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="form-input pl-9"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Role selector — only on register */}
        {isRegister && (
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Account role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input"
            >
              <option value="trainee">Trainee (Learner)</option>
              <option value="trainer">Trainer (Instructor)</option>
            </select>
          </div>
        )}

        {/* Demo credentials — only in demo mode */}
        {isDemoMode && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Quick demo login
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'trainer', 'trainee'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDemoUser(r)}
                  className="btn-secondary text-xs py-1.5 capitalize"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-2.5 mt-2 disabled:opacity-60 text-sm font-semibold"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Authenticating…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {isRegister ? 'Create Account' : 'Sign In'}
              <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
            </span>
          )}
        </button>

        {/* Toggle sign-in / register */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setEmail(''); setPassword(''); }}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {isRegister
              ? 'Already have an account? Sign in →'
              : "Don't have an account? Create one →"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
