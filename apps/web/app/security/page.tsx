'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck2,
  Database,
  Cpu,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

export default function SecurityArchitecturePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        {/* Hero Header */}
        <div className="border-b border-border pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-accent border border-border text-muted-foreground text-xs font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Phase 16 Hardened &bull; Production Verified</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-3">
            Security Architecture &amp; Trust Center
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Capacity Connect is engineered with defense-in-depth security principles across authentication, authorization, session management, transactional consistency, and cryptographic verification.
          </p>
        </div>

        {/* Security Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="surface-card p-5">
            <div className="w-8 h-8 rounded-md bg-accent border border-border flex items-center justify-center text-primary mb-3">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Argon2id Hashing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Resistant to GPU/ASIC cracking with cryptographic salt and memory-hard tuning.
            </p>
          </div>

          <div className="surface-card p-5">
            <div className="w-8 h-8 rounded-md bg-accent border border-border flex items-center justify-center text-primary mb-3">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Dual-JWT Rotation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Short-lived access tokens with HttpOnly, SameSite=Strict rotating refresh tokens.
            </p>
          </div>

          <div className="surface-card p-5">
            <div className="w-8 h-8 rounded-md bg-accent border border-border flex items-center justify-center text-primary mb-3">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Immutable Audit Trail</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Synchronous logging for all mutating role actions in PostgreSQL audit ledgers.
            </p>
          </div>
        </div>

        {/* In-depth Sections */}
        <div className="space-y-8 text-sm text-muted-foreground">
          {/* Section 1: Authentication */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">1</span>
              Stateless Authentication &amp; Token Reuse Detection
            </h2>
            <div className="space-y-3 leading-relaxed">
              <p>
                Authentication in Capacity Connect relies on dual-token JSON Web Tokens (JWT) designed for stateless horizontal scaling:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>Short-Lived Access Tokens:</strong> Issued with a 15-minute expiration lifespan containing user ID and active roles.
                </li>
                <li>
                  <strong>Rotating Refresh Tokens:</strong> Stored strictly in <code>HttpOnly</code>, <code>SameSite=Strict</code>, and <code>Secure</code> cookies. The frontend JavaScript runtime cannot access the refresh token, completely shielding it from Cross-Site Scripting (XSS) extraction.
                </li>
                <li>
                  <strong>Cryptographic Family Invalidation:</strong> Each refresh operation consumes the previous token and generates a new token within a tracked cryptographic lineage. If a previously consumed refresh token is presented, the system flags token reuse, immediately invalidates all active sessions for that user, and logs an alert.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: RBAC */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">2</span>
              Server-Side Role-Based Access Control (RBAC)
            </h2>
            <div className="space-y-3 leading-relaxed">
              <p>
                Client-side UI permissions are purely cosmetic helpers; all authorization boundaries are strictly enforced on the server within the NestJS API layer:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>Metadata Reflection Guards:</strong> Endpoints are annotated with granular decorators like <code>@Roles(&apos;admin&apos;)</code> or <code>@Roles(&apos;trainer&apos;)</code> evaluated by our custom <code>RolesGuard</code>.
                </li>
                <li>
                  <strong>Course State Protection:</strong> Course drafts and unpublished curricula authored by trainers are completely hidden from trainees and protected from unauthorized deletion.
                </li>
                <li>
                  <strong>Assessment Answer Isolation:</strong> Correct answer keys for quizzes and pre/post tests are stripped by database query projections before payloads are serialized to the trainee client.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: Brute Force & Rate Limiting */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">3</span>
              Brute Force Deterrence &amp; Throttling
            </h2>
            <div className="space-y-3 leading-relaxed">
              <p>
                To neutralize credential stuffing and brute force password guessing:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-md bg-accent/30 border border-border">
                  <h4 className="text-xs font-semibold text-foreground mb-1">Account Lockout Policy</h4>
                  <p className="text-xs text-muted-foreground">
                    Five (5) consecutive failed authentication attempts automatically lock the user account for 15 minutes, with exponential backoff on repeated infractions.
                  </p>
                </div>
                <div className="p-4 rounded-md bg-accent/30 border border-border">
                  <h4 className="text-xs font-semibold text-foreground mb-1">Rate Limit Guardrails</h4>
                  <p className="text-xs text-muted-foreground">
                    API endpoints are governed by NestJS <code>ThrottlerModule</code>, capping rapid automated traffic bursts per IP address and preventing denial of service.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Transactional Integrity & Audit Logs */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">4</span>
              Transactional Consistency &amp; Immutable Audit Logs
            </h2>
            <div className="space-y-3 leading-relaxed">
              <p>
                Multi-entity state mutations (e.g., scoring an assessment, updating competency levels, issuing a certificate, and creating notification events) are executed inside atomic Prisma <code>$transaction</code> blocks. If any step fails, all intermediate writes roll back completely, ensuring zero database orphan states.
              </p>
              <p>
                Simultaneously, mutating events record an immutable entry into the <code>audit_logs</code> table with:
              </p>
              <div className="p-3 rounded-md bg-card border border-border font-mono text-xs text-foreground">
                [TIMESTAMP] &bull; [ACTOR_USER_ID] &bull; [ACTION_TYPE] &bull; [TARGET_RESOURCE] &bull; [IP_ADDRESS]
              </div>
            </div>
          </section>

          {/* Section 5: Public Credential Verification */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">5</span>
              Cryptographic Credential Verification Engine
            </h2>
            <div className="space-y-3 leading-relaxed">
              <p>
                Every credential issued by Capacity Connect includes a cryptographically generated, collision-resistant token and an embedded QR code.
              </p>
              <p>
                The public verification endpoint (<code>/certificates/verify/:token</code>) performs server-side hash lookups against the authorized certificate registry. It enables prospective employers, regulators, or partner organizations to verify the validity of a qualification in real-time without requiring a login account.
              </p>
            </div>
          </section>

          {/* Section 6: AI Sandboxing */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">6</span>
              Assistive AI Sandboxing &amp; Safety
            </h2>
            <div className="space-y-3 leading-relaxed">
              <p>
                Capacity Connect’s AI services (powered by Google Gemini) are isolated behind a pluggable <code>AIService</code> abstraction:
              </p>
              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span className="text-xs"><strong>Strictly Assistive:</strong> AI is utilized for diagnostic feedback and course authoring assistance. It possesses zero mutation privileges in the PostgreSQL schema.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span className="text-xs"><strong>Sanitized Prompts:</strong> Sensitive personal credentials and passwords are never passed into AI context prompts.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span className="text-xs"><strong>Deterministic Fallbacks:</strong> In the event of AI provider rate limiting or network failure, built-in algorithmic fallbacks ensure uninterrupted user workflows.</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
