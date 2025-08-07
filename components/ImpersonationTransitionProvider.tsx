'use client'

import ImpersonationTransition from './ImpersonationTransition'
import { useImpersonationTransition } from '@/hooks/useImpersonationTransition'

export default function ImpersonationTransitionProvider() {
  const { isTransitioning, endTransition } = useImpersonationTransition()

  return (
    <ImpersonationTransition 
      isActive={isTransitioning} 
      onComplete={endTransition}
    />
  )
}