// ============================================
// LIVINNING - Órdenes de Servicio (Partner)
// ============================================

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Play,
  Upload,
  Loader2,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { SERVICE_TYPES } from '@/lib/utils/constants';

interface ServiceOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  address: string;
  city: string;
  state: string;
  status: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  scheduledDate?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Componente interno con Suspense
 */
function PartnerOrdersContent() {
  const { user: clerkUser } = useUser();
  const searchParams = useSearchParams();
  const statusFilter = searchParams?.get('status') || '';

  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Estado para completar servicio
  const [partnerNotes, setPartnerNotes] = useState('');
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/service-orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
      } else {
        toast.error('Error al cargar órdenes');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar órdenes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartService = async (orderId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/service-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_service',
          beforePhotos,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Servicio iniciado');
        fetchOrders();
        setDetailsDialogOpen(false);
      } else {
        toast.error(data.error?.message || 'Error al iniciar servicio');
      }
    } catch (error) {
      console.error('Error starting service:', error);
      toast.error('Error al iniciar servicio');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteService = async (orderId: string) => {
    if (!partnerNotes || afterPhotos.length === 0) {
      toast.error('Debes agregar notas y fotos del trabajo completado');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/service-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_service',
          partnerNotes,
          afterPhotos,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Servicio completado exitosamente');
        fetchOrders();
        setDetailsDialogOpen(false);
        setPartnerNotes('');
        setAfterPhotos([]);
      } else {
        toast.error(data.error?.message || 'Error al completar servicio');
      }
    } catch (error) {
      console.error('Error completing service:', error);
      toast.error('Error al completar servicio');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      assigned: { label: 'Asignada', variant: 'default', icon: Clock },
      in_progress: { label: 'En Progreso', variant: 'default', icon: Play },
      completed: { label: 'Completada', variant: 'outline', icon: CheckCircle2 },
      cancelled: { label: 'Cancelada', variant: 'destructive', icon: AlertCircle },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary', icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig: Record<string, { label: string; className: string }> = {
      low: { label: 'Baja', className: 'bg-green-100 text-green-700 border-green-300' },
      medium: { label: 'Media', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      high: { label: 'Alta', className: 'bg-orange-100 text-orange-700 border-orange-300' },
      urgent: { label: 'Urgente', className: 'bg-red-100 text-red-700 border-red-300' },
    };

    const config = urgencyConfig[urgency] || urgencyConfig.medium;

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ClipboardList className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Mis Órdenes</h1>
            <p className="text-neutral-600 mt-1">
              Gestiona tus órdenes de servicio
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Órdenes</CardDescription>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{orders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Asignadas</CardDescription>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-3xl">
              {orders.filter((o) => o.status === 'assigned').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>En Progreso</CardDescription>
              <Play className="h-4 w-4 text-orange-600" />
            </div>
            <CardTitle className="text-3xl">
              {orders.filter((o) => o.status === 'in_progress').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Completadas</CardDescription>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <CardTitle className="text-3xl">
              {orders.filter((o) => o.status === 'completed').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Órdenes de Servicio</CardTitle>
          <CardDescription>
            Lista de todas tus órdenes asignadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tienes órdenes asignadas
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Urgencia</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.customerEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {SERVICE_TYPES[order.serviceType as keyof typeof SERVICE_TYPES] || order.serviceType}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {order.city}, {order.state}
                      </div>
                    </TableCell>
                    <TableCell>{getUrgencyBadge(order.urgency)}</TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        ${order.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="service">Servicio</TabsTrigger>
                <TabsTrigger value="actions">Acciones</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nombre:</span>
                      <span className="font-medium">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedOrder.customerEmail}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ubicación del Servicio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{selectedOrder.address}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedOrder.city}, {selectedOrder.state}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pago</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monto:</span>
                      <span className="font-semibold text-lg">
                        ${selectedOrder.amount.toLocaleString()} {selectedOrder.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado del Pago:</span>
                      <Badge variant="outline">
                        {selectedOrder.paymentStatus === 'held' ? 'Retenido' : selectedOrder.paymentStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="service" className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detalles del Servicio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Tipo:</span>
                      <p className="font-medium">
                        {SERVICE_TYPES[selectedOrder.serviceType as keyof typeof SERVICE_TYPES]}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Descripción:</span>
                      <p className="mt-1">{selectedOrder.description}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Urgencia:</span>
                        <div className="mt-1">{getUrgencyBadge(selectedOrder.urgency)}</div>
                      </div>
                      {selectedOrder.scheduledDate && (
                        <div>
                          <span className="text-sm text-muted-foreground">Fecha Programada:</span>
                          <div className="mt-1 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(selectedOrder.scheduledDate).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4 py-4">
                {selectedOrder.status === 'assigned' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Iniciar Servicio</CardTitle>
                      <CardDescription>
                        Acepta la orden y comienza el trabajo
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">
                          Fotos "Antes" (Opcional)
                        </label>
                        <div className="mt-2 flex items-center gap-2">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Sube fotos del estado inicial
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleStartService(selectedOrder.id)}
                        disabled={actionLoading}
                        className="w-full"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Iniciando...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar Servicio
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {selectedOrder.status === 'in_progress' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Completar Servicio</CardTitle>
                      <CardDescription>
                        Marca el servicio como completado
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">
                          Notas del Servicio *
                        </label>
                        <Textarea
                          value={partnerNotes}
                          onChange={(e) => setPartnerNotes(e.target.value)}
                          placeholder="Describe el trabajo realizado..."
                          className="mt-2"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Fotos "Después" *
                        </label>
                        <div className="mt-2 flex items-center gap-2">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Sube fotos del trabajo completado
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCompleteService(selectedOrder.id)}
                        disabled={actionLoading}
                        className="w-full"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Completando...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Marcar como Completado
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {selectedOrder.status === 'completed' && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <CardTitle className="text-green-600">
                          Servicio Completado
                        </CardTitle>
                      </div>
                      <CardDescription className="text-green-700">
                        El pago será liberado una vez que el SUPERADMIN revise el trabajo
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Página de Órdenes de Servicio - Vista Partner
 */
export default function PartnerOrdersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <PartnerOrdersContent />
    </Suspense>
  );
}
