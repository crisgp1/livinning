import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/components/providers/AuthProvider";
import UpgradeNotification from "@/components/UpgradeNotification";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouterLoggerWrapper from "@/components/RouterLoggerWrapper";
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
      <html lang="es">
        <body className="antialiased">
          <ErrorBoundary>
            <RouterLoggerWrapper />
            <AuthProvider>
              <ToastProvider>
                {children}
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
