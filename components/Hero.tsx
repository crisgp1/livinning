'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Home, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'sell'>('buy')

  return (
    <section className="relative pt-20 pb-12 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-300 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl"></div>
      </div>
      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
          >
            Encuentra tu hogar ideal
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 mb-8"
          >
            Millones de propiedades en las mejores ubicaciones de México
          </motion.p>

          {/* Search Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => setActiveTab('buy')}
                className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
                  activeTab === 'buy' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Comprar
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
                  activeTab === 'rent' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Rentar
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
                  activeTab === 'sell' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Vender
              </button>
            </div>
          </motion.div>

          {/* Search Bar with Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-3xl mx-auto glass-icon-container rounded-2xl p-6"
          >
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Ciudad, colonia o código postal"
                  className="input w-full pl-12 pr-4"
                />
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              <div className="flex gap-3">
                <div className="relative">
                  <select className="input pr-10 pl-4 appearance-none cursor-pointer">
                    <option>Precio</option>
                    <option>$0 - $500K</option>
                    <option>$500K - $1M</option>
                    <option>$1M - $2M</option>
                    <option>$2M+</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select className="input pr-10 pl-4 appearance-none cursor-pointer">
                    <option>Tipo</option>
                    <option>Casa</option>
                    <option>Departamento</option>
                    <option>Terreno</option>
                    <option>Local</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <Link href="/propiedades" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                  <Search size={20} />
                  <span className="hidden sm:inline">Buscar</span>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="text-gray-600">Búsquedas populares:</span>
              <Link href="/propiedades?location=cdmx" className="text-primary hover:underline">
                Ciudad de México
              </Link>
              <Link href="/propiedades?location=guadalajara" className="text-primary hover:underline">
                Guadalajara
              </Link>
              <Link href="/propiedades?location=monterrey" className="text-primary hover:underline">
                Monterrey
              </Link>
              <Link href="/propiedades?location=playa-del-carmen" className="text-primary hover:underline">
                Playa del Carmen
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Feature Stats with Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          <div className="text-center p-6 glass rounded-xl glass-hover">
            <div className="text-3xl font-bold text-primary">10K+</div>
            <div className="text-gray-600 mt-1">Propiedades activas</div>
          </div>
          <div className="text-center p-6 glass rounded-xl glass-hover">
            <div className="text-3xl font-bold text-primary">5K+</div>
            <div className="text-gray-600 mt-1">Propiedades vendidas</div>
          </div>
          <div className="text-center p-6 glass rounded-xl glass-hover">
            <div className="text-3xl font-bold text-primary">1K+</div>
            <div className="text-gray-600 mt-1">Agentes verificados</div>
          </div>
          <div className="text-center p-6 glass rounded-xl glass-hover">
            <div className="text-3xl font-bold text-primary">50+</div>
            <div className="text-gray-600 mt-1">Ciudades</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}