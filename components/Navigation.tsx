'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, Home, Building2, Phone, User2, Shield, Package, Headphones } from 'lucide-react'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import logger from '@/lib/utils/logger'
import { useLogger, useUserInteractionLogger } from '@/hooks/useLogger'
import NotificationCenter from './NotificationCenter'

// Local superadmin check function to avoid import issues
const isSuperAdmin = (user: any): boolean => {
  if (!user) return false

  // Primary check: user metadata for superadmin status (dynamic)
  if (user.publicMetadata?.isSuperAdmin === true) {
    return true
  }

  // Secondary check: role-based superadmin (dynamic)
  if (user.publicMetadata?.role === 'superadmin') {
    return true
  }

  // Fallback: hardcoded email check
  const userEmails = user.emailAddresses?.map((email: any) => email.emailAddress) || []
  return userEmails.includes('cristiangp2001@gmail.com')
}

export default function Navigation() {
  const { user } = useUser()
  const { logUserAction } = useLogger({ component: 'Navigation' })
  const { logClick, logNavigation } = useUserInteractionLogger('Navigation')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)
  const [isAgency, setIsAgency] = useState(false)
  const [isSupplier, setIsSupplier] = useState(false)
  const [isProvider, setIsProvider] = useState(false)
  const [isHelpdesk, setIsHelpdesk] = useState(false)

  useEffect(() => {
    // Use Intersection Observer for better performance
    // Create a sentinel element at the top of the page
    const sentinel = document.createElement('div')
    sentinel.style.position = 'absolute'
    sentinel.style.top = '0'
    sentinel.style.height = '20px'
    sentinel.style.pointerEvents = 'none'
    document.body.insertBefore(sentinel, document.body.firstChild)

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is not intersecting, we're scrolled down
        setIsScrolled(!entry.isIntersecting)
      },
      {
        rootMargin: '0px',
        threshold: [0, 1]
      }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      if (sentinel.parentNode) {
        sentinel.parentNode.removeChild(sentinel)
      }
    }
  }, [])

  useEffect(() => {
    if (user) {
      const metadata = user.publicMetadata as any

      // Use centralized superadmin check
      const superAdminStatus = isSuperAdmin(user)

      const agencyStatus = metadata?.isAgency === true
      const supplierStatus = metadata?.role === 'supplier'
      const providerStatus = metadata?.role === 'provider' || metadata?.providerAccess === true
      const helpdeskStatus = metadata?.role === 'helpdesk'

      setIsSuperAdminUser(superAdminStatus)
      setIsAgency(agencyStatus)
      setIsSupplier(supplierStatus)
      setIsProvider(providerStatus)
      setIsHelpdesk(helpdeskStatus)

      logger.debug('Navigation', 'User role detection', {
        userId: user.id,
        email: user.emailAddresses?.[0]?.emailAddress,
        isSuperAdmin: superAdminStatus,
        isAgency: agencyStatus,
        isSupplier: supplierStatus,
        isProvider: providerStatus,
        isHelpdesk: helpdeskStatus,
        role: metadata?.role
      })
    }
  }, [user])

  const toggleMobileMenu = () => {
    logClick('mobile-menu-toggle', 'toggle-btn', { isOpen: !isMobileMenuOpen })
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const navItems = [
    { label: 'Comprar', href: '/propiedades', icon: Home, hideForSupplier: true },
    { label: 'Vender', href: '/publish', icon: Building2, requiresAuth: true, hideForSupplier: true },
    { label: 'Servicios', href: '/servicios', icon: User2, hideForSupplier: true },
    { label: 'Contacto', href: '/contacto', icon: Phone }
  ]

  const filteredNavItems = (isSupplier || isProvider)
    ? navItems.filter(item => !item.hideForSupplier)
    : navItems

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
            {filteredNavItems.map((item) => (
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
              {!isSupplier && !isProvider && (
                <Link
                  href="/dashboard"
                  className="font-medium text-gray-700 hover:text-primary transition-colors duration-200"
                >
                  Dashboard
                </Link>
              )}
              {isSuperAdminUser && (
                <Link
                  href="/superadmin"
                  className="flex items-center space-x-1 font-medium text-gray-700 hover:text-primary transition-colors duration-200"
                >
                  <Shield size={16} />
                  <span>Admin</span>
                </Link>
              )}
              {(isHelpdesk || isSuperAdminUser) && (
                <Link
                  href="/helpdesk"
                  className="flex items-center space-x-1 font-medium text-gray-700 hover:text-primary transition-colors duration-200"
                >
                  <Headphones size={16} />
                  <span>Helpdesk</span>
                </Link>
              )}
              {(isSupplier || isProvider) && (
                <Link
                  href="/provider-dashboard"
                  className="flex items-center space-x-1 font-medium text-gray-700 hover:text-primary transition-colors duration-200"
                >
                  <Package size={16} />
                  <span>Proveedor</span>
                </Link>
              )}
              {!isSupplier && !isProvider && (
                <Link href="/publish" className="btn-primary">
                  Publicar Propiedad
                </Link>
              )}
              <NotificationCenter />
              <UserButton />
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
          {filteredNavItems.map((item) => (
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
              {!isSupplier && !isProvider && (
                <Link
                  href="/dashboard"
                  className="block py-3 px-4 text-center font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {isSuperAdminUser && (
                <Link
                  href="/superadmin"
                  className="flex items-center justify-center space-x-2 py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield size={16} />
                  <span>Admin</span>
                </Link>
              )}
              {(isHelpdesk || isSuperAdminUser) && (
                <Link
                  href="/helpdesk"
                  className="flex items-center justify-center space-x-2 py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Headphones size={16} />
                  <span>Helpdesk</span>
                </Link>
              )}
              {(isSupplier || isProvider) && (
                <Link
                  href="/provider-dashboard"
                  className="flex items-center justify-center space-x-2 py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package size={16} />
                  <span>Proveedor</span>
                </Link>
              )}
              {!isSupplier && !isProvider && (
                <Link
                  href="/publish"
                  className="btn-primary w-full block text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Publicar Propiedad
                </Link>
              )}
              <div className="flex justify-center items-center gap-4 pt-2">
                <NotificationCenter />
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      </motion.div>
    </nav>
  )
}