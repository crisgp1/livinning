'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

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

export function useEffectiveUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser()
  const [impersonationData, setImpersonationData] = useState<ImpersonationData | null>(null)
  const [effectiveUser, setEffectiveUser] = useState<any>(null)

  useEffect(() => {
    // Check for impersonation cookie
    const checkImpersonation = () => {
      try {
        const impersonationCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('impersonation='))
          ?.split('=')[1]
        
        if (impersonationCookie) {
          const data = JSON.parse(decodeURIComponent(impersonationCookie))
          setImpersonationData(data)
        } else {
          setImpersonationData(null)
        }
      } catch (error) {
        console.error('Error parsing impersonation data:', error)
        setImpersonationData(null)
      }
    }

    checkImpersonation()
    
    // Listen for storage events to sync across tabs
    const handleStorageChange = () => checkImpersonation()
    window.addEventListener('storage', handleStorageChange)
    
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    if (isLoaded && clerkUser && impersonationData) {
      // When impersonating, create a mock user object with target user data
      // We fetch the full user data from Clerk if needed
      fetch(`/api/admin/users/${impersonationData.targetUserId}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setEffectiveUser({
              ...data.user,
              id: impersonationData.targetUserId,
              firstName: impersonationData.targetUserName.split(' ')[0],
              lastName: impersonationData.targetUserName.split(' ').slice(1).join(' '),
              emailAddresses: [{ emailAddress: impersonationData.targetUserEmail }],
              imageUrl: impersonationData.targetUserImageUrl,
              publicMetadata: {
                ...data.user.publicMetadata,
                role: impersonationData.targetUserRole
              }
            })
          }
        })
        .catch(err => {
          console.error('Error fetching impersonated user data:', err)
          // Fallback to basic impersonation data
          setEffectiveUser({
            id: impersonationData.targetUserId,
            firstName: impersonationData.targetUserName.split(' ')[0],
            lastName: impersonationData.targetUserName.split(' ').slice(1).join(' '),
            emailAddresses: [{ emailAddress: impersonationData.targetUserEmail }],
            imageUrl: impersonationData.targetUserImageUrl,
            publicMetadata: {
              role: impersonationData.targetUserRole
            }
          })
        })
    } else if (isLoaded && clerkUser && !impersonationData) {
      // No impersonation, use the actual user
      setEffectiveUser(clerkUser)
    } else if (isLoaded && !clerkUser) {
      setEffectiveUser(null)
    }
  }, [isLoaded, clerkUser, impersonationData])

  return {
    user: effectiveUser,
    isLoaded,
    isSignedIn: isSignedIn && !!effectiveUser,
    isImpersonating: !!impersonationData,
    impersonationData,
    originalUser: impersonationData ? clerkUser : null
  }
}