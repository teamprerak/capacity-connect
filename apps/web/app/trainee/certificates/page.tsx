'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Award, ExternalLink, Calendar, Download } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useTranslation } from "react-i18next";

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

  const handleDownloadPDF = async (certId: string, certNumber: string) => {
    setDownloadingId(certId);
    const element = document.getElementById(`certificate-${certId}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificate-${certNumber}.pdf`);
    } catch (error) {
      alert("Failed to download certificate. Check console for details.");

      console.error('Error generating PDF', error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
           {t("verifiable_certificate_vault")} </h1>
        <p className="text-sm text-muted-foreground mt-1">
           {t("your_officially_issued_capacit")} </p>
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
              id={`certificate-${cert.id}`}
            >
              <div className="flex items-start justify-between flex-1">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground leading-snug">{cert.course?.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1"> {t("trainer_")} {cert.trainer?.user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span> {t("issued_")} {new Date(cert.issuedAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 self-start">
                       {t("no_")} {cert.certificateNumber}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 ml-4">
                  <div className="bg-white p-2 rounded-md">
                    <QRCodeSVG value={cert.verificationToken} size={90} />
                  </div>
                  <p className="text-[10px] text-muted-foreground max-w-[100px] leading-tight">
                     {t("to_verify_authenticity__visit_")} </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end text-xs" data-html2canvas-ignore="true">
                <div className="flex items-center gap-2">
                  <a
                    href={`/certificates/verify/${cert.verificationToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-md bg-card text-muted-foreground hover:text-foreground hover:bg-slate-700 transition-colors flex items-center gap-2 border border-border"
                    title={t("public_verification_link")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span> {t("verify")} </span>
                  </a>
                  
                  <button
                    onClick={() => handleDownloadPDF(cert.id, cert.certificateNumber)}
                    disabled={downloadingId === cert.id}
                      className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${downloadingId === cert.id ? "bg-emerald-500/50 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"} text-white`}
                  >
                    {downloadingId === cert.id ? <Spinner className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
                    <span>{downloadingId === cert.id ? "Generating..." : t("download_pdf")}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border shadow-sm rounded-md p-12 text-center text-muted-foreground">
           {t("no_certificates_issued_yet__co")} </div>
      )}
    </div>
  );
}

