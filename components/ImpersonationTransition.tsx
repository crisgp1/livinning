'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface ImpersonationTransitionProps {
  isActive: boolean
  onComplete?: () => void
}

export default function ImpersonationTransition({ isActive, onComplete }: ImpersonationTransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isActive && overlayRef.current && textRef.current && circleRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete()
        }
      })

      // Set initial states
      gsap.set(overlayRef.current, { display: 'flex' })
      gsap.set(circleRef.current, { scale: 0, opacity: 0 })
      gsap.set(textRef.current, { opacity: 0, y: 20 })

      // Animation sequence
      tl.to(circleRef.current, {
        scale: 50,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.inOut'
      })
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.4')
      .to(textRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: 'power2.in',
        delay: 0.8
      })
      .to(circleRef.current, {
        scale: 100,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.in'
      }, '-=0.2')
      .set(overlayRef.current, { display: 'none' })
    }
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] bg-white hidden items-center justify-center"
      style={{ pointerEvents: 'all' }}
    >
      <div
        ref={circleRef}
        className="absolute w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"
        style={{ transformOrigin: 'center' }}
      />
      
      <div ref={textRef} className="relative z-10">
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-800 tracking-wider">
            Desimpersonando
          </h2>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}