'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, Home, Building2, Phone, User2, Shield, Package } from 'lucide-react'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'

export default function Navigation() {
  const { user } = useUser()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isAgency, setIsAgency] = useState(false)
  const [isSupplier, setIsSupplier] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (user) {
      const metadata = user.publicMetadata as any
      
      // Dynamic superadmin check (same logic as utility function)
      setIsSuperAdmin(
        metadata?.isSuperAdmin === true ||
        metadata?.role === 'superadmin' ||
        user.emailAddresses?.some(email => email.emailAddress === 'cristiangp2001@gmail.com') // fallback
      )
      
      setIsAgency(metadata?.isAgency === true)
      setIsSupplier(metadata?.role === 'supplier')
    }
  }, [user])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const navItems = [
    { label: 'Comprar', href: '/propiedades', icon: Home },
    { label: 'Vender', href: '/publish', icon: Building2, requiresAuth: true },
    { label: 'Servicios', href: '/servicios', icon: User2 },
    { label: 'Contacto', href: '/contacto', icon: Phone }
  ]

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md py-3' 
          : 'bg-white/95 backdrop-blur-sm py-4'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">
              Livinning
            </h1>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.requiresAuth && !user ? (
                <SignUpButton key={item.label} mode="modal">
                  <button className="flex items-center space-x-2 font-medium text-gray-700 hover:text-primary transition-colors duration-200">
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </SignUpButton>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center space-x-2 font-medium text-gray-700 hover:text-primary transition-colors duration-200"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="font-medium text-gray-700 hover:text-primary transition-colors duration-200">
                  Iniciar Sesión
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary">
                  Registrarse
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              {!isSupplier && (
                <Link
                  href="/dashboard"
                  className="font-medium text-gray-700 hover:text-primary transition-colors duration-200"
                >
                  Dashboard
                </Link>
              )}
              {isSuperAdmin && (
                <Link
                  href="/superadmin"
                  className="flex items-center space-x-1 font-medium text-gray-700 hover:text-primary transition-colors duration-200"
                >
                  <Shield size={16} />
                  <span>Admin</span>
                </Link>
              )}
              {isSupplier && (
                <Link
                  href="/supplier/dashboard"
                  className="flex items-center space-x-1 font-medium text-gray-700 hover:text-primary transition-colors duration-200"
                >
                  <Package size={16} />
                  <span>Proveedor</span>
                </Link>
              )}
              <Link href="/publish" className="btn-primary">
                Publicar Propiedad
              </Link>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border-2 border-gray-200"
                  }
                }}
              />
            </SignedIn>
          </div>

          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-700"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: isMobileMenuOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden bg-white border-t border-gray-200"
      >
        <div className="px-4 py-6 space-y-4">
          {navItems.map((item) => (
            item.requiresAuth && !user ? (
              <SignUpButton key={item.label} mode="modal">
                <button
                  className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 w-full text-left"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon size={20} className="text-gray-600" />
                  <span className="font-medium text-gray-700">{item.label}</span>
                </button>
              </SignUpButton>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon size={20} className="text-gray-600" />
                <span className="font-medium text-gray-700">{item.label}</span>
              </Link>
            )
          ))}
          
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full py-3 text-center font-medium text-gray-700 hover:text-primary transition-colors duration-200">
                  Iniciar Sesión
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary w-full">
                  Registrarse
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              {!isSupplier && (
                <Link
                  href="/dashboard"
                  className="block py-3 px-4 text-center font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {isSuperAdmin && (
                <Link
                  href="/superadmin"
                  className="flex items-center justify-center space-x-2 py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield size={16} />
                  <span>Admin</span>
                </Link>
              )}
              {isSupplier && (
                <Link
                  href="/supplier/dashboard"
                  className="flex items-center justify-center space-x-2 py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package size={16} />
                  <span>Proveedor</span>
                </Link>
              )}
              <Link 
                href="/publish" 
                className="btn-primary w-full block text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Publicar Propiedad
              </Link>
              <div className="flex justify-center pt-2">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 border-2 border-gray-200"
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </motion.div>
    </nav>
  )
}