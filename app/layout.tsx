import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const vertiga = localFont({
  src: [
    {
      path: "./fonts/Vertiga-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Vertiga-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Vertiga-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-vertiga",
});

export const metadata: Metadata = {
  title: "Livinning - Plataforma de Bienes Raíces",
  description: "Encuentra tu hogar ideal o publica tus propiedades en la plataforma más completa.",
  keywords: "bienes raíces, propiedades, casas, departamentos, venta, renta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={`${vertiga.variable} antialiased`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
