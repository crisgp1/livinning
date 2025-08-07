'use client'

import { create } from 'zustand'

interface ImpersonationTransitionStore {
  isTransitioning: boolean
  startTransition: (callback?: () => void) => void
  endTransition: () => void
  transitionCallback: (() => void) | null
}

export const useImpersonationTransition = create<ImpersonationTransitionStore>((set) => ({
  isTransitioning: false,
  transitionCallback: null,
  startTransition: (callback) => {
    set({ isTransitioning: true, transitionCallback: callback })
  },
  endTransition: () => {
    set((state) => {
      if (state.transitionCallback) {
        state.transitionCallback()
      }
      return { isTransitioning: false, transitionCallback: null }
    })
  }
}))