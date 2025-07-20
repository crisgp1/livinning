'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import FeaturedProperties from '@/components/FeaturedProperties'
import Services from '@/components/Services'
import AuthenticatedContent from '@/components/AuthenticatedContent'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  useEffect(() => {
    // Initialize smooth scroll behavior
    gsap.config({ nullTargetWarn: false })
    
    // Refresh ScrollTrigger on load
    ScrollTrigger.refresh()
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Navigation />
      <Hero />
      <FeaturedProperties />
      <AuthenticatedContent />
      <Services />
      <CTA />
      <Footer />
    </div>
  )
}