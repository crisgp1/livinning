<<<<<<< HEAD
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

interface ToastProps {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose: (id: string) => void
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning', duration?: number) => void
}

// Toast context for global state
import { createContext, useContext, ReactNode } from 'react'

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Individual toast component
function Toast({ id, message, type, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          background: 'var(--color-surface)',
          border: '1px solid var(--color-success)',
          color: 'var(--color-text)',
          borderLeft: '4px solid var(--color-success)'
        }
      case 'error':
        return {
          background: 'var(--color-surface)',
          border: '1px solid var(--color-error)',
          color: 'var(--color-text)',
          borderLeft: '4px solid var(--color-error)'
        }
      case 'warning':
        return {
          background: 'var(--color-surface)',
          border: '1px solid var(--color-warning)',
          color: 'var(--color-text)',
          borderLeft: '4px solid var(--color-warning)'
        }
      case 'info':
        return {
          background: 'var(--color-surface)',
          border: '1px solid var(--color-info)',
          color: 'var(--color-text)',
          borderLeft: '4px solid var(--color-info)'
        }
      default:
        return {
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
          borderLeft: '4px solid var(--color-border)'
        }
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
      case 'error':
        return <XCircle size={20} style={{ color: 'var(--color-error)' }} />
      case 'warning':
        return <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
      case 'info':
        return <Info size={20} style={{ color: 'var(--color-info)' }} />
      default:
        return <Info size={20} style={{ color: 'var(--color-text-muted)' }} />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center gap-3 p-4 rounded-lg max-w-md pointer-events-auto"
      style={{
        ...getTypeStyles(),
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {getIcon()}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <X size={16} />
      </button>
    </motion.div>
  )
}

// Toast container component
function ToastContainer({ toasts, onClose }: { toasts: ToastProps[], onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Toast provider component
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning', duration = 4000) => {
    const id = crypto.randomUUID()
    const newToast: ToastProps = {
      id,
      message,
      type,
      duration,
      onClose: removeToast
    }
    
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}

=======
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

interface ToastProps {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose: (id: string) => void
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning', duration?: number) => void
}

// Toast context for global state
import { createContext, useContext, ReactNode } from 'react'

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Individual toast component
function Toast({ id, message, type, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          background: 'var(--color-surface)',
          border: '1px solid var(--color-success)',
          color: 'var(--color-text)',
          borderLeft: '4px solid var(--color-success)'
        }
      case 'error':
        return {
          background: 'var(--color-surface)',
          border: '1px solid var(--color-error)',
          color: 'var(--color-text)',
          borderLeft: '4px solid var(--color-error)'
        }
      case 'warning':
        return {
          background: 'var(--color-surface)',
          border: '1px solid var(--color-warning)',
          color: 'var(--color-text)',
          borderLeft: '4px solid var(--color-warning)'
        }
      case 'info':
        return {
          background: 'var(--color-surface)',
          border: '1px solid var(--color-info)',
          color: 'var(--color-text)',
          borderLeft: '4px solid var(--color-info)'
        }
      default:
        return {
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
          borderLeft: '4px solid var(--color-border)'
        }
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
      case 'error':
        return <XCircle size={20} style={{ color: 'var(--color-error)' }} />
      case 'warning':
        return <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
      case 'info':
        return <Info size={20} style={{ color: 'var(--color-info)' }} />
      default:
        return <Info size={20} style={{ color: 'var(--color-text-muted)' }} />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center gap-3 p-4 rounded-lg max-w-md pointer-events-auto"
      style={{
        ...getTypeStyles(),
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {getIcon()}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <X size={16} />
      </button>
    </motion.div>
  )
}

// Toast container component
function ToastContainer({ toasts, onClose }: { toasts: ToastProps[], onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Toast provider component
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      id,
      message,
      type,
      duration,
      onClose: removeToast
    }
    
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}

>>>>>>> 58f1e799c779b3a7fa2d1b6374712fd44597bda3
export default Toast