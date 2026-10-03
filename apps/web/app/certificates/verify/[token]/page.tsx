'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { ShieldCheck, AlertTriangle, Calendar, User, BookOpen, Award, CheckCircle } from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function CertificateVerifyPage() {
    const { t } = useTranslation();
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api
        .get(`/certificates/verify/${token}`)
        .then((res) => setData(res))
        .catch(() => setData({ valid: false, message: 'Invalid verification link' }))
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  return (
    /* Page bg uses theme background — no hardcoded dark */
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-16 flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="surface-card p-12 flex flex-col items-center justify-center text-center gap-4 w-full">
            <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground"> {t("verifying_certificate_authenti")} </span>
          </div>

        ) : data && data.valid ? (
          /* ─── Valid certificate card ─── */
          <div className="surface-card w-full text-center overflow-hidden">
            {/* Green top accent strip */}
            <div className="h-1 w-full bg-success rounded-t-lg" />

            <div className="p-8 sm:p-10">
              {/* Shield icon */}
              <div className="w-14 h-14 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-5">
                <ShieldCheck className="w-7 h-7 text-success" />
              </div>

              {/* Official badge */}
              <span className="badge-success text-[11px] uppercase tracking-widest font-semibold mb-4 inline-flex">
                 {t("official_verifiable_digital_ce")} </span>

              <h1 className="text-2xl font-semibold text-foreground mt-3 mb-1 tracking-tight">
                 {t("certificate_of_capacity_accomp")} </h1>
              <p className="text-xs font-mono text-muted-foreground mb-8">
                 {t("serial_no_")} {' '}
                <span className="text-primary font-semibold">{data.certificateNumber}</span>
              </p>

              {/* Detail grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left p-5 rounded-lg bg-background border border-border">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="text-muted-foreground text-[10px] font-semibold block uppercase tracking-wide mb-0.5">
                       {t("recipient_trainee")} </span>
                    <span className="text-sm font-semibold text-foreground">{data.trainee?.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="text-muted-foreground text-[10px] font-semibold block uppercase tracking-wide mb-0.5">
                       {t("certified_skill_course")} </span>
                    <span className="text-sm font-semibold text-foreground">{data.course?.title}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:border-t border-border sm:pt-4">
                  <Award className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="text-muted-foreground text-[10px] font-semibold block uppercase tracking-wide mb-0.5">
                       {t("instructing_trainer")} </span>
                    <span className="text-sm font-semibold text-foreground">{data.trainer?.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:border-t border-border sm:pt-4">
                  <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="text-muted-foreground text-[10px] font-semibold block uppercase tracking-wide mb-0.5">
                       {t("official_issue_date")} </span>
                    <span className="text-sm font-semibold text-foreground">
                      {new Date(data.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification footer */}
              <div className="mt-7 flex items-center justify-center gap-2 text-xs font-medium text-success">
                <CheckCircle className="w-4 h-4" />
                 {t("cryptographically_verified_on_")} </div>
            </div>
          </div>

        ) : (
          /* ─── Invalid certificate ─── */
          <div className="surface-card w-full text-center overflow-hidden">
            <div className="h-1 w-full bg-error rounded-t-lg" />
            <div className="p-10">
              <div className="w-14 h-14 rounded-full bg-error/10 border border-error/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-error" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2"> {t("verification_failed")} </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {data?.message || 'The certificate verification token is invalid or does not exist.'}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
