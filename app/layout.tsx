import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { HighlightInit } from "@highlight-run/next/client";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/components/providers/AuthProvider";
import UpgradeNotification from "@/components/UpgradeNotification";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouterLoggerWrapper from "@/components/RouterLoggerWrapper";
import Footer from "@/components/Footer";
import "./globals.css";


export const metadata: Metadata = {
  title: "Livinning - Encuentra tu Hogar Ideal",
  description: "Descubre propiedades excepcionales en las ubicaciones más codiciadas del mundo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <HighlightInit
        projectId="jd40540g"
        serviceName="livinning-app"
        tracingOrigins={[
          'localhost',
          'livinning.vercel.app',
          process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000'
        ]}
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
          urlBlocklist: [
            // Block sensitive endpoints
            "/api/webhook",
            "/api/payments",
            "/api/stripe",
            "/api/clerk",
            // Block external sensitive services
            "https://api.stripe.com",
            "https://api.clerk.dev",
            "https://clerk.livinning.com"
          ],
          headerKeysToRecord: [
            'content-type',
            'user-agent',
            'accept',
            'accept-language',
            'cache-control',
            'x-forwarded-for',
            'x-real-ip'
          ],
          // Note: headerKeysToRedact not available in this version
        }}
        enableStrictPrivacy
        enableCanvasRecording={false}
        enablePerformanceRecording={true}
        inlineImages={false}
        inlineStylesheet={false}
        recordCrossOriginIframe={false}
        // Note: samplingStrategy configuration simplified
        environment={process.env.NODE_ENV || 'development'}
      />
      <html lang="es">
        <body className="antialiased min-h-screen flex flex-col">
          <ErrorBoundary>
            <RouterLoggerWrapper />
            <AuthProvider>
              <ToastProvider>
                <div className="flex-1">
                  {children}
                </div>
                <Footer />
                <UpgradeNotification />
                <Analytics />
                <SpeedInsights />
              </ToastProvider>
            </AuthProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
