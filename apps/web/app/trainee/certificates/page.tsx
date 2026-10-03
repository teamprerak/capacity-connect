'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Award, ExternalLink, Calendar, Download, CheckCircle } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';

// ─────────────────────────────────────────────────────────────────────────────
// Colour palette (matches the Capacity Connect certificate template)
// ─────────────────────────────────────────────────────────────────────────────
const NAVY        = [13, 27, 64]   as const;
const TEAL        = [0, 116, 182]  as const;
const TEAL_LIGHT  = [41, 182, 246] as const;
const GOLD        = [197, 160, 70] as const;
const WHITE       = [255, 255, 255] as const;
const GREY        = [90, 90, 100]  as const;
const LIGHT_GREY  = [180, 180, 190] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatDuration(minutes: number): string {
  if (!minutes) return '—';
  const hrs = Math.round(minutes / 60);
  return hrs > 0 ? `${hrs} Hrs` : `${minutes} Mins`;
}

function titleCaseEmail(email: string): string {
  return (email.split('@')[0] || 'Participant')
    .split(/[._\-]/)
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Core PDF generator — pure jsPDF draw commands, zero DOM screenshots
// ─────────────────────────────────────────────────────────────────────────────
async function generateCertificatePDF(cert: any, recipientName: string) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297;   // page width  in mm
  const H = 210;   // page height in mm
  const CX = 152;  // horizontal visual center (shifted right to balance swoosh)

  // ── BACKGROUND ─────────────────────────────────────────────────────────────
  pdf.setFillColor(...WHITE);
  pdf.rect(0, 0, W, H, 'F');

  // ── LEFT SWOOSH — three layered curves (navy → teal → light teal) ──────────
  // Each layer uses pdf.lines() with relative coordinates.
  // Layer 1: deep navy (outermost)
  pdf.setFillColor(...NAVY);
  pdf.lines(
    [
      [68, 0],
      [-14, 12, -30, 30, -38, 58],
      [-8, 28, -14, 58, -30, 95],
    ],
    0, 0, [1, 1], 'F', true,
  );
  // Layer 2: teal (middle)
  pdf.setFillColor(...TEAL);
  pdf.lines(
    [
      [42, 0],
      [-10, 10, -22, 26, -28, 54],
      [-6, 28, -10, 55, -14, 99],
    ],
    0, 0, [1, 1], 'F', true,
  );
  // Layer 3: light teal (innermost highlight)
  pdf.setFillColor(...TEAL_LIGHT);
  pdf.lines(
    [
      [20, 0],
      [-5, 8,  -12, 22, -14, 48],
      [-2, 26, -4,  50, -6,  95],
    ],
    0, 0, [1, 1], 'F', true,
  );

  // ── BOTTOM LEFT SWOOSH ─────────────────────────────────────────────────────
  pdf.setFillColor(...NAVY);
  pdf.lines(
    [
      [62, 0],
      [-16, -2, -28, -8, -40, -18],
      [-8, -8, -14, -28, -22, -55],
    ],
    0, H, [1, 1], 'F', true,
  );
  pdf.setFillColor(...TEAL);
  pdf.lines(
    [
      [40, 0],
      [-10, -2, -20, -6, -28, -14],
      [-5, -7, -10, -22, -12, -46],
    ],
    0, H, [1, 1], 'F', true,
  );
  pdf.setFillColor(...TEAL_LIGHT);
  pdf.lines(
    [
      [22, 0],
      [-5, -1, -10, -4, -14, -10],
      [-3, -5, -6, -16, -8, -34],
    ],
    0, H, [1, 1], 'F', true,
  );

  // ── RIGHT-SIDE WATERMARK CIRCLE (faint CC ghost) ──────────────────────────
  pdf.setFillColor(235, 238, 248);
  pdf.circle(W - 28, H / 2 + 6, 34, 'F');
  pdf.setFillColor(...WHITE);
  pdf.circle(W - 28, H / 2 + 6, 30, 'F');
  pdf.setTextColor(220, 224, 240);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(42);
  pdf.text('C', W - 28, H / 2 + 6 + 14, { align: 'center' });

  // ── GOLD OUTER BORDER ──────────────────────────────────────────────────────
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(1.4);
  pdf.rect(4, 4, W - 8, H - 8);
  pdf.setLineWidth(0.3);
  pdf.rect(6.5, 6.5, W - 13, H - 13);

  // ── TOP-LEFT LOGO BLOCK ────────────────────────────────────────────────────
  // Blue circle "badge" for logo
  pdf.setFillColor(...TEAL);
  pdf.circle(87, 14, 7, 'F');
  pdf.setTextColor(...WHITE);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('C', 87, 16.5, { align: 'center' });

  pdf.setTextColor(...NAVY);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Capacity', 97, 12);
  pdf.text('Connect', 97, 19);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.5);
  pdf.setTextColor(...GREY);
  pdf.text('Learn  ·  Grow  ·  Build Your Future', 83, 26);

  // ── TOP-RIGHT TAGLINE ──────────────────────────────────────────────────────
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(6.5);
  pdf.setTextColor(...NAVY);
  pdf.text(
    'Better Skills  |  Bigger Opportunities  |  A Stronger You',
    W - 9, 11, { align: 'right' },
  );

  // ── TITLE: CERTIFICATE OF COMPLETION ──────────────────────────────────────
  const titleY = 40;
  // Left gold rule
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.7);
  pdf.line(83, titleY - 2, 112, titleY - 2);
  // Right gold rule
  pdf.line(194, titleY - 2, 223, titleY - 2);
  // Gold diamond ends
  const drawDiamond = (x: number, y: number) => {
    pdf.setFillColor(...GOLD);
    pdf.lines([[3, 3], [-3, 3], [-3, -3]], x, y - 3, [1, 1], 'F', true);
  };
  drawDiamond(109, titleY - 2);
  drawDiamond(191, titleY - 2);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(27);
  pdf.setTextColor(...NAVY);
  pdf.text('CERTIFICATE', CX, titleY + 4, { align: 'center' });
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'normal');
  pdf.text('O F   C O M P L E T I O N', CX, titleY + 12, { align: 'center' });

  // ── PROUDLY PRESENTED TO ───────────────────────────────────────────────────
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...NAVY);
  pdf.text('P R O U D L Y   P R E S E N T E D   T O', CX, 63, { align: 'center' });

  // ── RECIPIENT NAME (large Times italic) ───────────────────────────────────
  pdf.setFont('times', 'bolditalic');
  pdf.setFontSize(30);
  pdf.setTextColor(...NAVY);
  const maxNameW = 155;
  let nameFontSize = 30;
  while (pdf.getTextWidth(recipientName) > maxNameW && nameFontSize > 14) {
    nameFontSize -= 1;
    pdf.setFontSize(nameFontSize);
  }
  pdf.text(recipientName, CX, 76, { align: 'center' });

  // Gold underline beneath name
  const nameW = Math.min(pdf.getTextWidth(recipientName), maxNameW);
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.6);
  pdf.line(CX - nameW / 2, 79, CX + nameW / 2, 79);

  // Gold diamond separator
  pdf.setFillColor(...GOLD);
  pdf.lines([[3.5, 3.5], [-3.5, 3.5], [-3.5, -3.5]], CX - 3.5, 81, [1, 1], 'F', true);

  // ── BODY TEXT ──────────────────────────────────────────────────────────────
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...GREY);
  pdf.text('This is to certify that you have successfully completed the', CX, 92, { align: 'center' });

  // Course name — bold, navy, word-wrapped
  const courseTitle = cert.course?.title || 'Professional Development Course';
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(...NAVY);
  const splitTitle = pdf.splitTextToSize(courseTitle, 165) as string[];
  pdf.text(splitTitle, CX, 99, { align: 'center' });
  const afterCourseY = 99 + (splitTitle.length - 1) * 7;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...GREY);
  pdf.text('on Capacity Connect.', CX, afterCourseY + 7, { align: 'center' });

  // Inspirational text
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7.5);
  pdf.text(
    'Your dedication, effort and commitment to learning have helped you',
    CX, afterCourseY + 15, { align: 'center' },
  );
  pdf.text('build valuable skills for a brighter future.', CX, afterCourseY + 21, { align: 'center' });

  // ── METADATA ROW ───────────────────────────────────────────────────────────
  const metaTopY = 138;
  const metaValueY = metaTopY + 6;
  const m1x = 97, m2x = 143, m3x = 189, m4x = 235;

  // Thin vertical dividers
  pdf.setDrawColor(...LIGHT_GREY);
  pdf.setLineWidth(0.25);
  [120, 166, 212].forEach(x => pdf.line(x, metaTopY - 6, x, metaValueY + 4));

  const metaItems = [
    { x: m1x, label: 'Completion Date',  value: new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { x: m2x, label: 'Course Category',  value: cert.course?.category?.name || 'Earth Science' },
    { x: m3x, label: 'Duration',         value: formatDuration(cert.course?.durationMinutes) },
    { x: m4x, label: 'Certificate ID',   value: cert.certificateNumber },
  ];

  metaItems.forEach(({ x, label, value }) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(...NAVY);
    pdf.text(label, x, metaTopY, { align: 'center' });

    pdf.setFont(label === 'Certificate ID' ? 'courier' : 'helvetica', 'normal');
    pdf.setFontSize(label === 'Certificate ID' ? 5.8 : 7.5);
    pdf.setTextColor(...GREY);
    const splitVal = pdf.splitTextToSize(value, 38) as string[];
    pdf.text(splitVal, x, metaValueY, { align: 'center' });
  });

  // ── DIVIDER ABOVE FOOTER ──────────────────────────────────────────────────
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.4);
  pdf.line(83, 150, W - 12, 150);

  // ── FOOTER: LEFT SIGNATURE ────────────────────────────────────────────────
  const sigLineY = 178;
  // Approximate handwriting-style short curved line for left sig
  pdf.setDrawColor(80, 90, 100);
  pdf.setLineWidth(0.5);
  pdf.lines([[10, -4], [8, 6], [12, -3]], 85, sigLineY - 6, [1, 1], 'S');
  pdf.line(85, sigLineY, 140, sigLineY);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(...NAVY);
  pdf.text('Director', 112, sigLineY + 5, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(...GREY);
  pdf.text('Capacity Connect', 112, sigLineY + 10, { align: 'center' });

  // ── FOOTER: CENTER OFFICIAL SEAL ─────────────────────────────────────────
  const sX = CX;     // centre-x
  const sY = 173;    // centre-y
  const sR = 15;     // outer radius

  // Gold outer ring
  pdf.setFillColor(...GOLD);
  pdf.circle(sX, sY, sR, 'F');

  // Navy inner fill
  pdf.setFillColor(...NAVY);
  pdf.circle(sX, sY, sR - 2.5, 'F');

  // Gold inner ring
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.4);
  pdf.circle(sX, sY, sR - 5);

  // CC label inside seal
  pdf.setTextColor(...WHITE);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('CC', sX, sY + 1.5, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(4.2);
  pdf.text('Capacity Connect', sX, sY + 7.5, { align: 'center' });

  // Gold stars row
  pdf.setTextColor(...GOLD);
  pdf.setFontSize(5);
  pdf.text('★ ★ ★', sX, sY + 12, { align: 'center' });

  // Ribbon beneath seal
  pdf.setFillColor(...NAVY);
  pdf.rect(sX - 5, sY + sR - 0.5, 10, 7, 'F');
  // Left ribbon flap
  pdf.setFillColor(...NAVY);
  pdf.lines([[5, 0], [2.5, 7]], sX - 7.5, sY + sR - 0.5, [1, 1], 'F', true);
  // Right ribbon flap
  pdf.lines([[-5, 0], [-2.5, 7]], sX + 7.5, sY + sR - 0.5, [1, 1], 'F', true);
  // Gold centre knot dot
  pdf.setFillColor(...GOLD);
  pdf.circle(sX, sY + sR + 3.5, 1.5, 'F');

  // ── FOOTER: RIGHT SIGNATURE ───────────────────────────────────────────────
  // Approximate handwriting-style line for right sig
  pdf.setDrawColor(80, 90, 100);
  pdf.setLineWidth(0.5);
  pdf.lines([[8, -5], [10, 4], [9, -2]], 174, sigLineY - 6, [1, 1], 'S');
  pdf.line(174, sigLineY, 263, sigLineY);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(...NAVY);
  pdf.text('Head of Learning & Development', 218, sigLineY + 5, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(...GREY);
  pdf.text('Capacity Connect', 218, sigLineY + 10, { align: 'center' });

  // ── FAR-RIGHT TAGLINE ─────────────────────────────────────────────────────
  pdf.setFont('helvetica', 'bolditalic');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...NAVY);
  pdf.text('Skills today.', W - 10, 172, { align: 'right' });
  pdf.text('Opportunities tomorrow.', W - 10, 180, { align: 'right' });

  // ── VERIFICATION URL FOOTER ────────────────────────────────────────────────
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://capacity-connect-web.vercel.app';
  const verifyUrl = `${origin}/certificates/verify/${cert.verificationToken}`;
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(4.5);
  pdf.setTextColor(140, 140, 160);
  pdf.text(`Verify at: ${verifyUrl}`, W / 2, H - 5, { align: 'center' });

  pdf.save(`CC-Certificate-${cert.certificateNumber}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Certificate Vault Page Component
// ─────────────────────────────────────────────────────────────────────────────
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
      // Fetch the trainee profile to get their display name (headline field)
      let recipientName = '';
      try {
        const profile = await api.get('/trainee/profile');
        if (profile?.headline?.trim()) {
          recipientName = profile.headline.trim();
        }
      } catch {
        // profile fetch failed — fall back to email
      }

      // Fallback: title-case the email prefix (e.g. "demo.trainee" → "Demo Trainee")
      if (!recipientName) {
        const email = cert.trainee?.user?.email || '';
        recipientName = titleCaseEmail(email) || 'Valued Participant';
      }

      await generateCertificatePDF(cert, recipientName);
    } catch (err) {
      console.error('Certificate PDF generation failed:', err);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {t('verifiable_certificate_vault')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('your_officially_issued_capacit')}
        </p>
      </div>

      {isLoading ? (
        <div className="py-12">
          <Spinner size="lg" label={t('loading_certificate_vault___')} />
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-card border shadow-sm hover:shadow-md transition-all duration-200 rounded-md p-6 border-border space-y-5 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4 flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2">
                        {cert.course?.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {t('trainer_')} {cert.trainer?.user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('issued_')} {new Date(cert.issuedAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {cert.certificateNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Cryptographically signed &amp; verifiable</span>
                  </div>
                </div>

                {/* QR code */}
                <div className="flex flex-col items-center text-center gap-1.5 shrink-0">
                  <div className="bg-white p-1.5 rounded-md shadow-sm">
                    <QRCodeSVG
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/certificates/verify/${cert.verificationToken}`}
                      size={80}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground max-w-[90px] leading-tight">
                    {t('to_verify_authenticity__visit_')}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <a
                  href={`/certificates/verify/${cert.verificationToken}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium
                    border border-border text-muted-foreground
                    hover:text-foreground hover:bg-accent
                    transition-colors duration-150"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t('verify')}
                </a>

                <button
                  onClick={() => handleDownloadPDF(cert)}
                  disabled={downloadingId === cert.id}
                  className={[
                    'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    downloadingId === cert.id
                      ? 'bg-emerald-500/50 dark:bg-emerald-600/40 cursor-not-allowed text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-sm hover:shadow-emerald-500/25 hover:shadow-md active:scale-95',
                  ].join(' ')}
                >
                  {downloadingId === cert.id ? (
                    <>
                      {/* Inline border-current spinner — works on both light & dark themes */}
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Generating PDF…</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{t('download_pdf')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border shadow-sm rounded-md p-12 text-center text-muted-foreground">
          {t('no_certificates_issued_yet__co')}
        </div>
      )}
    </div>
  );
}
