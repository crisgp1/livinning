// ============================================
// LIVINNING - Partner Details Dialog Component
// ============================================

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { SERVICE_TYPES, SERVICE_ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/utils/constants';
import { ClipboardList, DollarSign, CheckCircle, Loader2, MessageSquare, Phone, Calendar, Settings, Trash2, Plus, ShieldCheck, ExternalLink } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { OnlineStatus } from '@/components/ui/online-status';

interface PartnerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: any;
  partnerDetails: any;
  loading: boolean;
  isSuperAdmin: boolean;
  userRole?: string;
  onRefresh?: () => void;
}

export function PartnerDetailsDialog({
  open,
  onOpenChange,
  partner,
  partnerDetails,
  loading,
  isSuperAdmin,
  userRole = 'HELPDESK',
  onRefresh,
}: PartnerDetailsDialogProps) {
  // Permisos basados en roles
  const canSendMessage = ['SUPERADMIN', 'ADMIN', 'HELPDESK'].includes(userRole);
  const canManageServices = ['SUPERADMIN', 'ADMIN'].includes(userRole);
  const canDeleteServices = userRole === 'SUPERADMIN';
  const canAddContactNotes = ['SUPERADMIN', 'ADMIN', 'HELPDESK'].includes(userRole);

  // Calcular ancho dinámico basado en datos
  const hasMultipleOrders = (partnerDetails?.orderHistory?.length || 0) > 3;
  const hasMultipleServices = (partner?.servicesOffered?.length || 0) > 4;
  const hasContactHistory = (partnerDetails?.contactHistory?.length || 0) > 0;
  const hasCalendarData = (partnerDetails?.bookedDates?.length || 0) > 0 || (partnerDetails?.availableDates?.length || 0) > 0;
  const hasRichData = hasMultipleOrders || hasMultipleServices || hasContactHistory || hasCalendarData;

  const modalWidth = hasRichData ? '!max-w-7xl' : '!max-w-4xl';

  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const [contactNote, setContactNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const [removeServiceDialog, setRemoveServiceDialog] = useState(false);
  const [serviceToRemove, setServiceToRemove] = useState<string | null>(null);
  const [removingService, setRemovingService] = useState(false);

  const [addServiceDialog, setAddServiceDialog] = useState(false);
  const [serviceToAdd, setServiceToAdd] = useState<string>('');
  const [addingService, setAddingService] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);

  const [closeConversationDialog, setCloseConversationDialog] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [closingConversation, setClosingConversation] = useState(false);

  const [grantCreditDialog, setGrantCreditDialog] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [creditExpireDays, setCreditExpireDays] = useState('');
  const [grantingCredit, setGrantingCredit] = useState(false);

  const [verificationDialog, setVerificationDialog] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [loadingVerification, setLoadingVerification] = useState(false);
  const [updatingVerification, setUpdatingVerification] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendAudioRef = useRef<HTMLAudioElement | null>(null);
  const notifyAudioRef = useRef<HTMLAudioElement | null>(null);
  const prevMessageCountRef = useRef<number>(0);

  // Inicializar sonidos
  useEffect(() => {
    sendAudioRef.current = new Audio('/sound/sended.mp3');
    notifyAudioRef.current = new Audio('/sound/notify.mp3');
  }, []);

  // Actualizar actividad del admin cada 30 segundos
  useEffect(() => {
    const updateActivity = async () => {
      try {
        await fetch('/api/user/activity', { method: 'POST' });
      } catch (error) {
        console.log('Error updating activity:', error);
      }
    };

    updateActivity();
    const interval = setInterval(updateActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-actualizar mensajes cada 3 segundos cuando el diálogo está abierto
  useEffect(() => {
    if (messageDialogOpen && partner && onRefresh) {
      const interval = setInterval(() => {
        onRefresh();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [messageDialogOpen, partner, onRefresh]);

  // Detectar nuevos mensajes y reproducir sonido
  useEffect(() => {
    if (messageDialogOpen && partnerDetails?.messageHistory) {
      const currentCount = partnerDetails.messageHistory.length;

      // Si hay más mensajes que antes
      if (currentCount > prevMessageCountRef.current && prevMessageCountRef.current > 0) {
        // Verificar si el último mensaje es del partner (no del admin)
        const lastMessage = partnerDetails.messageHistory[currentCount - 1];
        if (!lastMessage.sentByAdmin) {
          notifyAudioRef.current?.play().catch(e => console.log('Audio play failed:', e));
        }
      }

      prevMessageCountRef.current = currentCount;
      setTimeout(scrollToBottom, 100);
    }
  }, [messageDialogOpen, partnerDetails?.messageHistory]);

  if (!partner) return null;

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Escribe un mensaje');
      return;
    }

    setSendingMessage(true);
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (data.success) {
        // Reproducir sonido de envío
        sendAudioRef.current?.play().catch(e => console.log('Audio play failed:', e));

        toast.success('Mensaje enviado');
        setMessage('');

        // Refrescar datos del partner para mostrar el nuevo mensaje
        if (onRefresh) {
          setTimeout(() => {
            onRefresh();
            setTimeout(scrollToBottom, 200);
          }, 100);
        }
      } else {
        toast.error(data.error?.message || 'Error al enviar mensaje');
      }
    } catch (error) {
      toast.error('Error al enviar mensaje');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSaveContactNote = async () => {
    if (!contactNote.trim()) {
      toast.error('Escribe una nota de contacto');
      return;
    }

    setSavingNote(true);
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: contactNote }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Nota guardada exitosamente');
        setContactNote('');
      } else {
        toast.error(data.error?.message || 'Error al guardar nota');
      }
    } catch (error) {
      toast.error('Error al guardar nota');
    } finally {
      setSavingNote(false);
    }
  };

  const handleRemoveService = async () => {
    if (!serviceToRemove) return;

    setRemovingService(true);
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}/services`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: serviceToRemove }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Servicio eliminado exitosamente');
        setRemoveServiceDialog(false);
        setServiceToRemove(null);
        // Refresh partner data
        window.location.reload();
      } else {
        toast.error(data.error?.message || 'Error al eliminar servicio');
      }
    } catch (error) {
      toast.error('Error al eliminar servicio');
    } finally {
      setRemovingService(false);
    }
  };

  const handleAddService = async () => {
    if (!serviceToAdd) {
      toast.error('Selecciona un servicio');
      return;
    }

    setAddingService(true);
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: serviceToAdd }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Servicio agregado exitosamente');
        setAddServiceDialog(false);
        setServiceToAdd('');
        window.location.reload();
      } else {
        toast.error(data.error?.message || 'Error al agregar servicio');
      }
    } catch (error) {
      toast.error('Error al agregar servicio');
    } finally {
      setAddingService(false);
    }
  };

  const handleCloseConversation = async () => {
    setClosingConversation(true);
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: closeReason }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Conversacion cerrada exitosamente');
        setCloseConversationDialog(false);
        setCloseReason('');
        setMessageDialogOpen(false);
      } else {
        toast.error(data.error?.message || 'Error al cerrar conversacion');
      }
    } catch (error) {
      toast.error('Error al cerrar conversacion');
    } finally {
      setClosingConversation(false);
    }
  };

  const handleGrantCredit = async () => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      toast.error('Ingresa un monto valido');
      return;
    }

    if (!creditReason) {
      toast.error('Ingresa la razon del credito');
      return;
    }

    setGrantingCredit(true);
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(creditAmount),
          reason: creditReason,
          expiresInDays: creditExpireDays ? parseInt(creditExpireDays) : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Credito otorgado exitosamente');
        setGrantCreditDialog(false);
        setCreditAmount('');
        setCreditReason('');
        setCreditExpireDays('');
      } else {
        toast.error(data.error?.message || 'Error al otorgar credito');
      }
    } catch (error) {
      toast.error('Error al otorgar credito');
    } finally {
      setGrantingCredit(false);
    }
  };

  const fetchVerification = async () => {
    if (!partner?.id) return;

    setLoadingVerification(true);
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}/verification`);
      const data = await response.json();

      if (data.success) {
        setVerificationData(data.data);
        setVerificationStatus(data.data.status);
      } else {
        toast.error('Error al cargar verificacion');
      }
    } catch (error) {
      console.error('Error fetching verification:', error);
      toast.error('Error al cargar verificacion');
    } finally {
      setLoadingVerification(false);
    }
  };

  const handleUpdateVerification = async () => {
    if (!verificationStatus) {
      toast.error('Selecciona un estado');
      return;
    }

    setUpdatingVerification(true);
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}/verification`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: verificationStatus,
          reviewNotes: verificationNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Verificacion actualizada exitosamente');
        setVerificationDialog(false);
        await fetchVerification();
      } else {
        toast.error(data.error?.message || 'Error al actualizar verificacion');
      }
    } catch (error) {
      toast.error('Error al actualizar verificacion');
    } finally {
      setUpdatingVerification(false);
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Badge variant="secondary">No Iniciada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'in_review':
        return <Badge className="bg-blue-500">En Revision</Badge>;
      case 'verified':
        return <Badge className="bg-green-500">Verificado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazada</Badge>;
      case 'resubmit_required':
        return <Badge className="bg-orange-500">Requiere Reenvio</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={`${modalWidth} w-full max-h-[90vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>Detalles del Partner</DialogTitle>
            <DialogDescription>
              {partner.name} - {partner.email}
            </DialogDescription>
          </DialogHeader>

          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            {canSendMessage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessageDialogOpen(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar Mensaje
              </Button>
            )}
            {partner.email && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`tel:${partner.email}`, '_blank')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalendarDialog(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Ver Calendario
            </Button>
            {canManageServices && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddServiceDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Servicio
              </Button>
            )}
            {isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGrantCreditDialog(true)}
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Otorgar Credito
              </Button>
            )}
            {canManageServices && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setVerificationDialog(true);
                  await fetchVerification();
                }}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Verificacion
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                <TabsTrigger value="services">Servicios</TabsTrigger>
                <TabsTrigger value="orders">Historial</TabsTrigger>
                <TabsTrigger value="calendar">Calendario</TabsTrigger>
                <TabsTrigger value="contact">Contacto</TabsTrigger>
              </TabsList>

            <TabsContent value="stats" className="space-y-4 py-4">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Órdenes</CardDescription>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-muted-foreground" />
                      {partnerDetails?.stats?.totalOrders || 0}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Completadas</CardDescription>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      {partnerDetails?.stats?.completedOrders || 0}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Ganancias</CardDescription>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      ${(partnerDetails?.stats?.totalEarnings || 0).toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Tasa de Completación</CardDescription>
                    <CardTitle className="text-2xl">
                      {partnerDetails?.stats?.completionRate || 0}%
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {partner.isSuspended && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-600">Partner Suspendido</CardTitle>
                    <CardDescription className="text-red-600">
                      {partner.suspensionReason || 'Sin razón especificada'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="services" className="space-y-4 py-4">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
                {partner.servicesOffered && partner.servicesOffered.length > 0 ? (
                  partner.servicesOffered.map((service: string, i: number) => (
                    <Card key={i} className="relative">
                      <CardHeader className="py-3 pr-10">
                        <CardTitle className="text-sm">
                          {SERVICE_TYPES[service as keyof typeof SERVICE_TYPES] || service}
                        </CardTitle>
                      </CardHeader>
                      {canDeleteServices && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setServiceToRemove(service);
                            setRemoveServiceDialog(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-2 text-center py-4">
                    Sin servicios registrados
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Órdenes</CardTitle>
                  <CardDescription>
                    Últimas {isSuperAdmin ? 20 : 10} órdenes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {partnerDetails?.orderHistory && partnerDetails.orderHistory.length > 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
                      {partnerDetails.orderHistory.map((order: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{order.orderNumber}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {order.customerName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {SERVICE_TYPES[order.serviceType as keyof typeof SERVICE_TYPES]}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="font-semibold whitespace-nowrap">${order.amount.toLocaleString()}</div>
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              {SERVICE_ORDER_STATUSES[order.status as keyof typeof SERVICE_ORDER_STATUSES]}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sin órdenes registradas
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Disponibilidad del Partner</CardTitle>
                  <CardDescription>
                    Visualiza los días disponibles y ocupados
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      booked: partnerDetails?.bookedDates || [],
                      available: partnerDetails?.availableDates || [],
                    }}
                    modifiersClassNames={{
                      booked: 'bg-red-100 text-red-900',
                      available: 'bg-green-100 text-green-900',
                    }}
                  />
                  <div className="mt-4 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 border rounded"></div>
                      <span className="text-sm text-muted-foreground">Días disponibles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border rounded"></div>
                      <span className="text-sm text-muted-foreground">Días ocupados</span>
                    </div>
                  </div>
                  {selectedDate && (
                    <div className="mt-4 p-3 border rounded-lg w-full">
                      <p className="text-sm font-medium">
                        Fecha seleccionada: {selectedDate.toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notas de Contacto</CardTitle>
                  <CardDescription>
                    Registra tus comunicaciones con el partner
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {canAddContactNotes ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Escribe una nota sobre el contacto con este partner..."
                        value={contactNote}
                        onChange={(e) => setContactNote(e.target.value)}
                        rows={4}
                      />
                      <Button
                        onClick={handleSaveContactNote}
                        disabled={savingNote || !contactNote.trim()}
                      >
                        {savingNote ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar Nota'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No tienes permisos para agregar notas de contacto
                    </p>
                  )}

                  {partnerDetails?.contactHistory && partnerDetails.contactHistory.length > 0 ? (
                    <div className="space-y-2 mt-4">
                      <h4 className="font-medium text-sm">Historial de Contacto</h4>
                      <div className="space-y-2">
                        {partnerDetails.contactHistory.map((contact: any, i: number) => (
                          <div key={i} className="p-3 border rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">
                              {new Date(contact.createdAt).toLocaleString()} - {contact.createdBy}
                            </div>
                            <div className="text-sm">{contact.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No hay historial de contacto registrado
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>

    {/* Message Dialog - WhatsApp Style */}
    <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
      <DialogContent className="!max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-lg font-semibold text-purple-600">
                {partner?.name?.charAt(0) || 'P'}
              </span>
              <OnlineStatus
                lastActivity={partnerDetails?.lastActivity}
                showText={false}
                className="absolute bottom-0 right-0 ring-2 ring-white"
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{partner?.name}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-normal">
                  {partner?.email}
                </span>
                <OnlineStatus lastActivity={partnerDetails?.lastActivity} />
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50 space-y-3">
          {partnerDetails?.conversationClosed ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Conversacion cerrada</p>
                <p className="text-xs">Esta conversacion ha sido finalizada</p>
              </div>
            </div>
          ) : partnerDetails?.messageHistory && partnerDetails.messageHistory.length > 0 ? (
            <>
              {partnerDetails.messageHistory.map((msg: any, i: number) => (
                <div
                  key={i}
                  className={`flex ${msg.sentByAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.sentByAdmin
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sentByAdmin ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay mensajes aún</p>
                <p className="text-xs">Inicia la conversación con {partner?.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {!partnerDetails?.conversationClosed && (
          <div className="border-t px-4 py-3 bg-white">
            <div className="flex gap-2">
              <Textarea
                placeholder="Escribe un mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (message.trim()) {
                      handleSendMessage();
                    }
                  }
                }}
                rows={2}
                className="flex-1 resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={sendingMessage || !message.trim()}
                size="icon"
                className="h-auto px-4"
              >
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Presiona Enter para enviar, Shift+Enter para nueva linea
              </p>
              {canSendMessage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCloseConversationDialog(true)}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Cerrar conversacion
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Add Service Dialog */}
    <Dialog open={addServiceDialog} onOpenChange={setAddServiceDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Servicio</DialogTitle>
          <DialogDescription>
            Agregar un nuevo servicio a {partner?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={serviceToAdd} onValueChange={setServiceToAdd}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un servicio" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SERVICE_TYPES).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setAddServiceDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddService} disabled={addingService || !serviceToAdd}>
              {addingService ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Agregando...
                </>
              ) : (
                'Agregar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Remove Service Confirmation */}
    <AlertDialog open={removeServiceDialog} onOpenChange={setRemoveServiceDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar el servicio{' '}
            <strong>{serviceToRemove && SERVICE_TYPES[serviceToRemove as keyof typeof SERVICE_TYPES]}</strong>{' '}
            del partner {partner?.name}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleRemoveService} disabled={removingService}>
            {removingService ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Grant Credit Dialog */}
    <Dialog open={grantCreditDialog} onOpenChange={setGrantCreditDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Otorgar Credito</DialogTitle>
          <DialogDescription>
            Otorgar credito a {partner?.name} por buen desempeno
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto del Credito ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="1000"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Razon</Label>
            <Textarea
              id="reason"
              placeholder="Excelente desempeno en ordenes completadas"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expire">Expira en (dias, opcional)</Label>
            <Input
              id="expire"
              type="number"
              placeholder="30"
              value={creditExpireDays}
              onChange={(e) => setCreditExpireDays(e.target.value)}
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              Dejar vacio si no expira
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setGrantCreditDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGrantCredit}
            disabled={grantingCredit}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {grantingCredit ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Otorgando...
              </>
            ) : (
              'Otorgar Credito'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Close Conversation Dialog */}
    <AlertDialog open={closeConversationDialog} onOpenChange={setCloseConversationDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cerrar conversacion?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta accion marcara la conversacion como finalizada. Puedes agregar una nota opcional.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Razon del cierre (opcional)"
            value={closeReason}
            onChange={(e) => setCloseReason(e.target.value)}
            rows={3}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCloseConversation}
            disabled={closingConversation}
            className="bg-red-600 hover:bg-red-700"
          >
            {closingConversation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cerrando...
              </>
            ) : (
              'Cerrar conversacion'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Calendar Dialog (Alternative fullscreen view) */}
    <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
      <DialogContent className="!max-w-2xl">
        <DialogHeader>
          <DialogTitle>Calendario - {partner?.name}</DialogTitle>
          <DialogDescription>
            Gestiona la disponibilidad del partner
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              booked: partnerDetails?.bookedDates || [],
              available: partnerDetails?.availableDates || [],
            }}
            modifiersClassNames={{
              booked: 'bg-red-100 text-red-900',
              available: 'bg-green-100 text-green-900',
            }}
          />
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border rounded"></div>
              <span className="text-sm text-muted-foreground">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border rounded"></div>
              <span className="text-sm text-muted-foreground">Ocupado</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Verification Dialog */}
    <Dialog open={verificationDialog} onOpenChange={setVerificationDialog}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verificacion de Partner</DialogTitle>
          <DialogDescription>
            Revisa y actualiza el estado de verificacion de {partner?.name}
          </DialogDescription>
        </DialogHeader>

        {loadingVerification ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Estado Actual</Label>
              {verificationData && getVerificationBadge(verificationData.status)}
            </div>

            {verificationData?.status !== 'not_started' && (
              <>
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Informacion Bancaria</h3>
                  {verificationData?.bankInfo ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Titular:</span>
                        <p className="font-medium">{verificationData.bankInfo.accountHolder}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Banco:</span>
                        <p className="font-medium">{verificationData.bankInfo.bankName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cuenta:</span>
                        <p className="font-medium">{verificationData.bankInfo.accountNumber}</p>
                      </div>
                      {verificationData.bankInfo.clabe && (
                        <div>
                          <span className="text-muted-foreground">CLABE:</span>
                          <p className="font-medium">{verificationData.bankInfo.clabe}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No proporcionada</p>
                  )}
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Documentos</h3>
                  {verificationData?.documents && Object.keys(verificationData.documents).length > 0 ? (
                    <div className="space-y-2">
                      {verificationData.documents.identification && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Identificacion Oficial</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(verificationData.documents.identification, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {verificationData.documents.proof_of_address && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Comprobante de Domicilio</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(verificationData.documents.proof_of_address, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {verificationData.documents.bank_statement && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Estado de Cuenta</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(verificationData.documents.bank_statement, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {verificationData.documents.tax_id && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">RFC / Tax ID</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(verificationData.documents.tax_id, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {verificationData.documents.professional_license && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Licencia Profesional</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(verificationData.documents.professional_license, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {verificationData.documents.insurance_certificate && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Certificado de Seguro</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(verificationData.documents.insurance_certificate, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay documentos</p>
                  )}
                </div>

                {verificationData?.submittedAt && (
                  <div className="text-sm text-muted-foreground">
                    Enviado: {new Date(verificationData.submittedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}

                {verificationData?.reviewedAt && (
                  <div className="text-sm text-muted-foreground">
                    Revisado: {new Date(verificationData.reviewedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}

                {verificationData?.reviewNotes && (
                  <div className="border rounded-lg p-4">
                    <Label>Notas de Revision Anteriores</Label>
                    <p className="text-sm mt-2">{verificationData.reviewNotes}</p>
                  </div>
                )}

                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label htmlFor="verificationStatus">Actualizar Estado</Label>
                    <Select value={verificationStatus} onValueChange={setVerificationStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_review">En Revision</SelectItem>
                        <SelectItem value="verified">Verificado</SelectItem>
                        <SelectItem value="rejected">Rechazada</SelectItem>
                        <SelectItem value="resubmit_required">Requiere Reenvio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="verificationNotes">Notas de Revision</Label>
                    <Textarea
                      id="verificationNotes"
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="Agrega notas sobre la revision..."
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleUpdateVerification}
                    disabled={updatingVerification}
                    className="w-full"
                  >
                    {updatingVerification ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Verificacion'
                    )}
                  </Button>
                </div>
              </>
            )}

            {verificationData?.status === 'not_started' && (
              <div className="text-center py-8 text-muted-foreground">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>El partner aun no ha iniciado su verificacion</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  </>
  );
}
