import { Suspense } from 'react'
import RouterLogger from './RouterLogger'

export default function RouterLoggerWrapper() {
  return (
    <Suspense fallback={null}>
      <RouterLogger />
    </Suspense>
  )
}