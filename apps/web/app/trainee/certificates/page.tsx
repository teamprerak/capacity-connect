'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Award, ExternalLink, Calendar, Download } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function CertificateVaultPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/certificates/me')
      .then((res) => setCertificates(res || []))
      .catch(() => setCertificates([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDownloadPDF = async (certId: string, certNumber: string) => {
    const element = document.getElementById(`certificate-${certId}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
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
      console.error('Error generating PDF', error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Verifiable Certificate Vault
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your officially issued capacity building accomplishments backed by cryptographic verification tokens.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12">
          <Spinner size="lg" label="Loading certificate vault..." />
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
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground leading-snug">{cert.course?.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Trainer: {cert.trainer?.user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start">
                      No: {cert.certificateNumber}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 ml-4">
                  <div className="bg-white p-2 rounded-md">
                    <QRCodeSVG value={cert.certificateNumber} size={90} />
                  </div>
                  <p className="text-[10px] text-muted-foreground max-w-[100px] leading-tight">
                    To verify authenticity, visit our platform and use the QR Scanner.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end text-xs" data-html2canvas-ignore="true">
                <div className="flex items-center gap-2">
                  <a
                    href={`/certificates/verify/${cert.verificationToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-md bg-card text-muted-foreground hover:text-foreground hover:bg-slate-700 transition-colors flex items-center gap-2 border border-border"
                    title="Public Verification Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Verify</span>
                  </a>
                  
                  <button
                    onClick={() => handleDownloadPDF(cert.id, cert.certificateNumber)}
                    className="px-3 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border shadow-sm rounded-md p-12 text-center text-muted-foreground">
          No certificates issued yet. Complete a course and pass its final assessment to earn your certificate!
        </div>
      )}
    </div>
  );
}
