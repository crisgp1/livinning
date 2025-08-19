import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/Toast";
import UpgradeNotification from "@/components/UpgradeNotification";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouterLoggerWrapper from "@/components/RouterLoggerWrapper";
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
            <RouterLoggerWrapper />
            <ToastProvider>
              {children}
              <UpgradeNotification />
            </ToastProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
