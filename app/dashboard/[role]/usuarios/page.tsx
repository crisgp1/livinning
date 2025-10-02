// ============================================
// LIVINNING - Gestión de Usuarios (SUPERADMIN/ADMIN/HELPDESK)
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Users,
  MoreVertical,
  Ban,
  CheckCircle,
  Bell,
  Loader2,
  Search,
  Shield,
  History,
  Clock,
  AlertTriangle,
  Info,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt: number;
  lastSignInAt?: number;
  isSuspended: boolean;
  suspensionReason?: string;
  propertyCount: number;
}

/**
 * Página de Gestión de Usuarios
 * Principio de Responsabilidad Única: Solo gestiona visualización y acciones de usuarios
 */
export default function UsersManagementPage() {
  const { user: clerkUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Dialogs
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [suspensionReason, setSuspensionReason] = useState('');
  const [notificationData, setNotificationData] = useState({
    type: 'warning',
    title: '',
    message: '',
    severity: 'medium',
  });
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  const userRole = (clerkUser?.publicMetadata?.role as string)?.toUpperCase();
  const canSuspend = userRole === 'SUPERADMIN' || userRole === 'ADMIN';
  const canNotify = userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'HELPDESK';

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  useEffect(() => {
    if (notifyDialogOpen && selectedUser) {
      fetchNotificationHistory();
    }
  }, [notifyDialogOpen, selectedUser]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(roleFilter && roleFilter !== 'ALL' && { role: roleFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setTotal(data.data.total);
      } else {
        toast.error('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotificationHistory = async () => {
    if (!selectedUser) return;

    try {
      setLoadingHistory(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}/notifications`);
      const data = await response.json();

      if (data.success) {
        setNotificationHistory(data.data.notifications || []);
      } else {
        console.error('Error loading notification history');
      }
    } catch (error) {
      console.error('Error fetching notification history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUser || !suspensionReason.trim()) {
      toast.error('La razón de suspensión es requerida');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/suspend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: suspensionReason }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Usuario suspendido exitosamente');
        setSuspendDialogOpen(false);
        setSuspensionReason('');
        fetchUsers();
      } else {
        toast.error(data.error?.message || 'Error al suspender usuario');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Error al suspender usuario');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivateUser = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/activate`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Usuario activado exitosamente');
        setActivateDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(data.error?.message || 'Error al activar usuario');
      }
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('Error al activar usuario');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedUser || !notificationData.title || !notificationData.message) {
      toast.error('Título y mensaje son requeridos');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Notificación enviada exitosamente');
        setNotifyDialogOpen(false);
        setNotificationData({
          type: 'warning',
          title: '',
          message: '',
          severity: 'medium',
        });
      } else {
        toast.error(data.error?.message || 'Error al enviar notificación');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Error al enviar notificación');
    } finally {
      setIsProcessing(false);
    }
  };

  const roleLabels: Record<string, { label: string; color: string }> = {
    USER: { label: 'Usuario', color: 'bg-blue-100 text-blue-700' },
    AGENCY: { label: 'Agencia', color: 'bg-purple-100 text-purple-700' },
    HELPDESK: { label: 'Soporte', color: 'bg-cyan-100 text-cyan-700' },
    ADMIN: { label: 'Admin', color: 'bg-orange-100 text-orange-700' },
    SUPERADMIN: { label: 'SuperAdmin', color: 'bg-red-100 text-red-700' },
    PARTNER: { label: 'Socio', color: 'bg-green-100 text-green-700' },
  };

  const notificationTypes = [
    { value: 'warning', label: 'Advertencia' },
    { value: 'violation', label: 'Violación' },
    { value: 'suspension', label: 'Suspensión' },
    { value: 'info', label: 'Información' },
  ];

  const severities = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'critical', label: 'Crítica' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Gestión de Usuarios</h1>
            <p className="text-neutral-600 mt-1">
              {total} usuario{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los roles</SelectItem>
            <SelectItem value="USER">Usuario</SelectItem>
            <SelectItem value="AGENCY">Agencia</SelectItem>
            <SelectItem value="HELPDESK">Soporte</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="SUPERADMIN">SuperAdmin</SelectItem>
            <SelectItem value="PARTNER">Socio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Propiedades</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.avatar && (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-neutral-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleLabels[user.role]?.color || 'bg-gray-100'}>
                      {roleLabels[user.role]?.label || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.propertyCount}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    {user.isSuspended ? (
                      <Badge variant="destructive">Suspendido</Badge>
                    ) : (
                      <Badge variant="default">Activo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {canNotify && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setNotifyDialogOpen(true);
                            }}
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Enviar notificación
                          </DropdownMenuItem>
                        )}
                        {canSuspend && (
                          <>
                            {user.isSuspended ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setActivateDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activar cuenta
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSuspendDialogOpen(true);
                                }}
                                disabled={user.role === 'SUPERADMIN'}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Suspender cuenta
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Suspend Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Suspender cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de suspender la cuenta de <strong>{selectedUser?.name}</strong>.
              El usuario no podrá acceder al sistema hasta que se reactive su cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="reason">Razón de la suspensión *</Label>
            <Textarea
              id="reason"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="Explica la razón de la suspensión..."
              className="mt-2"
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <Button
              onClick={handleSuspendUser}
              disabled={isProcessing || !suspensionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suspendiendo...
                </>
              ) : (
                'Suspender'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate Dialog */}
      <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Activar cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de activar la cuenta de <strong>{selectedUser?.name}</strong>.
              El usuario podrá volver a acceder al sistema.
              {selectedUser?.suspensionReason && (
                <>
                  <br /><br />
                  <strong>Razón de suspensión original:</strong> {selectedUser.suspensionReason}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <Button onClick={handleActivateUser} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Activando...
                </>
              ) : (
                'Activar'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notify Dialog */}
      <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Gestión de Notificaciones</DialogTitle>
            <DialogDescription>
              Usuario: <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="send" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="send">
                <Bell className="h-4 w-4 mr-2" />
                Enviar Notificación
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                Historial ({notificationHistory.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de notificación</Label>
                <Select
                  value={notificationData.type}
                  onValueChange={(value) =>
                    setNotificationData({ ...notificationData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severidad</Label>
                <Select
                  value={notificationData.severity}
                  onValueChange={(value) =>
                    setNotificationData({ ...notificationData, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {severities.map((sev) => (
                      <SelectItem key={sev.value} value={sev.value}>
                        {sev.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={notificationData.title}
                onChange={(e) =>
                  setNotificationData({ ...notificationData, title: e.target.value })
                }
                placeholder="Ej: Advertencia por violación de términos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje *</Label>
              <Textarea
                id="message"
                value={notificationData.message}
                onChange={(e) =>
                  setNotificationData({ ...notificationData, message: e.target.value })
                }
                placeholder="Escribe el mensaje de la notificación..."
                rows={6}
              />
            </div>
            <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNotifyDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendNotification}
              disabled={isProcessing || !notificationData.title || !notificationData.message}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
            </TabsContent>

            <TabsContent value="history" className="py-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : notificationHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No hay notificaciones previas para este usuario
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {notificationHistory.map((notification: any) => {
                      const typeConfig = {
                        warning: { icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
                        violation: { icon: XCircle, color: 'text-orange-600 bg-orange-50 border-orange-200' },
                        suspension: { icon: Ban, color: 'text-red-600 bg-red-50 border-red-200' },
                        info: { icon: Info, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                      }[notification.type] || { icon: Bell, color: 'text-gray-600 bg-gray-50 border-gray-200' };

                      const severityBadge = {
                        low: 'bg-green-100 text-green-700 border-green-300',
                        medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                        high: 'bg-orange-100 text-orange-700 border-orange-300',
                        critical: 'bg-red-100 text-red-700 border-red-300',
                      }[notification.severity] || 'bg-gray-100 text-gray-700';

                      const TypeIcon = typeConfig.icon;

                      return (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border ${typeConfig.color}`}
                        >
                          <div className="flex items-start gap-3">
                            <TypeIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-semibold text-sm">{notification.title}</h4>
                                <Badge variant="outline" className={`${severityBadge} text-xs`}>
                                  {notification.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm opacity-90">{notification.message}</p>
                              <div className="flex items-center gap-4 text-xs opacity-75 pt-2 border-t border-current/10">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  {notification.createdByName}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
