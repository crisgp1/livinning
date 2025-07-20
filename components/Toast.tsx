'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff'
        }
      case 'error':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff'
        }
      case 'warning':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff'
        }
      case 'info':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff'
        }
      default:
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff'
        }
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
      case 'error':
        return <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
      case 'warning':
        return <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
      case 'info':
        return <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
      default:
        return <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center gap-3 p-4 rounded-xl shadow-lg backdrop-blur-md max-w-md pointer-events-auto"
      style={getTypeStyles()}
    >
      {getIcon()}
      <span className="text-sm font-light flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: '#ffffff' }}
      >
        <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
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

export default Toast