import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
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
              
              // Actively hide the translate bar
              var hideTranslateBar = function() {
                var elements = document.querySelectorAll('.goog-te-banner-frame, iframe.goog-te-banner-frame, .skiptranslate > iframe');
                for (var i = 0; i < elements.length; i++) {
                  elements[i].style.display = 'none';
                  elements[i].style.setProperty('display', 'none', 'important');
                }
                document.body.style.top = '0px';
                document.body.style.setProperty('top', '0px', 'important');
              };
              
              var observer = new MutationObserver(hideTranslateBar);
              observer.observe(document.body, { childList: true, subtree: true });
              setTimeout(hideTranslateBar, 100);
              setTimeout(hideTranslateBar, 500);
              setTimeout(hideTranslateBar, 1500);
            }
          `}
        </Script>
      </body>
    </html>
  );
}
