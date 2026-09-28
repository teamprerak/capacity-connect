'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FileText, CheckCircle2, AlertTriangle, ArrowLeft, ShieldAlert, Award } from 'lucide-react';

export default function TermsOfServicePage() {
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
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>Enterprise Agreement &amp; Acceptable Use</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Effective Date: September 28, 2026 &bull; Version 2.1 &bull; Governed by Team Prerak for Capacity Connect Platform.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
          {/* Section 1 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">1</span>
              Acceptance of Terms
            </h2>
            <p className="mb-3">
              By accessing, browsing, or creating an account within <strong>Capacity Connect</strong>, you agree to be legally bound by these Terms of Service (&quot;Terms&quot;) and our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
            <p>
              These Terms apply to all users across all roles: Trainees enrolled in learning modules, Trainers creating instructional content, and Administrators managing organizational units and auditing logs.
            </p>
          </section>

          {/* Section 2 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">2</span>
              User Roles &amp; Account Responsibilities
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">A. Credential Safeguarding</h3>
                <p>
                  You are solely responsible for maintaining the confidentiality of your authentication credentials. Sharing accounts between employees or external parties is strictly prohibited. You agree to immediately notify platform administrators of any unauthorized session or security incident.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">B. Role Integrity</h3>
                <p>
                  Users must operate exclusively within their assigned role boundaries (Trainee, Trainer, Admin). Any attempt to bypass NestJS server-side role validation, forge JWT claims, or perform unauthorized administrative actions will trigger automated account suspension and audit escalation.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">3</span>
              Academic &amp; Assessment Integrity
            </h2>
            <p className="mb-3">
              Capacity Connect calculates real workforce capability metrics based on evaluation results. Therefore, academic integrity is paramount:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Independent Evaluation:</strong> All pre-assessments and post-course efficacy exams must be completed solely by the registered trainee without automated bots, unauthorized aids, or proxy test-takers.
              </li>
              <li>
                <strong>No Key Exfiltration:</strong> Trainees and third parties may not scrape, copy, or distribute proprietary assessment questions or correct answer keys.
              </li>
              <li>
                <strong>Passage Standards:</strong> Certificates are earned strictly upon satisfying course module completion requirements and obtaining the designated passing score threshold.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">4</span>
              Trainer Content &amp; Intellectual Property
            </h2>
            <p className="mb-3">
              Trainers retain ownership of educational material, slide decks, syllabi, and video links created on the platform, subject to the license granted to the deploying enterprise organization.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>Trainers warrant that published course content does not infringe copyright, trademark, or confidentiality agreements.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>The platform reserves the right to unpublish or reject any course module flagged for harmful, misleading, or abusive content.</span>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">5</span>
              Certificate Verification &amp; Credential Validity
            </h2>
            <p className="mb-3">
              Certificates generated through Capacity Connect are digitally sealed with cryptographic tokens.
            </p>
            <p className="mb-3">
              The public verification portal (<code>/certificates/verify/:token</code>) serves as the authoritative source of credential validity. If an organization determines that a certificate was attained through fraudulent activity, administrators reserve the authority to revoke the credential token, immediately reflecting its invalid state in the public verification engine.
            </p>
          </section>

          {/* Section 6 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">6</span>
              Auditability &amp; Immutable Logging
            </h2>
            <p className="mb-3">
              To guarantee enterprise compliance and transparent governance, all mutating transactions within Capacity Connect are recorded in an immutable audit ledger.
            </p>
            <p>
              Users acknowledge and agree that actions including authentication attempts, course enrollments, grading events, and certificate issuance will be logged with timestamps, IP addresses, and user identifiers for security and audit purposes.
            </p>
          </section>

          {/* Section 7 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">7</span>
              Disclaimer of Warranties &amp; Limitation of Liability
            </h2>
            <p className="mb-3">
              Capacity Connect is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis under the MIT License and applicable enterprise SLAs. While Team Prerak takes meticulous precautions to guarantee uptime, data integrity, and vulnerability mitigation, we make no express warranties regarding uninterrupted operation under external network failures.
            </p>
            <p>
              Under no circumstances shall Team Prerak or platform contributors be liable for indirect, incidental, or consequential damages resulting from lost assessment data, downtime, or credential disputes.
            </p>
          </section>

          {/* Section 8 */}
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-accent text-primary flex items-center justify-center text-xs font-bold">8</span>
              Governing Law &amp; Inquiries
            </h2>
            <p className="mb-3">
              These Terms shall be construed in accordance with the enterprise institutional charter and relevant digital governance laws. For any legal inquiries or policy clarifications, please reach out to the engineering team:
            </p>
            <div className="mt-3 p-4 rounded-md bg-accent/40 border border-border text-foreground font-mono text-xs">
              <p>Team Prerak Legal &amp; Governance</p>
              <p>Email: team.prerak075@gmail.com</p>
              <p>Project URL: github.com/teamprerak/capacity-connect</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
