// ============================================
// LIVINNING - Gestión de Partners
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Handshake,
  Loader2,
  ClipboardList,
  CheckCircle,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { PartnersTable } from '@/components/partners/partners-table';
import { PartnerDetailsDialog } from '@/components/partners/partner-details-dialog';

interface Partner {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  servicesOffered: string[];
  createdAt?: number;
  isSuspended: boolean;
  suspensionReason?: string;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalEarnings: number;
  pendingEarnings: number;
}

export default function PartnersPage() {
  const { user: clerkUser } = useUser();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [total, setTotal] = useState(0);

  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [partnerDetails, setPartnerDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const userRole = (clerkUser?.publicMetadata?.role as string)?.toUpperCase();
  const canManagePartners =
    userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'HELPDESK';
  const isSuperAdmin = userRole === 'SUPERADMIN';

  useEffect(() => {
    if (canManagePartners) {
      fetchPartners();
    }
  }, [search, statusFilter, canManagePartners]);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(statusFilter && statusFilter !== 'ALL' && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/partners?${params}`);
      const data = await response.json();

      if (data.success) {
        setPartners(data.data.partners);
        setTotal(data.data.total);
      } else {
        toast.error('Error al cargar partners');
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Error al cargar partners');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPartnerDetails = async (partnerId: string) => {
    try {
      setLoadingDetails(true);
      const response = await fetch(`/api/admin/partners/${partnerId}`);
      const data = await response.json();

      if (data.success) {
        setPartnerDetails(data.data.partner);
      } else {
        toast.error('Error al cargar detalles del partner');
      }
    } catch (error) {
      console.error('Error fetching partner details:', error);
      toast.error('Error al cargar detalles del partner');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = async (partner: Partner) => {
    setSelectedPartner(partner);
    setDetailsDialogOpen(true);
    await fetchPartnerDetails(partner.id);
  };

  const handleRefreshDetails = () => {
    if (selectedPartner) {
      fetchPartnerDetails(selectedPartner.id);
    }
  };

  if (!canManagePartners) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para acceder a esta página
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Handshake className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Gestión de Partners
            </h1>
            <p className="text-neutral-600 mt-1">
              {total} partner{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Partners</CardDescription>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Órdenes Totales</CardDescription>
              <ClipboardList className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-3xl">
              {partners.reduce((sum, p) => sum + (p.totalOrders || 0), 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Completadas</CardDescription>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <CardTitle className="text-3xl">
              {partners.reduce((sum, p) => sum + (p.completedOrders || 0), 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Ganancias</CardDescription>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <CardTitle className="text-3xl">
              ${partners.reduce((sum, p) => sum + (p.totalEarnings || 0), 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Partners Registrados</CardTitle>
              <CardDescription>
                Proveedores de servicio al cliente
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PartnersTable partners={partners} onViewDetails={handleViewDetails} />
          )}
        </CardContent>
      </Card>

      {/* Partner Details Dialog */}
      <PartnerDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        partner={selectedPartner}
        partnerDetails={partnerDetails}
        loading={loadingDetails}
        isSuperAdmin={isSuperAdmin}
        userRole={userRole}
        onRefresh={handleRefreshDetails}
      />
    </div>
  );
}
