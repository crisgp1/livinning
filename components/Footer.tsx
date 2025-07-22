import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 py-12 mt-16">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-primary mb-3">Livinning</h3>
            <p className="text-gray-600 mb-4 text-sm">
              La plataforma líder de bienes raíces en México. Encuentra tu hogar ideal con nosotros.
            </p>
            {/* App Download Buttons */}
            <div className="flex gap-3 mb-4">
              <Link href="#" className="inline-block">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Google Play" 
                  className="h-10"
                />
              </Link>
              <Link href="#" className="inline-block">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="App Store" 
                  className="h-10"
                />
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Compañía</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary transition-colors">
                  Acerca de
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:text-primary transition-colors">
                  Carreras
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-600 hover:text-primary transition-colors">
                  Prensa
                </Link>
              </li>
              <li>
                <Link href="/investors" className="text-gray-600 hover:text-primary transition-colors">
                  Inversionistas
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Servicios</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/propiedades" className="text-gray-600 hover:text-primary transition-colors">
                  Comprar
                </Link>
              </li>
              <li>
                <Link href="/rent" className="text-gray-600 hover:text-primary transition-colors">
                  Rentar
                </Link>
              </li>
              <li>
                <Link href="/publish" className="text-gray-600 hover:text-primary transition-colors">
                  Vender
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="text-gray-600 hover:text-primary transition-colors">
                  Agentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-primary transition-colors">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-600 hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-primary transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-gray-600 hover:text-primary transition-colors">
                  Guías
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info and Social Media */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Contact Information */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <a href="mailto:contacto@livinning.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail size={16} />
                contacto@livinning.com
              </a>
              <a href="tel:+525512345678" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone size={16} />
                +52 55 1234 5678
              </a>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-4">
              <Link href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                <Facebook size={18} className="text-gray-600" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                <Twitter size={18} className="text-gray-600" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                <Instagram size={18} className="text-gray-600" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                <Youtube size={18} className="text-gray-600" />
              </Link>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              © 2024 Livinning. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors">
                Privacidad
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors">
                Términos
              </Link>
              <Link href="/sitemap" className="text-gray-600 hover:text-primary transition-colors">
                Mapa del Sitio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}