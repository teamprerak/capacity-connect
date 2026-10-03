'use client';

import React from 'react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import {
  Layers,
  Sparkles,
  BrainCircuit,
  Users,
  Award,
  ShieldCheck,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  Code2,
  Cpu,
  Heart,
  CheckCircle2,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
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
        <div className="border-b border-border pb-10 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-accent border border-border text-muted-foreground text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>About Capacity Connect &amp; Team Prerak</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground mb-4">
            Empowering Workforce Potential Through Measured Competency
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Capacity Connect is an industrial-grade learning management and workforce capacity orchestration platform designed to replace guesswork with data-driven skill matrices, automated matching, and verifiable credentials.
          </p>
        </div>

        {/* Section 1: The Meaning of Prerak */}
        <section className="surface-card p-6 sm:p-8 mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
                The Origin
              </span>
              <h2 className="text-xl font-semibold text-foreground">Who is Team Prerak?</h2>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-accent border border-border text-xs font-semibold text-foreground">
              प्रेरक &bull; Catalyst &bull; Inspirer
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            In Sanskrit and Hindi, <strong>Prerak (प्रेरक)</strong> signifies a catalyst, a driving force, or an inspiring entity that sets progress in motion. We are a specialized software engineering and design collective dedicated to solving hard operational bottlenecks in organizational education, capability building, and institutional governance.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Engineered by a collaborative collective of six dedicated developers, designers, and systems architects, Team Prerak conceived Capacity Connect to bridge the systemic divide between corporate training programs, measurable employee competency, and tamper-proof verification.
          </p>
        </section>

        {/* Section 2: The Core Problem We Solve */}
        <section className="mb-12">
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
              The Challenge
            </span>
            <h2 className="text-2xl font-semibold text-foreground">Why We Built Capacity Connect</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="surface-card p-5">
              <div className="w-8 h-8 rounded-md bg-accent border border-border flex items-center justify-center text-primary mb-3">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Invisible Skill Gaps</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Most organizations mandate standard training without calculating the actual proficiency delta between current capabilities and departmental targets.
              </p>
            </div>

            <div className="surface-card p-5">
              <div className="w-8 h-8 rounded-md bg-accent border border-border flex items-center justify-center text-primary mb-3">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Unmatched Talent &amp; Mentors</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Trainers and subject matter experts are often assigned arbitrarily rather than through objective algorithmic affinity to specific competency needs.
              </p>
            </div>

            <div className="surface-card p-5">
              <div className="w-8 h-8 rounded-md bg-accent border border-border flex items-center justify-center text-primary mb-3">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Fraudulent Credentials</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Paper certificates and generic PDFs are easily forged. Employers and accreditors need cryptographic, publicly verifiable credentials that validate in seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Architecture & Engineering Pillars */}
        <section className="surface-card p-6 sm:p-8 mb-12">
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
              Engineering Architecture
            </span>
            <h2 className="text-xl font-semibold text-foreground">Built for High Availability &amp; Resilience</h2>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-accent text-primary mt-0.5">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-foreground">Modern Monorepo Stack:</strong> Powered by Turborepo, uniting a Next.js 14 App Router frontend with a modular NestJS micro-architected REST API and shared type packages.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-accent text-primary mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-foreground">Zero-Trust Security &amp; RBAC:</strong> Argon2id cryptographic hashing, stateless JWT with HttpOnly rotating refresh tokens, and granular server-side role validation on every API endpoint.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-accent text-primary mt-0.5">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-foreground">Relational Integrity with Prisma &amp; PostgreSQL:</strong> ACID-compliant multi-step operations wrapped inside atomic database transactions with an immutable audit log.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-accent text-primary mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-foreground">Measurable Pre/Post Test Efficacy:</strong> Automated server-graded assessments compare baseline scores against final evaluations to produce verifiable competency growth scores.
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Our Collective */}
        <section className="surface-card p-6 sm:p-8 mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
                The Collective
              </span>
              <h2 className="text-xl font-semibold text-foreground">A Unified Team of Six</h2>
            </div>
            <div className="px-3 py-1 rounded-md bg-accent border border-border text-xs font-semibold text-foreground">
              6 Core Contributors
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Team Prerak is comprised of six dedicated engineers, designers, and systems architects working collaboratively across full-stack API development, relational data integrity, security hardening, and responsive user experience. We operate as a unified, merit-first team where every architectural decision and interface refinement reflects our combined commitment to elevating organizational capacity.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="p-3.5 rounded-md bg-accent/40 border border-border">
              <span className="font-semibold text-foreground block mb-1">Full-Stack Backend</span>
              NestJS &bull; REST API &bull; DTOs
            </div>
            <div className="p-3.5 rounded-md bg-accent/40 border border-border">
              <span className="font-semibold text-foreground block mb-1">Modern Web UI</span>
              Next.js 14 &bull; Tailwind &bull; Framer
            </div>
            <div className="p-3.5 rounded-md bg-accent/40 border border-border">
              <span className="font-semibold text-foreground block mb-1">Database &amp; ORM</span>
              PostgreSQL &bull; Prisma Schema
            </div>
            <div className="p-3.5 rounded-md bg-accent/40 border border-border">
              <span className="font-semibold text-foreground block mb-1">Security &amp; RBAC</span>
              Argon2id &bull; Dual-JWT &bull; Audit
            </div>
            <div className="p-3.5 rounded-md bg-accent/40 border border-border">
              <span className="font-semibold text-foreground block mb-1">Competency Engine</span>
              Skill Matrices &bull; AI Diagnostics
            </div>
            <div className="p-3.5 rounded-md bg-accent/40 border border-border">
              <span className="font-semibold text-foreground block mb-1">Credential Systems</span>
              Cryptographic QR &bull; Public Tokens
            </div>
          </div>
        </section>

        {/* Section 5: CTA */}
        <section className="surface-card p-8 text-center bg-accent/30 border-border">
          <h2 className="text-xl font-semibold text-foreground mb-2">Ready to explore Capacity Connect?</h2>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto mb-6">
            Browse our course catalog, test our verification engine, or inspect our source code on GitHub.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/trainee/courses" className="btn-primary text-xs px-5 py-2.5">
              Explore Courses <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/security" className="btn-secondary text-xs px-5 py-2.5">
              Read Security Architecture
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
