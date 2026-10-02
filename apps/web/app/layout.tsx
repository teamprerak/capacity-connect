import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import OnboardingGuard from "@/components/OnboardingGuard";
import AccessibilityBar from "@/components/AccessibilityBar";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capacity Connect | Industrial Enterprise LMS & Competency Engine",
  description: "Enterprise capacity building, AI-assisted competency matching, automated assessment & verifiable QR certification.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>
            <AccessibilityBar />
            <OnboardingGuard>
              {children}
            </OnboardingGuard>
            <Toaster position="top-right" theme="dark" />
          </AuthProvider>
        </ThemeProvider>

        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
      </body>
    </html>
  );
}
