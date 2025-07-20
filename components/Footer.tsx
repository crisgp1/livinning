import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="text-white py-16" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 100%)' }}>
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">Livinning</h3>
            <p className="mb-6" style={{ color: '#b3b3b3' }}>
              Inmobiliaria redefinida. Experimenta propiedades excepcionales y servicio sin igual.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="transition-colors" style={{ color: '#999999' }} 
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#ffffff');
                }} 
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#999999');
                }}>
                <Facebook size={20} />
              </Link>
              <Link href="#" className="transition-colors" style={{ color: '#999999' }} 
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#ffffff');
                }} 
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#999999');
                }}>
                <Twitter size={20} />
              </Link>
              <Link href="#" className="transition-colors" style={{ color: '#999999' }} 
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#ffffff');
                }} 
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#999999');
                }}>
                <Instagram size={20} />
              </Link>
              <Link href="#" className="transition-colors" style={{ color: '#999999' }} 
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#ffffff');
                }} 
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#999999');
                }}>
                <Linkedin size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="transition-colors" style={{ color: '#b3b3b3' }} 
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#ffffff');
                  }} 
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#b3b3b3');
                  }}>
                  Acerca de Nosotros
                </Link>
              </li>
              <li>
                <Link href="/team" className="transition-colors" style={{ color: '#b3b3b3' }} 
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#ffffff');
                  }} 
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#b3b3b3');
                  }}>
                  Nuestro Equipo
                </Link>
              </li>
              <li>
                <Link href="/careers" className="transition-colors" style={{ color: '#b3b3b3' }} 
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#ffffff');
                  }} 
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#b3b3b3');
                  }}>
                  Carreras
                </Link>
              </li>
              <li>
                <Link href="/press" className="transition-colors" style={{ color: '#b3b3b3' }} 
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#ffffff');
                  }} 
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#b3b3b3');
                  }}>
                  Prensa
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Servicios</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/comprar" className="transition-colors" style={{ color: '#b3b3b3' }} 
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#ffffff');
                  }} 
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#b3b3b3');
                  }}>
                  Comprar Propiedad
                </Link>
              </li>
              <li>
                <Link href="/vender" className="transition-colors" style={{ color: '#b3b3b3' }} 
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#ffffff');
                  }} 
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#b3b3b3');
                  }}>
                  Vender Propiedad
                </Link>
              </li>
              <li>
                <Link href="/alquilar" className="transition-colors" style={{ color: '#b3b3b3' }} 
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#ffffff');
                  }} 
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#b3b3b3');
                  }}>
                  Alquileres
                </Link>
              </li>
              <li>
                <Link href="/inversion" className="transition-colors" style={{ color: '#b3b3b3' }} 
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#ffffff');
                  }} 
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#b3b3b3');
                  }}>
                  Inversión
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3" style={{ color: '#b3b3b3' }}>
                <Mail size={18} />
                <a href="mailto:hola@livinning.com" className="transition-colors" 
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#ffffff');
                  }} 
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#b3b3b3');
                  }}>
                  hola@livinning.com
                </a>
              </div>
              <div className="flex items-center gap-3" style={{ color: '#b3b3b3' }}>
                <Phone size={18} />
                <a href="tel:+34912345678" className="transition-colors" 
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#ffffff');
                  }} 
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('color', '#b3b3b3');
                  }}>
                  +34 91 234 56 78
                </a>
              </div>
              <div className="flex items-start gap-3" style={{ color: '#b3b3b3' }}>
                <MapPin size={18} className="mt-1" />
                <span>
                  Calle Gran Vía, 123<br />
                  Madrid, España 28013
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-8" style={{ borderColor: '#404040' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: '#999999' }}>
              &copy; 2024 Livinning. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacidad" className="transition-colors" style={{ color: '#999999' }} 
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#ffffff');
                }} 
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#999999');
                }}>
                Política de Privacidad
              </Link>
              <Link href="/terminos" className="transition-colors" style={{ color: '#999999' }} 
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#ffffff');
                }} 
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#999999');
                }}>
                Términos de Servicio
              </Link>
              <Link href="/cookies" className="transition-colors" style={{ color: '#999999' }} 
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#ffffff');
                }} 
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.setProperty('color', '#999999');
                }}>
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}