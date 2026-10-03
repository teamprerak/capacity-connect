import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { I18nProvider } from "@/lib/i18n-provider";
import OnboardingGuard from "@/components/OnboardingGuard";
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
            <I18nProvider>
              <OnboardingGuard>
                {children}
              </OnboardingGuard>
              <Toaster position="top-right" theme="dark" />
            </I18nProvider>
          </AuthProvider>
        </ThemeProvider>
        
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `
        }}></script>
      </body>
    </html>
  );
}
