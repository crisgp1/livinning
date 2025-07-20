'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { gsap } from 'gsap'

export default function Navigation() {
  const { user } = useUser()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isOnWhitePage, setIsOnWhitePage] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isAgency, setIsAgency] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLHeadingElement>(null)
  const menuItemsRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const magicLineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    const checkPageBackground = () => {
      const isPropertyPage = window.location.pathname.includes('/properties/')
      const isWhiteBgPage = isPropertyPage || window.location.pathname !== '/'
      setIsOnWhitePage(isWhiteBgPage)
    }
    
    checkPageBackground()
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('popstate', checkPageBackground)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('popstate', checkPageBackground)
    }
  }, [])

  useEffect(() => {
    // Check if user is superadmin
    if (user) {
      const userEmails = user.emailAddresses?.map(email => email.emailAddress) || []
      setIsSuperAdmin(userEmails.includes('cristiangp2001@gmail.com'))
      
      // Check if user is an agency from Clerk metadata
      const metadata = user.publicMetadata as any
      setIsAgency(metadata?.isAgency === true)
    }
  }, [user])

  useEffect(() => {
    const tl = gsap.timeline()
    
    tl.fromTo(navRef.current, 
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(logoRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
      "-=0.5"
    )
    .fromTo(menuItemsRef.current?.children || [],
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo(buttonsRef.current?.children || [],
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1, ease: "back.out(1.7)" },
      "-=0.3"
    )

    const menuItems = menuItemsRef.current?.querySelectorAll('a')
    
    menuItems?.forEach((item) => {
      const handleMouseEnter = () => {
        gsap.to(item, {
          y: -3,
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        })
      }

      const handleMouseLeave = () => {
        gsap.to(item, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        })
      }

      item.addEventListener('mouseenter', handleMouseEnter)
      item.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        item.removeEventListener('mouseenter', handleMouseEnter)
        item.removeEventListener('mouseleave', handleMouseLeave)
      }
    })
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const shouldShowDarkText = false // Always show light text for dark theme

  return (
    <nav
      ref={navRef}
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled || isOnWhitePage ? 'py-4' : 'py-6'
      }`}
      style={{
        background: isScrolled || isOnWhitePage 
          ? 'rgba(10, 10, 10, 0.9)' 
          : 'transparent',
        backdropFilter: isScrolled || isOnWhitePage ? 'blur(12px)' : 'none',
        borderBottom: isScrolled || isOnWhitePage 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : 'none'
      }}
    >
      <div className="section-container">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 
              ref={logoRef}
              className="text-2xl font-bold transition-colors duration-300 cursor-pointer"
              style={{ 
                background: 'linear-gradient(135deg, #ffffff, #a3a3a3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Livinning
            </h1>
          </Link>

          <div ref={menuItemsRef} className="hidden md:flex items-center space-x-8 relative">
            <div 
              ref={magicLineRef}
              className="absolute bottom-0 h-0.5 rounded-full transition-all duration-300 opacity-0"
              style={{ 
                width: '0px', 
                left: '0px',
                background: 'linear-gradient(135deg, #ffffff, #a3a3a3)'
              }}
            />
            {[
              { label: 'Propiedades', href: '/propiedades' },
              { label: 'Acerca de', href: '/acerca-de' },
              { label: 'Servicios', href: '/servicios' },
              { label: 'Contacto', href: '/contacto' }
            ].map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-medium transition-all duration-300 text-sm relative py-2 px-3 rounded-lg"
                style={{ color: '#e5e5e5' }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement
                  target.style.color = '#ffffff'
                  target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  const rect = target.getBoundingClientRect()
                  const parentRect = menuItemsRef.current?.getBoundingClientRect()
                  if (parentRect && magicLineRef.current) {
                    gsap.to(magicLineRef.current, {
                      width: rect.width,
                      x: rect.left - parentRect.left,
                      opacity: 1,
                      duration: 0.3,
                      ease: "power2.out"
                    })
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement
                  target.style.color = '#e5e5e5'
                  target.style.backgroundColor = 'transparent'
                  gsap.to(magicLineRef.current, {
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.out"
                  })
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div ref={buttonsRef} className="hidden md:flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-secondary">
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
              <Link href="/dashboard" className="px-4 py-2 rounded-lg font-medium transition-all duration-300" style={{ color: '#e5e5e5' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#ffffff'; (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)' }} onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#e5e5e5'; (e.target as HTMLElement).style.backgroundColor = 'transparent' }}>
                Dashboard
              </Link>
              {isSuperAdmin && (
                <Link href="/superadmin" className="px-4 py-2 rounded-lg font-medium transition-all duration-300" style={{ color: '#a3a3a3' }} onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#ffffff'; (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)' }} onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#a3a3a3'; (e.target as HTMLElement).style.backgroundColor = 'transparent' }}>
                  Superadmin
                </Link>
              )}
              <Link href="/publish" className="btn-primary">
                Publicar Propiedad
              </Link>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </SignedIn>
          </div>

          <button
            onClick={toggleMobileMenu}
            className="md:hidden transition-colors duration-300 relative z-10 text-white"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        ref={mobileMenuRef}
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="px-4 py-6 space-y-4">
          {[
            { label: 'Propiedades', href: '/propiedades' },
            { label: 'Acerca de', href: '/acerca-de' },
            { label: 'Servicios', href: '/servicios' },
            { label: 'Contacto', href: '/contacto' }
          ].map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={`block py-3 px-4 transition-all duration-300 rounded-lg transform ${
                isMobileMenuOpen 
                  ? 'translate-x-0 opacity-100' 
                  : '-translate-x-4 opacity-0'
              }`}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement
                target.style.color = '#ffffff'
                target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement
                target.style.color = '#e5e5e5'
                target.style.backgroundColor = 'transparent'
              }}
              style={{ 
                transitionDelay: isMobileMenuOpen ? `${index * 100}ms` : '0ms',
                color: '#e5e5e5'
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className={`pt-4 space-y-3 transition-all duration-500 ${
            isMobileMenuOpen 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: isMobileMenuOpen ? '400ms' : '0ms' }}
          >
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-secondary w-full">Iniciar Sesión</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary w-full">Registrarse</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="btn-secondary w-full block text-center mb-2">
                Dashboard
              </Link>
              <Link href="/publish" className="btn-primary w-full block text-center">
                Publicar Propiedad
              </Link>
              <div className="flex justify-center pt-2">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}