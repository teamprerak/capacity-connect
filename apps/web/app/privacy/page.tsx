'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, Lock, Eye, Database, Server, FileCheck, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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

        {/* Header */}
        <div className="border-b border-border pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-accent border border-border text-muted-foreground text-xs font-medium mb-3">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Compliance &amp; Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Effective Date: September 28, 2026 &bull; Version 2.4 &bull; Maintained by Team Prerak for Capacity Connect Platform.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
          {/* Section 1 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">1</span>
              Platform Overview &amp; Enterprise Scope
            </h2>
            <p className="mb-3">
              Capacity Connect (&quot;the Platform&quot;), engineered and maintained by <strong>Team Prerak</strong>, is an enterprise learning management and workforce competency orchestration engine. This Privacy Policy details how we collect, store, isolate, and process information when trainees, trainers, and administrators utilize our web portals and API services.
            </p>
            <p>
              We operate under strict data minimization principles: we only collect data essential for establishing organizational competencies, orchestrating course modules, assessing proficiency, and issuing verifiable certifications.
            </p>
          </section>

          {/* Section 2 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">2</span>
              Information We Collect &amp; Process
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">A. Identity &amp; Authentication Credentials</h3>
                <p>
                  Full name, corporate email address, organizational role (Trainee, Trainer, Admin), and departmental assignment. Passwords are never stored in plaintext; they are hashed using the state-of-the-art <strong>Argon2id</strong> algorithm with cryptographic salt.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">B. Learning &amp; Assessment Telemetry</h3>
                <p>
                  Course enrollment records, completed lesson modules, quiz submissions (including pre-assessment baseline tests and post-assessment efficacy exams), scores, and time-to-completion metrics.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">C. Competency Matrices &amp; Skill Gap Telemetry</h3>
                <p>
                  Target proficiency levels required by organizational departments compared against actual demonstrated competency levels calculated from assessment submissions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">D. Audit Logging &amp; System Observability</h3>
                <p>
                  For security auditing and fraud deterrence, mutating transactions (such as grade submissions, password changes, and certificate generation) generate an immutable audit log storing the timestamp, user ID, event type, and IP address.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">3</span>
              Role-Based Data Isolation &amp; Visibility Matrix
            </h2>
            <p className="mb-4">
              Access to data within Capacity Connect is strictly constrained by our Role-Based Access Control (RBAC) architecture:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-border">
                <thead className="bg-accent/50 text-foreground font-semibold">
                  <tr>
                    <th className="p-3 border border-border">Data Domain</th>
                    <th className="p-3 border border-border">Trainee Access</th>
                    <th className="p-3 border border-border">Trainer Access</th>
                    <th className="p-3 border border-border">Admin Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 font-medium text-foreground border border-border">Own Assessment Scores &amp; Certs</td>
                    <td className="p-3 text-success border border-border">Full View &amp; Download</td>
                    <td className="p-3 text-muted-foreground border border-border">Aggregated / Course-specific</td>
                    <td className="p-3 border border-border">Full Audit View</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground border border-border">Course Authoring &amp; Drafts</td>
                    <td className="p-3 text-error border border-border">No Access</td>
                    <td className="p-3 text-success border border-border">Own Created Courses Only</td>
                    <td className="p-3 border border-border">Approved &amp; Published Courses</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground border border-border">System Audit Logs &amp; Credentials</td>
                    <td className="p-3 text-error border border-border">No Access</td>
                    <td className="p-3 text-error border border-border">No Access</td>
                    <td className="p-3 text-success border border-border">Exclusive Admin Access</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">4</span>
              Public Verification &amp; Cryptographic Tokens
            </h2>
            <p className="mb-3">
              When a trainee completes an authorized course curriculum and meets the mastery threshold, a digital certificate is issued with a unique public verification token.
            </p>
            <p>
              When a third party or employer inspects the certificate via its QR code or verification link (<code>/certificates/verify/:token</code>), our server renders <strong>only non-sensitive credential data</strong>: the recipient&apos;s display name, course title, issuing trainer, issue date, and cryptographic validation badge. No personal email addresses, assessment answer keys, or internal database IDs are ever exposed publicly.
            </p>
          </section>

          {/* Section 5 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">5</span>
              AI Assistance &amp; Privacy Protections
            </h2>
            <p className="mb-3">
              Capacity Connect integrates AI services solely to assist with automated question generation, feedback explanations, and learning path diagnostics.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span><strong>Zero Model Retraining:</strong> User personal identifiable information (PII) is never supplied to public AI foundational training sets.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span><strong>No AI Mutation Authority:</strong> AI services operate strictly in read/evaluate mode. AI algorithms cannot alter passwords, modify database roles, or override administrative decisions.</span>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">6</span>
              Cookies &amp; Stateless Tokens
            </h2>
            <p className="mb-3">
              We do not employ third-party advertising cookies or cross-site tracking scripts. Our session management uses secure, stateless JSON Web Tokens (JWT) structured as:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Access Token:</strong> Short-lived token transmitted for API authorization.</li>
              <li><strong>Refresh Token:</strong> Transmitted exclusively via <code>HttpOnly</code>, <code>SameSite=Strict</code>, and <code>Secure</code> encrypted cookies to prevent XSS and CSRF token interception.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">7</span>
              Your Rights &amp; Contact Information
            </h2>
            <p className="mb-3">
              Depending on your jurisdiction and your enterprise agreement, you have the right to inspect, export, or request rectification of your profile and learning records.
            </p>
            <p>
              For privacy inquiries, audit review requests, or data export requests, please contact our engineering governance board:
            </p>
            <div className="mt-3 p-4 rounded-md bg-accent/40 border border-border text-foreground font-mono text-xs">
              <p>Team Prerak Security &amp; Data Protection</p>
              <p>Email: team.prerak075@gmail.com</p>
              <p>Repository: github.com/teamprerak/capacity-connect</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
