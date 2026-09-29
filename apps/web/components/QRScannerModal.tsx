'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  Award,
  Camera,
  Keyboard,
  UploadCloud,
  FileImage,
  Loader2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scanMode, setScanMode] = useState<'manual' | 'camera' | 'upload'>('manual');

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // File upload state
  const [isScanningFile, setIsScanningFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const performVerification = async (verifyToken: string) => {
    if (!verifyToken.trim()) return;

    // Extract token if user pasted the full verification URL
    let finalToken = verifyToken.trim().split('?')[0].replace(/\/+$/, '');
    if (finalToken.includes('/')) {
      finalToken = finalToken.split('/').pop() || finalToken;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      const data = await api.get(`/certificates/verify/${finalToken}`);
      setResult(data);
      if (data.valid) {
        toast.success('Certificate is valid and officially verified!');
      } else {
        toast.error(data.message || 'Invalid or revoked certificate');
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

  // Stop camera helper
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping QR scanner:', err);
      }
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
  };

  // Start live camera
  const startCamera = async () => {
    setCameraError(null);
    setIsStartingCamera(true);

    try {
      // Ensure any existing instance is cleaned up
      await stopCamera();

      // Check for reader element
      const readerElement = document.getElementById('reader');
      if (!readerElement) {
        throw new Error('Scanner container not found in DOM.');
      }

      const scanner = new Html5Qrcode('reader');
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          // Success!
          await stopCamera();
          setToken(decodedText);
          toast.success('QR Code detected!');
          performVerification(decodedText);
        },
        (errorMessage) => {
          // Frame parse error - normal while scanning
        }
      );

      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Failed to start camera:', err);
      setCameraError(
        err?.message ||
          'Camera access was denied or no camera device was found. You can upload an image file instead.'
      );
      setIsCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  };

  // Process uploaded image file
  const processImageFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    setIsScanningFile(true);

    try {
      // Stop camera if running
      if (isCameraActive) {
        await stopCamera();
      }

      let scanner = html5QrCodeRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode('reader');
        html5QrCodeRef.current = scanner;
      }

      const decodedText = await scanner.scanFile(file, false);
      setToken(decodedText);
      toast.success('QR Code detected from image!');
      performVerification(decodedText);
    } catch (err: any) {
      toast.error('No QR code could be detected in this image. Please try a clearer photo or enter the token manually.');
    } finally {
      setIsScanningFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // File dropzone handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  // Cleanup on mode change or unmount
  useEffect(() => {
    if (scanMode !== 'camera' && isCameraActive) {
      stopCamera();
    }
  }, [scanMode]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle modal close
  const handleClose = async () => {
    await stopCamera();
    setScanMode('manual');
    setToken('');
    setResult(null);
    setCameraError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Verify Digital Certificate">
      {/* Tab Switcher */}
      <div className="flex bg-muted/60 p-1 rounded-lg mb-5 border border-border">
        <button
          type="button"
          onClick={() => setScanMode('manual')}
          className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            scanMode === 'manual'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Manual Token</span>
        </button>

        <button
          type="button"
          onClick={() => setScanMode('camera')}
          className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            scanMode === 'camera'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Live Camera</span>
        </button>

        <button
          type="button"
          onClick={() => setScanMode('upload')}
          className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            scanMode === 'upload'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Mode 1: Manual Input */}
      {scanMode === 'manual' && (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Certificate Token or Verification URL
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. 8a3f89a2-4c21-4db8-9218-e21f92e3a19b or verify URL"
                style={{ paddingLeft: '2.5rem' }}
                className="form-input !pl-10 pr-4 font-mono text-xs sm:text-sm"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Enter the unique verification token UUID, certificate number (CC-...), or paste the verification URL.
            </p>
          </div>

          <button
            type="submit"
            disabled={isVerifying || !token.trim()}
            className="w-full btn-primary py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Authenticity...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Verify Authenticity</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Mode 2: Live Camera Scan */}
      {scanMode === 'camera' && (
        <div className="space-y-4">
          {cameraError && (
            <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-100 text-rose-500 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Camera Access Error</p>
                <p className="text-muted-foreground mt-0.5">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => setScanMode('upload')}
                  className="mt-2 text-xs font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Switch to Image Upload
                </button>
              </div>
            </div>
          )}

          {/* Camera Viewfinder */}
          <div
            className={`relative rounded-xl overflow-hidden border border-border bg-black transition-all ${
              isCameraActive ? 'min-h-[280px]' : 'hidden'
            }`}
          >
            <div id="reader" className="w-full"></div>

            {/* Viewfinder overlay */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4">
                <div className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Camera Active • Align QR inside frame
                </div>

                <div className="w-48 h-48 border-2 border-primary/80 rounded-xl relative shadow-lg">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl-sm"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr-sm"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl-sm"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white rounded-br-sm"></div>
                </div>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="pointer-events-auto bg-black/70 hover:bg-black text-white text-xs font-medium px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" /> Stop Camera
                </button>
              </div>
            )}
          </div>

          {/* Idle Camera State */}
          {!isCameraActive && (
            <div className="border border-border rounded-xl p-8 text-center bg-card/50 flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
                <Camera className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Scan with Device Camera</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Point your webcam or mobile camera at the certificate QR code to scan and verify in real time.
                </p>
              </div>

              <div className="pt-2 w-full max-w-xs space-y-2">
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isStartingCamera}
                  className="w-full btn-primary py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isStartingCamera ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Requesting Camera...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Start Camera Scanner</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setScanMode('upload')}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Or upload a QR image file
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Upload Image File */}
      {scanMode === 'upload' && (
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processImageFile(file);
            }}
            accept="image/*"
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
              isDragging
                ? 'border-primary bg-primary/10 scale-[0.99]'
                : 'border-border hover:border-primary/60 bg-card/40 hover:bg-muted/40'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
              {isScanningFile ? (
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              ) : (
                <FileImage className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">
                {isScanningFile ? 'Analyzing QR Code...' : 'Choose or Drop QR Image'}
              </h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                {isScanningFile
                  ? 'Extracting cryptographic certificate token from image...'
                  : 'Drop your certificate screenshot or QR photo here, or click to browse'}
              </p>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground shadow-xs pointer-events-none">
                <UploadCloud className="w-3.5 h-3.5" />
                Browse Image File
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground">Supports PNG, JPG, JPEG, or WebP</p>
          </div>
        </div>
      )}

      {/* Hidden container for reader instance if not mounted */}
      {scanMode !== 'camera' && <div id="reader" className="hidden"></div>}

      {/* Verification Result Display */}
      {result && (
        <div className="mt-5 p-4 rounded-xl bg-card border border-border shadow-xs animate-in fade-in duration-200">
          {result.valid ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>OFFICIALLY VERIFIED CERTIFICATE</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1.5 pt-2.5 border-t border-border">
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground font-medium">Certificate No:</span>
                  <span className="font-mono text-foreground font-semibold">{result.certificateNumber}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground font-medium">Trainee Email:</span>
                  <span className="text-foreground">{result.trainee?.email}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground font-medium">Course Title:</span>
                  <span className="text-foreground font-medium">{result.course?.title}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground font-medium">Trainer:</span>
                  <span className="text-foreground">{result.trainer?.email}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground font-medium">Issued On:</span>
                  <span className="text-foreground">{new Date(result.issuedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 text-rose-500 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Certificate Verification Failed</p>
                <p className="text-muted-foreground mt-0.5">
                  {result.message || 'No matching active certificate was found for this token.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
