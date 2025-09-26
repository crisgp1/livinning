import { ReactNode } from 'react'

interface PublishLayoutProps {
  children: ReactNode
}

export default function PublishLayout({ children }: PublishLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}