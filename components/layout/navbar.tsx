// ============================================
// LIVINNING - Navbar Público
// ============================================

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { Home, Building, Info, Phone, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/layout/notification-bell';

export function Navbar() {
  const { user } = useUser();
  const userRole = ((user?.publicMetadata?.role as string) || 'user').toLowerCase();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* Logo completo para desktop */}
          <Image
            src="/logo.svg"
            alt="Livinning"
            width={140}
            height={40}
            className="hidden md:block h-8 w-auto"
            priority
          />
          {/* Logo contraído para mobile */}
          <Image
            src="/logo-contraido.svg"
            alt="Livinning"
            width={40}
            height={40}
            className="md:hidden h-10 w-10"
            priority
          />
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Inicio</span>
          </Link>
          <Link
            href="/propiedades"
            className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Building className="h-4 w-4" />
            <span>Propiedades</span>
          </Link>
          <Link
            href="/sobre-nosotros"
            className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Info className="h-4 w-4" />
            <span>Sobre Nosotros</span>
          </Link>
          <Link
            href="/contacto"
            className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Contacto</span>
          </Link>
        </div>

        {/* Auth Buttons with Clerk */}
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Iniciar Sesión
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Registrarse
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href={`/dashboard/${userRole}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Panel</span>
              </Button>
            </Link>
            <NotificationBell />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
