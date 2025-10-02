// ============================================
// LIVINNING - Moderación de Propiedades (ADMIN/HELPDESK)
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  FileSearch,
} from 'lucide-react';
import { toast } from 'sonner';
import { Property, Report } from '@/types';
import { PropertyModerationDialog } from '@/components/properties/property-moderation-dialog';
import { ReportsTable } from '@/components/reports/reports-table';
import { ReportReviewDialog } from '@/components/reports/report-review-dialog';

/**
 * Página de Moderación de Propiedades
 * Solo accesible para SUPERADMIN, ADMIN y HELPDESK
 */
export default function PropertyModerationPage() {
  const { user } = useUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [moderationDialogOpen, setModerationDialogOpen] = useState(false);
  const [reportReviewDialogOpen, setReportReviewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('properties');

  const userRole = (user?.publicMetadata?.role as string)?.toUpperCase();
  const canModerate =
    userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'HELPDESK';

  useEffect(() => {
    if (canModerate) {
      if (activeTab === 'properties') {
        fetchProperties();
      } else {
        fetchReports();
      }
    }
  }, [page, statusFilter, reportStatusFilter, canModerate, activeTab]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
      });

      const response = await fetch(`/api/admin/properties/pending-moderation?${params}`);
      const data = await response.json();

      if (data.success) {
        setProperties(data.data.properties || []);
        setTotal(data.data.total || 0);
      } else {
        toast.error('Error al cargar propiedades');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Error al cargar propiedades');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: reportStatusFilter,
      });

      const response = await fetch(`/api/reports?${params}`);
      const data = await response.json();

      if (data.success) {
        setReports(data.data.reports || []);
        setReportsTotal(data.data.total || 0);
      } else {
        toast.error('Error al cargar reportes');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error al cargar reportes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModeration = (property: Property) => {
    setSelectedProperty(property);
    setModerationDialogOpen(true);
  };

  const handleModerated = () => {
    fetchProperties();
    setSelectedProperty(null);
  };

  const handleOpenReportReview = (report: Report) => {
    setSelectedReport(report);
    setReportReviewDialogOpen(true);
  };

  const handleReportReviewed = () => {
    fetchReports();
    setSelectedReport(null);
  };

  if (!canModerate) {
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
        <h1 className="text-3xl font-bold tracking-tight">Moderación</h1>
        <p className="text-muted-foreground mt-2">
          Revisa propiedades y reportes de la plataforma
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setPage(1); }}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="properties">Propiedades</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        {/* Tab de Propiedades */}
        <TabsContent value="properties" className="space-y-6 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Propiedades</CardDescription>
                <CardTitle className="text-3xl">{total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Página Actual</CardDescription>
                <CardTitle className="text-3xl">{page}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Mostrando</CardDescription>
                <CardTitle className="text-3xl">{properties.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filtros</CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Propiedades</SelectItem>
                    <SelectItem value="pending">Pendientes de Moderación</SelectItem>
                    <SelectItem value="needs_correction">Necesitan Corrección</SelectItem>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="rejected">Rechazadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileSearch className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No hay propiedades con el filtro seleccionado
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propiedad</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {property.images && property.images.length > 0 && (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{property.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {property.propertyType}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{property.ownerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {property.ownerType}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      ${property.price.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{property.city}</p>
                    <p className="text-xs text-muted-foreground">{property.state}</p>
                  </TableCell>
                  <TableCell>
                    {property.status === 'active' ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activa
                      </Badge>
                    ) : property.status === 'rejected' ? (
                      <Badge variant="outline" className="bg-red-100 text-red-700">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rechazada
                      </Badge>
                    ) : property.moderationStatus === 'needs_correction' ? (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Necesita Corrección
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        Pendiente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(property.createdAt!).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModeration(property)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Revisar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, total)} de {total}{' '}
                propiedades
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 20 >= total}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab de Reportes */}
        <TabsContent value="reports" className="space-y-6 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Reportes</CardDescription>
                <CardTitle className="text-3xl">{reportsTotal}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Página Actual</CardDescription>
                <CardTitle className="text-3xl">{page}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Mostrando</CardDescription>
                <CardTitle className="text-3xl">{reports.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filtros</CardTitle>
                <Select value={reportStatusFilter} onValueChange={setReportStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Reportes</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="reviewing">En Revisión</SelectItem>
                    <SelectItem value="resolved">Resueltos</SelectItem>
                    <SelectItem value="dismissed">Descartados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>

          {/* Reports Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileSearch className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  No hay reportes con el filtro seleccionado
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <ReportsTable reports={reports} onReview={handleOpenReportReview} />
            </Card>
          )}

          {/* Pagination */}
          {reportsTotal > 20 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, reportsTotal)} de{' '}
                {reportsTotal} reportes
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 20 >= reportsTotal}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Moderation Dialog */}
      <PropertyModerationDialog
        property={selectedProperty}
        open={moderationDialogOpen}
        onOpenChange={setModerationDialogOpen}
        onModerated={handleModerated}
      />

      {/* Report Review Dialog */}
      <ReportReviewDialog
        report={selectedReport}
        open={reportReviewDialogOpen}
        onOpenChange={setReportReviewDialogOpen}
        onReviewed={handleReportReviewed}
      />
    </div>
  );
}
