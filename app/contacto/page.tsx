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
import { useLogger, useUserInteractionLogger, useApiLogger } from '@/hooks/useLogger'

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
  const { logUserAction } = useLogger({ component: 'ContactPage' })
  const { logFormSubmit, logFormChange } = useUserInteractionLogger('ContactPage')
  const { logApiCall } = useApiLogger('ContactPage')
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
    
    logFormSubmit('contact-form', {
      subject: form.subject,
      priority: form.priority,
      userPlan,
      isAgency,
      hasUser: !!user
    })
    
    try {
      const result = await logApiCall('POST', '/api/contact', {
        ...form,
        userPlan,
        isAgency,
        supportEmail: supportInfo.email,
        userId: user?.id
      }, async () => {
        return await fetch('/api/contact', {
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
      })

      if (result && result.ok) {
        setSubmitStatus('success')
        setForm({ name: '', email: '', subject: '', message: '', priority: 'normal' })
        logUserAction('contact-form-success', { priority: form.priority })
        showToast('¡Mensaje enviado correctamente! Te responderemos pronto.', 'success')
      } else {
        setSubmitStatus('error')
        logUserAction('contact-form-error', { status: result?.status })
        showToast('Error al enviar el mensaje. Por favor, inténtalo de nuevo.', 'error')
      }
    } catch (error) {
      setSubmitStatus('error')
      logUserAction('contact-form-exception', { error: error instanceof Error ? error.message : 'Unknown error' })
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
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
      </div>
      
      <main className="pt-20 relative z-10">
        <div className="section-container py-16">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium mb-6 glass-icon-container"
              >
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-gray-700">Soporte y Contacto</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-light mb-4 text-gray-900"
              >
                Contacta con <span className="text-primary font-medium">Nosotros</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
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
                  className="glass-icon-container rounded-2xl p-8"
                >
                  {/* Support Level Badge */}
                  {user && (
                    <div className="flex items-center gap-3 mb-6 p-4 rounded-lg glass">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        {getSupportIcon()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          Soporte {supportInfo.level.charAt(0).toUpperCase() + supportInfo.level.slice(1)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Tiempo de respuesta: {supportInfo.response}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-white">
                          Plan {userPlan}
                        </span>
                      </div>
                    </div>
                  )}

                  <h2 className="text-2xl font-light mb-6 text-gray-900">Enviar Mensaje</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                          placeholder="Tu nombre completo"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Asunto
                        </label>
                        <input
                          type="text"
                          value={form.subject}
                          onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                          placeholder="¿En qué podemos ayudarte?"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Prioridad
                        </label>
                        <select
                          value={form.priority}
                          onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value as any }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        >
                          <option value="low">Baja</option>
                          <option value="normal">Normal</option>
                          <option value="high">Alta</option>
                          {(userPlan === 'premium' || userPlan === 'enterprise') && (
                            <option value="urgent">Urgente</option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Mensaje
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
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
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send size={20} />
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
                  className="glass-icon-container rounded-2xl p-6"
                >
                  <h3 className="text-xl font-light mb-6 text-gray-900">Información de Contacto</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-gray-600">{supportInfo.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Teléfono</p>
                        <p className="text-gray-600">+34 91 123 4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Horario de Atención</p>
                        <p className="text-gray-600">Lun - Vie: 9:00 - 18:00</p>
                        <p className="text-gray-600">Sáb: 10:00 - 14:00</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Ubicación</p>
                        <p className="text-gray-600">Madrid, España</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Support Levels */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-icon-container rounded-2xl p-6"
                >
                  <h3 className="text-xl font-light mb-6 text-gray-900">Niveles de Soporte</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl glass border-l-4 border-l-purple-500">
                      <div className="flex items-center gap-3 mb-2">
                        <Crown className="w-5 h-5 text-purple-600" />
                        <h4 className="font-medium text-gray-900">Enterprise</h4>
                      </div>
                      <p className="text-sm mb-2 text-gray-600">Respuesta: 2-4 horas</p>
                      <p className="text-xs text-gray-500">Soporte telefónico, manager dedicado, SLA garantizado</p>
                    </div>
                    
                    <div className="p-4 rounded-xl glass border-l-4 border-l-blue-500">
                      <div className="flex items-center gap-3 mb-2">
                        <Star className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium text-gray-900">Premium</h4>
                      </div>
                      <p className="text-sm mb-2 text-gray-600">Respuesta: 4-8 horas</p>
                      <p className="text-xs text-gray-500">Soporte prioritario, chat en vivo</p>
                    </div>
                    
                    <div className="p-4 rounded-xl glass border-l-4 border-l-green-500">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <h4 className="font-medium text-gray-900">Basic</h4>
                      </div>
                      <p className="text-sm mb-2 text-gray-600">Respuesta: 12-24 horas</p>
                      <p className="text-xs text-gray-500">Soporte por email en horario laboral</p>
                    </div>
                    
                    <div className="p-4 rounded-xl glass border-l-4 border-l-gray-400">
                      <div className="flex items-center gap-3 mb-2">
                        <MessageCircle className="w-5 h-5 text-gray-600" />
                        <h4 className="font-medium text-gray-900">Gratis</h4>
                      </div>
                      <p className="text-sm mb-2 text-gray-600">Respuesta: 24-48 horas</p>
                      <p className="text-xs text-gray-500">Soporte comunitario estándar</p>
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