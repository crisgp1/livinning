'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  Send, 
  AlertCircle,
  CheckCircle2,
  Crown,
  Shield,
  Star,
  MessageCircle
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import { useToast } from '@/components/Toast'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

export default function ContactPage() {
  const { user } = useUser()
  const { showToast } = useToast()
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [userPlan, setUserPlan] = useState<string>('free')
  const [isAgency, setIsAgency] = useState(false)

  useEffect(() => {
    if (user) {
      const metadata = user.publicMetadata as any
      setUserPlan(metadata?.organizationPlan || 'free')
      setIsAgency(metadata?.isAgency === true)
      
      // Pre-fill form with user data
      setForm(prev => ({
        ...prev,
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
        email: user.emailAddresses?.[0]?.emailAddress || ''
      }))
    }
  }, [user])

  const getSupportLevel = () => {
    if (!user) return { level: 'public', email: 'soporte@livinning.com', response: '48-72 horas' }
    
    switch (userPlan) {
      case 'enterprise':
        return { 
          level: 'enterprise', 
          email: 'enterprise@livinning.com', 
          response: '2-4 horas',
          features: ['Soporte telefónico', 'Manager dedicado', 'SLA garantizado']
        }
      case 'premium':
        return { 
          level: 'premium', 
          email: 'premium@livinning.com', 
          response: '4-8 horas',
          features: ['Soporte prioritario', 'Chat en vivo', 'Respuesta rápida']
        }
      case 'basic':
        return { 
          level: 'basic', 
          email: 'basic@livinning.com', 
          response: '12-24 horas',
          features: ['Soporte por email', 'Respuesta en horario laboral']
        }
      default:
        return { 
          level: 'free', 
          email: 'soporte@livinning.com', 
          response: '24-48 horas',
          features: ['Soporte comunitario', 'Respuesta estándar']
        }
    }
  }

  const supportInfo = getSupportLevel()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          userPlan,
          isAgency,
          supportEmail: supportInfo.email,
          userId: user?.id
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setForm({ name: '', email: '', subject: '', message: '', priority: 'normal' })
        showToast('¡Mensaje enviado correctamente! Te responderemos pronto.', 'success')
      } else {
        setSubmitStatus('error')
        showToast('Error al enviar el mensaje. Por favor, inténtalo de nuevo.', 'error')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setSubmitStatus('error')
      showToast('Error al enviar el mensaje. Por favor, inténtalo de nuevo.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'normal': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSupportIcon = () => {
    switch (supportInfo.level) {
      case 'enterprise': return <Crown className="w-6 h-6 text-purple-600" />
      case 'premium': return <Star className="w-6 h-6 text-blue-600" />
      case 'basic': return <Shield className="w-6 h-6 text-green-600" />
      default: return <MessageCircle className="w-6 h-6 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Navigation />
      
      <main className="pt-20">
        <div className="section-container py-16">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-light mb-4"
                style={{ color: '#ffffff' }}
              >
                Contacta con Nosotros
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl"
                style={{ color: '#a3a3a3' }}
              >
                Estamos aquí para ayudarte con cualquier pregunta o consulta
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-8"
                >
                  {/* Support Level Badge */}
                  {user && (
                    <div className="flex items-center gap-3 mb-6 p-4 rounded-lg" style={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                      <div>
                        <h3 className="font-light" style={{ color: '#ffffff' }}>
                          Soporte {supportInfo.level.charAt(0).toUpperCase() + supportInfo.level.slice(1)}
                        </h3>
                        <p className="text-sm" style={{ color: '#a3a3a3' }}>
                          Tiempo de respuesta: {supportInfo.response}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ 
                          background: 'linear-gradient(135deg, #ffffff, #e5e5e5)',
                          color: '#000000'
                        }}>
                          Plan {userPlan}
                        </span>
                      </div>
                    </div>
                  )}

                  <h2 className="text-2xl font-light mb-6" style={{ color: '#ffffff' }}>Enviar Mensaje</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#ffffff'
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                            e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                          Email
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#ffffff'
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                            e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                          Asunto
                        </label>
                        <input
                          type="text"
                          value={form.subject}
                          onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#ffffff'
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                            e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                          Prioridad
                        </label>
                        <select
                          value={form.priority}
                          onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value as any }))}
                          className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#ffffff'
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                            e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                          }}
                        >
                          <option value="low" style={{ background: '#111111', color: '#ffffff' }}>Baja</option>
                          <option value="normal" style={{ background: '#111111', color: '#ffffff' }}>Normal</option>
                          <option value="high" style={{ background: '#111111', color: '#ffffff' }}>Alta</option>
                          {(userPlan === 'premium' || userPlan === 'enterprise') && (
                            <option value="urgent" style={{ background: '#111111', color: '#ffffff' }}>Urgente</option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                        Mensaje
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors resize-none"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#ffffff'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#ffffff'
                          e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                          e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                        }}
                        placeholder="Describe tu consulta o problema en detalle..."
                        required
                      />
                    </div>


                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="loading-spinner"></div>
                      ) : (
                        <>
                          <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                          Enviar Mensaje
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              </div>

              {/* Contact Info & Support Levels */}
              <div className="space-y-6">
                
                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xl font-light mb-4" style={{ color: '#ffffff' }}>Información de Contacto</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
                      <div>
                        <p className="font-light" style={{ color: '#ffffff' }}>Email</p>
                        <p style={{ color: '#a3a3a3' }}>{supportInfo.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
                      <div>
                        <p className="font-light" style={{ color: '#ffffff' }}>Teléfono</p>
                        <p style={{ color: '#a3a3a3' }}>+52 55 1234 5678</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
                      <div>
                        <p className="font-light" style={{ color: '#ffffff' }}>Horario de Atención</p>
                        <p style={{ color: '#a3a3a3' }}>Lun - Vie: 9:00 - 18:00</p>
                        <p style={{ color: '#a3a3a3' }}>Sáb: 10:00 - 14:00</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
                      <div>
                        <p className="font-light" style={{ color: '#ffffff' }}>Ubicación</p>
                        <p style={{ color: '#a3a3a3' }}>Ciudad de México, México</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Support Levels */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xl font-light mb-4" style={{ color: '#ffffff' }}>Niveles de Soporte</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderLeft: '4px solid #ffffff'
                    }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
                        <h4 className="font-light" style={{ color: '#ffffff' }}>Enterprise</h4>
                      </div>
                      <p className="text-sm mb-2" style={{ color: '#a3a3a3' }}>Respuesta: 2-4 horas</p>
                      <p className="text-xs" style={{ color: '#666666' }}>Soporte telefónico, manager dedicado, SLA garantizado</p>
                    </div>
                    
                    <div className="p-4 rounded-lg" style={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderLeft: '4px solid #e5e5e5'
                    }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
                        <h4 className="font-light" style={{ color: '#ffffff' }}>Premium</h4>
                      </div>
                      <p className="text-sm mb-2" style={{ color: '#a3a3a3' }}>Respuesta: 4-8 horas</p>
                      <p className="text-xs" style={{ color: '#666666' }}>Soporte prioritario, chat en vivo</p>
                    </div>
                    
                    <div className="p-4 rounded-lg" style={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderLeft: '4px solid #a3a3a3'
                    }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
                        <h4 className="font-light" style={{ color: '#ffffff' }}>Basic</h4>
                      </div>
                      <p className="text-sm mb-2" style={{ color: '#a3a3a3' }}>Respuesta: 12-24 horas</p>
                      <p className="text-xs" style={{ color: '#666666' }}>Soporte por email en horario laboral</p>
                    </div>
                    
                    <div className="p-4 rounded-lg" style={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderLeft: '4px solid #666666'
                    }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
                        <h4 className="font-light" style={{ color: '#ffffff' }}>Gratis</h4>
                      </div>
                      <p className="text-sm mb-2" style={{ color: '#a3a3a3' }}>Respuesta: 24-48 horas</p>
                      <p className="text-xs" style={{ color: '#666666' }}>Soporte comunitario estándar</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}