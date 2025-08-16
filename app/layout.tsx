import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/Toast";
import DeveloperRoleChanger from "@/components/DeveloperRoleChanger";
import UpgradeNotification from "@/components/UpgradeNotification";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import ImpersonationTransitionProvider from "@/components/ImpersonationTransitionProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouterLogger from "@/components/RouterLogger";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

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
        <body className={`${lexend.variable} antialiased`}>
          <ErrorBoundary>
            <RouterLogger />
            <ImpersonationBanner />
            <ImpersonationTransitionProvider />
            <ToastProvider>
              {children}
              <DeveloperRoleChanger />
              <UpgradeNotification />
            </ToastProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
