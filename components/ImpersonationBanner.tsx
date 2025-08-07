'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, X } from 'lucide-react'
import Image from 'next/image'

interface ImpersonationData {
  originalUserId: string
  originalUserName: string
  originalUserImageUrl?: string
  targetUserId: string
  targetUserName: string
  targetUserEmail: string
  targetUserImageUrl?: string
  targetUserRole: string
  impersonatedAt: string
}

export default function ImpersonationBanner() {
  const [impersonationData, setImpersonationData] = useState<ImpersonationData | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    const checkImpersonation = () => {
      try {
        const impersonationCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('impersonation='))
          ?.split('=')[1]
        
        if (impersonationCookie) {
          const data = JSON.parse(decodeURIComponent(impersonationCookie))
          setImpersonationData(data)
        }
      } catch (error) {
        console.error('Error parsing impersonation data:', error)
      }
    }

    checkImpersonation()
  }, [])

  const stopImpersonation = async () => {
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'DELETE'
      })

      if (response.ok) {
        setImpersonationData(null)
        window.location.reload()
      }
    } catch (error) {
      console.error('Error stopping impersonation:', error)
    }
  }

  if (!impersonationData) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        className={`fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transition-all ${
          isMinimized ? 'py-1' : 'py-3'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span className="font-semibold text-sm">
                  Estás actuando como:
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {impersonationData.targetUserImageUrl ? (
                  <Image
                    src={impersonationData.targetUserImageUrl}
                    alt={impersonationData.targetUserName || impersonationData.targetUserEmail}
                    width={isMinimized ? 24 : 32}
                    height={isMinimized ? 24 : 32}
                    className="rounded-full border-2 border-white/50"
                  />
                ) : (
                  <div className={`${isMinimized ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} bg-white/20 rounded-full flex items-center justify-center font-semibold`}>
                    {impersonationData.targetUserName && impersonationData.targetUserName !== 'null null' 
                      ? impersonationData.targetUserName.split(' ').filter(n => n && n !== 'null').map(n => n[0]).join('').toUpperCase()
                      : impersonationData.targetUserEmail?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                
                {!isMinimized && (
                  <div>
                    <p className="font-medium text-sm">
                      {impersonationData.targetUserName && impersonationData.targetUserName !== 'null null' 
                        ? impersonationData.targetUserName 
                        : impersonationData.targetUserEmail}
                    </p>
                    <p className="text-xs text-white/80">
                      {impersonationData.targetUserEmail} • Rol: {impersonationData.targetUserRole}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {!isMinimized && (
                <p className="text-xs text-white/70 mr-2">
                  Usuario original: {impersonationData.originalUserName && impersonationData.originalUserName !== 'null null' 
                    ? impersonationData.originalUserName 
                    : 'Admin'}
                </p>
              )}
              
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                <motion.div
                  animate={{ rotate: isMinimized ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                </motion.div>
              </button>
              
              <button
                onClick={stopImpersonation}
                className="flex items-center space-x-2 px-2 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-medium transition-colors"
              >
                {impersonationData.originalUserImageUrl ? (
                  <Image
                    src={impersonationData.originalUserImageUrl}
                    alt={impersonationData.originalUserName || 'Admin'}
                    width={20}
                    height={20}
                    className="rounded-full border border-white/50"
                  />
                ) : (
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {impersonationData.originalUserName && impersonationData.originalUserName !== 'null null'
                      ? impersonationData.originalUserName.split(' ').filter(n => n && n !== 'null').map(n => n[0]).join('').toUpperCase()
                      : 'A'}
                  </div>
                )}
                <X className="w-3 h-3" />
                <span>Finalizar</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Spacer to push content down */}
      <div className={`${isMinimized ? 'h-8' : 'h-14'} transition-all`} />
    </AnimatePresence>
  )
}