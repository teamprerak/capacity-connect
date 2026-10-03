'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { 
  LogIn, UserPlus, Mail, Lock, ChevronRight, 
  Sparkles, Eye, EyeOff, ArrowLeft 
} from 'lucide-react';
import { CapabilityNetwork } from '@/components/CapabilityNetwork';
import { PageTransition } from '@/components/PageTransition';

export default function LoginPage() {
  const router = useRouter();
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
        toast.success('Account created! Signing you in...');
        await login(email, password);
        // Redirect handled by AuthContext
      } else {
        await login(email, password);
        toast.success('Signed in successfully');
        // Redirect handled by AuthContext
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
    <PageTransition className="min-h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden">
      {/* LEFT PANE - Branding / Info */}
      <div className="w-full md:w-1/2 bg-[#0B3B59] text-white p-8 md:p-16 flex flex-col justify-center relative min-h-[40vh] md:min-h-screen">
        {/* Very subtle background depth */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_70%_80%,rgba(56,189,248,0.05),transparent_50%)]" />

        {/* The 3D Capability Network Ecosystem */}
        <CapabilityNetwork />

        <div className="relative z-10 w-full animate-fade-in-up">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to homepage
          </Link>
        </div>
        
        <div className="relative z-10 max-w-md mt-auto mb-auto animate-fade-in-left animation-delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-sky-400 mb-3">
            CAPACITY CONNECT
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight mb-4 tracking-tight text-white">
            Accelerate Meteorological Capability.
          </h1>
          <p className="text-white/80 text-sm mb-12 max-w-sm leading-relaxed">
            Secure access to specialized training modules, operational knowledge, and competency verification.
          </p>
          
          <ul className="space-y-4 text-sm text-white/90">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
              Access role-specific forecasting modules
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
              Engage with expert trainers globally
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
              Earn verifiable competency passports
            </li>
          </ul>
        </div>
      </div>

      {/* RIGHT PANE - Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-background relative animate-fade-in-right opacity-0" style={{ animationFillMode: 'forwards' }}>
        <div className="w-full max-w-[400px] surface-card p-8 rounded-2xl border border-border shadow-2xl shadow-black/5 dark:shadow-white/5">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {isRegister ? 'Create Account' : 'Sign in'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isRegister ? 'Start building competency today.' : 'Access your CAPACITY CONNECT workspace.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{ paddingLeft: '2.25rem' }}
                  className="form-input"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role selector - only on register */}
            {isRegister && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
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
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                </span>
              )}
            </button>

            {/* Demo credentials - only in demo mode */}
            {isDemoMode && !isRegister && (
              <div className="pt-4 mt-2">
                <div className="bg-accent/50 p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                      DEMO ACCOUNTS
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {(['admin', 'trainer', 'trainee'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setDemoUser(r)}
                        className="px-3 py-1.5 bg-background border border-border hover:border-primary/50 hover:bg-accent text-xs font-medium text-foreground rounded-md transition-all capitalize shadow-sm"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Password for all: <span className="font-mono text-foreground">Password123!</span>
                  </p>
                </div>
              </div>
            )}

            {/* Toggle sign-in / register */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setEmail(''); setPassword(''); }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {isRegister
                  ? 'Already have an account? Sign in'
                  : 'New user? Register for approval'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
