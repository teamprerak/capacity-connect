'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { ShieldCheck, AlertTriangle, Search, Award, Camera, Keyboard } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scanMode, setScanMode] = useState<'manual' | 'camera'>('manual');

  const performVerification = async (verifyToken: string) => {
    if (!verifyToken.trim()) return;
    
    // Extract token if user pasted the full verification URL
    let finalToken = verifyToken.trim();
    if (finalToken.includes('/')) {
      finalToken = finalToken.split('/').pop() || finalToken;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      const data = await api.get(`/certificates/verify/${finalToken}`);
      setResult(data);
      if (data.valid) {
        toast.success('Certificate is valid and verified!');
      } else {
        toast.error(data.message || 'Invalid certificate');
      }
    } catch (err: any) {
      toast.error('Failed to verify certificate token');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(token);
  };

  useEffect(() => {
    let html5QrcodeScanner: Html5QrcodeScanner | null = null;

    if (scanMode === 'camera' && isOpen) {
      // Small delay to ensure the DOM element is mounted
      const timer = setTimeout(() => {
        html5QrcodeScanner = new Html5QrcodeScanner(
          'reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        html5QrcodeScanner.render(
          (decodedText) => {
            if (html5QrcodeScanner) {
              html5QrcodeScanner.clear().catch(console.error);
            }
            setToken(decodedText);
            setScanMode('manual');
            performVerification(decodedText);
          },
          (error) => {
            // Ignore ongoing scan failures
          }
        );
      }, 100);

      return () => {
        clearTimeout(timer);
        if (html5QrcodeScanner) {
          html5QrcodeScanner.clear().catch(console.error);
        }
      };
    }
  }, [scanMode, isOpen]);

  // Handle modal close cleanup
  const handleClose = () => {
    setScanMode('manual');
    setToken('');
    setResult(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Verify Digital Certificate Token">
      <div className="flex bg-slate-900/50 p-1 rounded-lg mb-6 border border-border">
        <button
          type="button"
          onClick={() => setScanMode('manual')}
          className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${
            scanMode === 'manual' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          Enter Manually
        </button>
        <button
          type="button"
          onClick={() => setScanMode('camera')}
          className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${
            scanMode === 'camera' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          Scan with Camera
        </button>
      </div>

      {scanMode === 'camera' ? (
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border border-border bg-black">
            <div id="reader" className="w-full"></div>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Point your camera at a certificate QR code to automatically scan and verify.
          </p>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Certificate Token / Verification URL
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. http://localhost:3000/verify/ab12cd34..."
                className="w-full pl-10 pr-4 py-2.5 rounded-md bg-background border border-border text-foreground placeholder-slate-500 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-2.5 rounded-md font-bold bg-emerald-600 text-foreground shadow-sm shadow-emerald-500/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            {isVerifying ? 'Verifying Token...' : 'Verify Authenticity'}
          </button>
        </form>
      )}

      {result && (
        <div className="mt-5 p-4 rounded-lg bg-background border border-border animate-in fade-in duration-200">
          {result.valid ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>OFFICIALLY VERIFIED CERTIFICATE</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                <p><span className="text-muted-foreground">Certificate No:</span> {result.certificateNumber}</p>
                <p><span className="text-muted-foreground">Trainee Email:</span> {result.trainee?.email}</p>
                <p><span className="text-muted-foreground">Course Title:</span> {result.course?.title}</p>
                <p><span className="text-muted-foreground">Trainer:</span> {result.trainer?.email}</p>
                <p><span className="text-muted-foreground">Issued On:</span> {new Date(result.issuedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>{result.message || 'Certificate verification failed.'}</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
