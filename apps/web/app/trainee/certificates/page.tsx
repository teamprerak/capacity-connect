'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Award, ExternalLink, Calendar, Download, CheckCircle } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { useTranslation } from "react-i18next";

// ─────────────────────────────────────────────────────────────────────────────
// Programmatic PDF Certificate Generator
// Uses jsPDF draw commands — no DOM screenshot taken.
// ─────────────────────────────────────────────────────────────────────────────
async function generateCertificatePDF(cert: any) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();   // 297mm
  const H = pdf.internal.pageSize.getHeight();  // 210mm

  // ── BACKGROUND ──────────────────────────────────────────────────────────────
  // Deep navy base
  pdf.setFillColor(11, 18, 38);
  pdf.rect(0, 0, W, H, 'F');

  // Subtle gold gradient band at top
  pdf.setFillColor(180, 140, 50);
  pdf.rect(0, 0, W, 3, 'F');

  // Subtle gold gradient band at bottom
  pdf.setFillColor(180, 140, 50);
  pdf.rect(0, H - 3, W, 3, 'F');

  // ── OUTER DECORATIVE BORDER ──────────────────────────────────────────────────
  pdf.setDrawColor(180, 140, 50);
  pdf.setLineWidth(0.5);
  pdf.rect(8, 8, W - 16, H - 16);
  pdf.setLineWidth(0.2);
  pdf.rect(10, 10, W - 20, H - 20);

  // ── CORNER ORNAMENTS ─────────────────────────────────────────────────────────
  const drawCornerOrnament = (x: number, y: number) => {
    pdf.setDrawColor(180, 140, 50);
    pdf.setLineWidth(0.8);
    pdf.line(x, y, x + 8, y);
    pdf.line(x, y, x, y + 8);
    pdf.setLineWidth(0.3);
    pdf.line(x + 2, y + 2, x + 6, y + 2);
    pdf.line(x + 2, y + 2, x + 2, y + 6);
  };
  drawCornerOrnament(11, 11);
  drawCornerOrnament(W - 19, 11);
  // mirror for bottom-left
  pdf.setLineWidth(0.8);
  pdf.line(11, H - 11, 19, H - 11);
  pdf.line(11, H - 11, 11, H - 19);
  // mirror for bottom-right
  pdf.line(W - 11, H - 11, W - 19, H - 11);
  pdf.line(W - 11, H - 11, W - 11, H - 19);

  // ── WATERMARK (subtle diagonal text) ─────────────────────────────────────────
  pdf.saveGraphicsState();
  pdf.setTextColor(30, 45, 80);
  pdf.setFontSize(42);
  pdf.setFont('helvetica', 'bold');
  (pdf as any).setGState((pdf as any).GState({ opacity: 0.07 }));
  pdf.text('CAPACITY CONNECT', W / 2, H / 2, { align: 'center', angle: 35 });
  pdf.restoreGraphicsState();

  // ── LOGO AREA (left column) ───────────────────────────────────────────────────
  // Badge circle
  pdf.setFillColor(180, 140, 50);
  pdf.circle(52, 55, 14, 'F');
  pdf.setFillColor(11, 18, 38);
  pdf.circle(52, 55, 12, 'F');
  pdf.setDrawColor(180, 140, 50);
  pdf.setLineWidth(0.4);
  pdf.circle(52, 55, 12);
  // "CC" inside badge
  pdf.setTextColor(180, 140, 50);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CC', 52, 57.5, { align: 'center' });

  // ── ISSUER NAME ───────────────────────────────────────────────────────────────
  pdf.setTextColor(180, 140, 50);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CAPACITY CONNECT', 52, 73, { align: 'center' });
  pdf.setTextColor(160, 160, 190);
  pdf.setFontSize(5.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('ENTERPRISE LEARNING MANAGEMENT SYSTEM', 52, 77, { align: 'center' });

  // Divider line below issuer
  pdf.setDrawColor(180, 140, 50);
  pdf.setLineWidth(0.3);
  pdf.line(25, 80, 79, 80);

  // MoES affiliation
  pdf.setTextColor(140, 160, 200);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Ministry of Earth Sciences', 52, 84, { align: 'center' });
  pdf.text('Government of India', 52, 88, { align: 'center' });

  // ── VERTICAL DIVIDER ─────────────────────────────────────────────────────────
  pdf.setDrawColor(180, 140, 50);
  pdf.setLineWidth(0.4);
  pdf.line(89, 18, 89, H - 18);

  // ── MAIN CONTENT AREA (right side) ───────────────────────────────────────────
  const cx = 195; // center-x of right content

  // "CERTIFICATE OF ACHIEVEMENT"
  pdf.setTextColor(180, 140, 50);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('C E R T I F I C A T E   O F   A C H I E V E M E N T', cx, 24, { align: 'center' });

  // Thin gold rule under title
  pdf.setDrawColor(180, 140, 50);
  pdf.setLineWidth(0.2);
  pdf.line(cx - 60, 27, cx + 60, 27);

  // "This is to certify that"
  pdf.setTextColor(160, 160, 190);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text('This is to certify that', cx, 36, { align: 'center' });

  // Recipient email / name
  const recipientEmail = cert.trainee?.user?.email || 'Valued Participant';
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(recipientEmail, cx, 48, { align: 'center' });

  // Underline for name
  const nameWidth = pdf.getTextWidth(recipientEmail);
  pdf.setDrawColor(180, 140, 50);
  pdf.setLineWidth(0.3);
  pdf.line(cx - nameWidth / 2, 50, cx + nameWidth / 2, 50);

  // "has successfully completed"
  pdf.setTextColor(160, 160, 190);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text('has successfully completed the course', cx, 59, { align: 'center' });

  // Course title (bold, large, gold accent, word-wrap if needed)
  const courseTitle = cert.course?.title || 'Professional Development Course';
  pdf.setTextColor(180, 140, 50);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  const splitTitle = pdf.splitTextToSize(courseTitle, 170) as string[];
  const titleY = 70;
  pdf.text(splitTitle, cx, titleY, { align: 'center' });

  // Gold rule below course title
  const titleBlockH = splitTitle.length * 7;
  pdf.setDrawColor(180, 140, 50);
  pdf.setLineWidth(0.2);
  pdf.line(cx - 70, titleY + titleBlockH, cx + 70, titleY + titleBlockH);

  // ── METADATA ROW ─────────────────────────────────────────────────────────────
  const metaY = titleY + titleBlockH + 12;
  const col1x = 105, col2x = 195, col3x = 275;

  // Issued Date
  pdf.setTextColor(120, 130, 160);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DATE ISSUED', col1x, metaY, { align: 'center' });
  pdf.setTextColor(220, 220, 240);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), col1x, metaY + 5, { align: 'center' });

  // Vertical mini dividers
  pdf.setDrawColor(80, 90, 130);
  pdf.setLineWidth(0.2);
  pdf.line(152, metaY - 3, 152, metaY + 9);
  pdf.line(242, metaY - 3, 242, metaY + 9);

  // Trainer
  pdf.setTextColor(120, 130, 160);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INSTRUCTING TRAINER', col2x, metaY, { align: 'center' });
  pdf.setTextColor(220, 220, 240);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(cert.trainer?.user?.email || '—', col2x, metaY + 5, { align: 'center' });

  // Certificate No
  pdf.setTextColor(120, 130, 160);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICATE NO.', col3x, metaY, { align: 'center' });
  pdf.setTextColor(180, 140, 50);
  pdf.setFontSize(8);
  pdf.setFont('courier', 'bold');
  pdf.text(cert.certificateNumber, col3x, metaY + 5, { align: 'center' });

  // ── FOOTER ────────────────────────────────────────────────────────────────────
  const footerY = H - 22;

  // QR code note (no actual QR in PDF — we embed the verification URL as text)
  const verifyUrl = `${window.location.origin}/certificates/verify/${cert.verificationToken}`;
  pdf.setFillColor(20, 30, 60);
  pdf.roundedRect(93, footerY - 4, 160, 14, 2, 2, 'F');
  pdf.setDrawColor(80, 100, 160);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(93, footerY - 4, 160, 14, 2, 2, 'S');

  pdf.setTextColor(120, 130, 160);
  pdf.setFontSize(5.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('VERIFY THIS CERTIFICATE AT:', 173, footerY + 1, { align: 'center' });
  pdf.setTextColor(100, 160, 255);
  pdf.setFontSize(5.5);
  pdf.setFont('courier', 'normal');
  pdf.text(verifyUrl, 173, footerY + 6, { align: 'center' });

  // Cryptographic note
  pdf.setTextColor(70, 80, 120);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'italic');
  pdf.text('This certificate is cryptographically signed and verifiable online.', W / 2, H - 6, { align: 'center' });

  // ── LEFT COLUMN BOTTOM: Seal ──────────────────────────────────────────────────
  // Seal circle
  pdf.setFillColor(20, 30, 60);
  pdf.circle(52, 140, 16, 'F');
  pdf.setDrawColor(180, 140, 50);
  pdf.setLineWidth(0.6);
  pdf.circle(52, 140, 16);
  pdf.setLineWidth(0.2);
  pdf.circle(52, 140, 13);

  pdf.setTextColor(180, 140, 50);
  pdf.setFontSize(5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OFFICIALLY', 52, 136, { align: 'center' });
  pdf.text('ISSUED &', 52, 140, { align: 'center' });
  pdf.text('VERIFIED', 52, 144, { align: 'center' });

  // ── SAVE ──────────────────────────────────────────────────────────────────────
  pdf.save(`certificate-${cert.certificateNumber}.pdf`);
}

export default function CertificateVaultPage() {
  const { t } = useTranslation();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/certificates/me')
      .then((res) => setCertificates(res || []))
      .catch(() => setCertificates([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDownloadPDF = async (cert: any) => {
    setDownloadingId(cert.id);
    try {
      await generateCertificatePDF(cert);
    } catch (error) {
      console.error('Certificate generation failed:', error);
      alert('Failed to generate certificate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {t("verifiable_certificate_vault")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("your_officially_issued_capacit")}
        </p>
      </div>

      {isLoading ? (
        <div className="py-12">
          <Spinner size="lg" label={t("loading_certificate_vault___")} />
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-card border shadow-sm hover:shadow-md transition-all duration-200 rounded-md p-6 border-border space-y-6 flex flex-col"
            >
              <div className="flex items-start justify-between flex-1">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground leading-snug">{cert.course?.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{t("trainer_")} {cert.trainer?.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{t("issued_")} {new Date(cert.issuedAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 self-start">
                      {t("no_")} {cert.certificateNumber}
                    </span>
                  </div>

                  {/* Verified badge */}
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Cryptographically signed &amp; verifiable</span>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 ml-4">
                  <div className="bg-white p-2 rounded-md">
                    <QRCodeSVG
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/certificates/verify/${cert.verificationToken}`}
                      size={90}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground max-w-[100px] leading-tight">
                    {t("to_verify_authenticity__visit_")}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end text-xs">
                <div className="flex items-center gap-2">
                  <a
                    href={`/certificates/verify/${cert.verificationToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-md bg-card text-muted-foreground hover:text-foreground hover:bg-slate-700 transition-colors flex items-center gap-2 border border-border"
                    title={t("public_verification_link")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{t("verify")}</span>
                  </a>

                  <button
                    onClick={() => handleDownloadPDF(cert)}
                    disabled={downloadingId === cert.id}
                    className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 font-medium text-sm
                      ${downloadingId === cert.id
                        ? 'bg-emerald-400/60 cursor-not-allowed text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm hover:shadow-emerald-500/20 hover:shadow-md'
                      }`}
                  >
                    {downloadingId === cert.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating PDF…</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>{t("download_pdf")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border shadow-sm rounded-md p-12 text-center text-muted-foreground">
          {t("no_certificates_issued_yet__co")}
        </div>
      )}
    </div>
  );
}
