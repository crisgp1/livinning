'use client'

import { create } from 'zustand'

interface ImpersonationTransitionStore {
  isTransitioning: boolean
  transitionType: 'start' | 'end' | null
  startTransition: (type: 'start' | 'end', callback?: () => void) => void
  endTransition: () => void
  transitionCallback: (() => void) | null
}

export const useImpersonationTransition = create<ImpersonationTransitionStore>((set) => ({
  isTransitioning: false,
  transitionType: null,
  transitionCallback: null,
  startTransition: (type, callback) => {
    set({ isTransitioning: true, transitionType: type, transitionCallback: callback })
  },
  endTransition: () => {
    set((state) => {
      if (state.transitionCallback) {
        state.transitionCallback()
      }
      return { isTransitioning: false, transitionType: null, transitionCallback: null }
    })
  }
}))