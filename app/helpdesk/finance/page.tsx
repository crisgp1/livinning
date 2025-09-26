'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building,
  Search,
  Filter,
  Download,
  Eye,
  Plus
} from 'lucide-react'

interface FinanceStats {
  totalRevenue: number
  totalExpenses: number
  providerPayments: number
  pendingPayments: number
}

interface ProviderPayment {
  id: string
  providerName: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  serviceType: string
}

export default function FinancePage() {
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    providerPayments: 0,
    pendingPayments: 0
  })
  const [payments, setPayments] = useState<ProviderPayment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    // Simulate API call for finance data
    setStats({
      totalRevenue: 125000,
      totalExpenses: 87500,
      providerPayments: 32500,
      pendingPayments: 15000
    })

    setPayments([
      {
        id: '1',
        providerName: 'Servicios de Limpieza Pro',
        amount: 2500,
        dueDate: '2024-01-15',
        status: 'pending',
        serviceType: 'Limpieza'
      },
      {
        id: '2',
        providerName: 'Mantenimiento Total',
        amount: 4800,
        dueDate: '2024-01-10',
        status: 'overdue',
        serviceType: 'Mantenimiento'
      },
      {
        id: '3',
        providerName: 'Jardinería Verde',
        amount: 1200,
        dueDate: '2024-01-20',
        status: 'paid',
        serviceType: 'Jardinería'
      }
    ])
  }, [])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado'
      case 'pending': return 'Pendiente'
      case 'overdue': return 'Vencido'
      default: return status
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Finanzas</h1>
        <p className="text-gray-600">Gestión financiera y pagos a proveedores</p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">+12% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${stats.totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">+5% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos a Proveedores</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${stats.providerPayments.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${stats.pendingPayments.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Por pagar</p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Payments Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Pagos a Proveedores</CardTitle>
              <CardDescription>
                Gestión de pagos y seguimiento de proveedores
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Pago
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por proveedor o servicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="paid">Pagados</option>
                <option value="overdue">Vencidos</option>
              </select>
            </div>
          </div>

          {/* Payments Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Proveedor</th>
                  <th className="text-left p-4 font-semibold">Servicio</th>
                  <th className="text-left p-4 font-semibold">Monto</th>
                  <th className="text-left p-4 font-semibold">Fecha Vencimiento</th>
                  <th className="text-left p-4 font-semibold">Estado</th>
                  <th className="text-left p-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{payment.providerName}</td>
                    <td className="p-4">{payment.serviceType}</td>
                    <td className="p-4 font-semibold">${payment.amount.toLocaleString()}</td>
                    <td className="p-4">{new Date(payment.dueDate).toLocaleDateString('es-ES')}</td>
                    <td className="p-4">
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusText(payment.status)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.status !== 'paid' && (
                          <Button size="sm">
                            Pagar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron pagos con los filtros aplicados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}