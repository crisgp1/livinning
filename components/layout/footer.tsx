// ============================================
// LIVINNING - Footer
// ============================================

import Link from 'next/link';
import Image from 'next/image';
import { Building, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-neutral-900 text-neutral-200">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              {/* Logo blanco completo para desktop */}
              <Image
                src="/logo-blanco.svg"
                alt="Livinning"
                width={140}
                height={40}
                className="hidden md:block h-8 w-auto"
              />
              {/* Logo blanco contraído para mobile */}
              <Image
                src="/logo-contraido-blanco.svg"
                alt="Livinning"
                width={40}
                height={40}
                className="md:hidden h-10 w-10"
              />
            </Link>
            <p className="text-sm text-neutral-400">
              La plataforma de bienes raíces más completa. Encuentra tu hogar ideal o publica tus propiedades.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/propiedades" className="text-neutral-400 hover:text-white transition-colors">
                  Explorar Propiedades
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="text-neutral-400 hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-neutral-400 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* For Business */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Para Negocios</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="text-neutral-400 hover:text-white transition-colors">
                  Planes y Precios
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-neutral-400 hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 mt-0.5 text-neutral-400" />
                <span className="text-neutral-400">contacto@livinning.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-4 w-4 mt-0.5 text-neutral-400" />
                <span className="text-neutral-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-neutral-400" />
                <span className="text-neutral-400">123 Real Estate St, City, Country</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-neutral-800" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-neutral-400">
            © {currentYear} Livinning. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">
              Privacidad
            </Link>
            <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">
              Términos
            </Link>
            <Link href="/cookies" className="text-neutral-400 hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
