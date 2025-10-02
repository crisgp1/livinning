// ============================================
// LIVINNING - Monitor de Órdenes (HELPDESK)
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { clerkClient } from '@clerk/nextjs/server';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ClipboardList,
  AlertCircle,
  Clock,
  UserCheck,
  Phone,
  Loader2,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { SERVICE_TYPES } from '@/lib/utils/constants';

interface ServiceOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  address: string;
  city: string;
  state: string;
  partnerId?: string;
  partnerName?: string;
  status: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  scheduledDate?: string;
  helpdeskNotes?: string;
  lastContactedAt?: string;
  createdAt: string;
}

/**
 * Monitor de Órdenes - Vista HELPDESK
 * HELPDESK puede ver todas las órdenes, asignar partners y contactarlos
 */
export default function HelpdeskOrdersPage() {
  const { user: clerkUser } = useUser();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Estado para asignación y contacto
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    fetchPartners();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
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

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/admin/partners');
      const data = await response.json();

      if (data.success) {
        // Filtrar solo partners activos (no suspendidos)
        const activePartners = data.data.partners.filter(
          (p: any) => !p.isSuspended
        );
        setPartners(activePartners);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const handleAssignPartner = async () => {
    if (!selectedOrder || !selectedPartnerId) {
      toast.error('Selecciona un partner');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/service-orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_partner',
          partnerId: selectedPartnerId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Partner asignado exitosamente');
        fetchOrders();
        setDetailsDialogOpen(false);
        setSelectedPartnerId('');
      } else {
        toast.error(data.error?.message || 'Error al asignar partner');
      }
    } catch (error) {
      console.error('Error assigning partner:', error);
      toast.error('Error al asignar partner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleContactPartner = async () => {
    if (!selectedOrder || !contactNotes) {
      toast.error('Agrega notas del contacto');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/service-orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'contact_partner',
          notes: contactNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Contacto registrado');
        fetchOrders();
        setContactNotes('');
      } else {
        toast.error(data.error?.message || 'Error al registrar contacto');
      }
    } catch (error) {
      console.error('Error contacting partner:', error);
      toast.error('Error al registrar contacto');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      pending: { label: 'Pendiente', variant: 'destructive' },
      assigned: { label: 'Asignada', variant: 'default' },
      in_progress: { label: 'En Progreso', variant: 'default' },
      completed: { label: 'Completada', variant: 'outline' },
      cancelled: { label: 'Cancelada', variant: 'secondary' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig: Record<string, { label: string; className: string }> = {
      low: { label: 'Baja', className: 'bg-green-100 text-green-700' },
      medium: { label: 'Media', className: 'bg-yellow-100 text-yellow-700' },
      high: { label: 'Alta', className: 'bg-orange-100 text-orange-700' },
      urgent: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
    };

    const config = urgencyConfig[urgency] || urgencyConfig.medium;

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const assignedOrders = orders.filter((o) => o.status === 'assigned');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <ClipboardList className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Monitor de Órdenes
            </h1>
            <p className="text-neutral-600 mt-1">
              Gestiona y asigna órdenes de servicio a partners
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
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-red-700">Pendientes</CardDescription>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <CardTitle className="text-3xl text-red-600">
              {pendingOrders.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Asignadas</CardDescription>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-3xl">
              {assignedOrders.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Partners Activos</CardDescription>
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
            <CardTitle className="text-3xl">{partners.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Órdenes de Servicio</CardTitle>
              <CardDescription>
                Monitor y asignación de órdenes
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="assigned">Asignadas</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay órdenes para mostrar
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Urgencia</TableHead>
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
                      {SERVICE_TYPES[order.serviceType as keyof typeof SERVICE_TYPES] ||
                        order.serviceType}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {order.city}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.partnerName ? (
                        <div className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3 text-green-600" />
                          <span className="text-sm">{order.partnerName}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-orange-600">
                          Sin asignar
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{getUrgencyBadge(order.urgency)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        Gestionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Management Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestionar Orden</DialogTitle>
            <DialogDescription>{selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Cliente</label>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Servicio</label>
                  <p className="font-medium">
                    {SERVICE_TYPES[selectedOrder.serviceType as keyof typeof SERVICE_TYPES]}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Ubicación</label>
                  <p className="font-medium">
                    {selectedOrder.address}, {selectedOrder.city}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Monto</label>
                  <p className="font-medium">
                    ${selectedOrder.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Assign Partner */}
              {selectedOrder.status === 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Asignar Partner</CardTitle>
                    <CardDescription>
                      Selecciona un partner para esta orden
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select
                      value={selectedPartnerId}
                      onValueChange={setSelectedPartnerId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar partner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map((partner) => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.name} - {partner.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleAssignPartner}
                      disabled={!selectedPartnerId || actionLoading}
                      className="w-full"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Asignando...
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Asignar Partner
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Contact Partner */}
              {selectedOrder.partnerId && selectedOrder.status !== 'completed' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contactar Partner
                    </CardTitle>
                    <CardDescription>
                      Partner asignado: {selectedOrder.partnerName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedOrder.lastContactedAt && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Último contacto:{' '}
                          {new Date(selectedOrder.lastContactedAt).toLocaleString(
                            'es-ES'
                          )}
                        </p>
                        {selectedOrder.helpdeskNotes && (
                          <p className="text-sm text-blue-600 mt-1">
                            Nota: {selectedOrder.helpdeskNotes}
                          </p>
                        )}
                      </div>
                    )}
                    <Textarea
                      value={contactNotes}
                      onChange={(e) => setContactNotes(e.target.value)}
                      placeholder="Notas del contacto con el partner..."
                      rows={3}
                    />
                    <Button
                      onClick={handleContactPartner}
                      disabled={!contactNotes || actionLoading}
                      className="w-full"
                      variant="outline"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <Phone className="h-4 w-4 mr-2" />
                          Registrar Contacto
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
