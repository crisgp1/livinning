'use client'

import { UserButton } from '@clerk/nextjs'
import { useEffectiveUser } from '@/hooks/useEffectiveUser'
import Image from 'next/image'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useImpersonationTransition } from '@/hooks/useImpersonationTransition'

export default function ImpersonationUserButton() {
  const { user, isImpersonating, impersonationData } = useEffectiveUser()
  const [isOpen, setIsOpen] = useState(false)
  const { startTransition } = useImpersonationTransition()

  // If not impersonating, use regular UserButton
  if (!isImpersonating || !impersonationData) {
    return <UserButton afterSignOutUrl="/" />
  }

  // When impersonating, show custom button with impersonated user's photo
  const displayName = impersonationData.targetUserName && impersonationData.targetUserName !== 'null null'
    ? impersonationData.targetUserName
    : impersonationData.targetUserEmail

  const initials = impersonationData.targetUserName && impersonationData.targetUserName !== 'null null'
    ? impersonationData.targetUserName.split(' ').filter(n => n && n !== 'null').map(n => n[0]).join('').toUpperCase()
    : impersonationData.targetUserEmail?.[0]?.toUpperCase() || '?'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
      >
        {impersonationData.targetUserImageUrl ? (
          <Image
            src={impersonationData.targetUserImageUrl}
            alt={displayName}
            width={32}
            height={32}
            className="rounded-full border-2 border-orange-400"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-orange-400">
            {initials}
          </div>
        )}
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                {impersonationData.targetUserImageUrl ? (
                  <Image
                    src={impersonationData.targetUserImageUrl}
                    alt={displayName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {initials}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{displayName}</p>
                  <p className="text-xs text-gray-500">{impersonationData.targetUserEmail}</p>
                  <p className="text-xs text-orange-600 font-medium mt-1">Impersonando</p>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs text-gray-500">
                Usuario original:
              </div>
              <button
                onClick={() => {
                  setIsOpen(false)
                  startTransition('end', async () => {
                    // Stop impersonation
                    const response = await fetch('/api/admin/impersonate', {
                      method: 'DELETE'
                    })
                    if (response.ok) {
                      setTimeout(() => {
                        window.location.reload()
                      }, 100)
                    }
                  })
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
              >
                {impersonationData.originalUserImageUrl ? (
                  <Image
                    src={impersonationData.originalUserImageUrl}
                    alt={impersonationData.originalUserName || 'Admin'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {impersonationData.originalUserName && impersonationData.originalUserName !== 'null null'
                      ? impersonationData.originalUserName.split(' ').filter(n => n && n !== 'null').map(n => n[0]).join('').toUpperCase()
                      : 'A'}
                  </div>
                )}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {impersonationData.originalUserName && impersonationData.originalUserName !== 'null null'
                      ? impersonationData.originalUserName
                      : 'Admin'}
                  </p>
                  <p className="text-xs text-blue-600">Volver a mi cuenta</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}