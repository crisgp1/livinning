'use client'

import { useEffect, useRef } from 'react'
// TODO: Convert this component from GSAP to Framer Motion for consistency

interface ImpersonationTransitionProps {
  isActive: boolean
  type: 'start' | 'end'
  onComplete?: () => void
}

export default function ImpersonationTransition({ isActive, type, onComplete }: ImpersonationTransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isActive && overlayRef.current && textRef.current && circleRef.current) {
      // GSAP code commented out - needs migration to Framer Motion
      if (onComplete) onComplete()
      /*
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete()
        }
      })

      // Set initial states
      gsap.set(overlayRef.current, { display: 'flex' })
      gsap.set(circleRef.current, { scale: 0, opacity: 0 })
      gsap.set(textRef.current, { opacity: 0, y: 20 })
      */

      // Animation sequence removed - needs Framer Motion conversion
    }
  }, [isActive, type, onComplete])

  if (!isActive) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] bg-white hidden items-center justify-center"
      style={{ pointerEvents: 'all' }}
    >
      <div
        ref={circleRef}
        className={`absolute w-20 h-20 rounded-full ${
          type === 'start' 
            ? 'bg-gradient-to-br from-orange-400 to-red-500' 
            : 'bg-gradient-to-br from-blue-400 to-purple-500'
        }`}
        style={{ transformOrigin: 'center' }}
      />
      
      <div ref={textRef} className="relative z-10">
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-800 tracking-wider">
            {type === 'start' ? 'Impersonando' : 'Desimpersonando'}
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
