'use client'

import ImpersonationTransition from './ImpersonationTransition'
import { useImpersonationTransition } from '@/hooks/useImpersonationTransition'

export default function ImpersonationTransitionProvider() {
  const { isTransitioning, transitionType, endTransition } = useImpersonationTransition()

  return (
    <ImpersonationTransition 
      isActive={isTransitioning} 
      type={transitionType || 'end'}
      onComplete={endTransition}
    />
  )
}