// LIVINNING - Admin Credit Requests Page

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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Loader2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { CreditRequestsTable } from '@/components/credits/credit-requests-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreditRequest {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  amount: number;
  reason: string;
  justification: string;
  status: string;
  createdAt: number;
  reviewedAt?: number;
  reviewedByName?: string;
  reviewNotes?: string;
  counterOfferAmount?: number;
}

export default function AdminCreditRequestsPage() {
  const { user: clerkUser } = useUser();
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const userRole = (clerkUser?.publicMetadata?.role as string)?.toUpperCase();
  const isSuperAdmin = userRole === 'SUPERADMIN';

  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [expireDays, setExpireDays] = useState('');
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const url = statusFilter === 'all'
        ? '/api/admin/credit-requests'
        : `/api/admin/credit-requests?status=${statusFilter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data.requests);
      } else {
        toast.error('Error al cargar solicitudes');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Error al cargar solicitudes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = (request: CreditRequest) => {
    setSelectedRequest(request);
    setReviewStatus(request.status === 'pending' ? '' : request.status);
    setReviewNotes(request.reviewNotes || '');
    setCounterOfferAmount(request.counterOfferAmount?.toString() || '');
    setReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewStatus || !['approved', 'rejected', 'counter_offer'].includes(reviewStatus)) {
      toast.error('Selecciona una decision valida');
      return;
    }

    if (reviewStatus === 'counter_offer' && (!counterOfferAmount || parseFloat(counterOfferAmount) <= 0)) {
      toast.error('Ingresa un monto valido para la contraoferta');
      return;
    }

    if (!selectedRequest) return;

    try {
      setSubmittingReview(true);
      const response = await fetch(`/api/admin/credit-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewStatus,
          reviewNotes,
          expiresInDays: expireDays ? parseInt(expireDays) : undefined,
          counterOfferAmount: reviewStatus === 'counter_offer' ? parseFloat(counterOfferAmount) : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        let successMsg = 'Solicitud procesada';
        if (reviewStatus === 'approved') successMsg = 'Credito aprobado';
        else if (reviewStatus === 'rejected') successMsg = 'Solicitud rechazada';
        else if (reviewStatus === 'counter_offer') successMsg = 'Contraoferta enviada';

        toast.success(successMsg);
        setReviewDialog(false);
        setSelectedRequest(null);
        setReviewStatus('');
        setReviewNotes('');
        setExpireDays('');
        setCounterOfferAmount('');
        fetchRequests();
      } else {
        toast.error(data.error?.message || 'Error al procesar solicitud');
      }
    } catch (error) {
      toast.error('Error al procesar solicitud');
    } finally {
      setSubmittingReview(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Solicitudes de Credito
            </h1>
            <p className="text-neutral-600 mt-1">
              Revisar y aprobar solicitudes de credito de partners
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Solicitudes</CardDescription>
            <CardTitle className="text-3xl">{requests.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Procesadas</CardDescription>
            <CardTitle className="text-3xl">{requests.length - pendingCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Solicitudes</CardTitle>
              <CardDescription>
                Todas las solicitudes de credito
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <CreditRequestsTable requests={requests} onReview={handleReview} />
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Revisar Solicitud de Credito</DialogTitle>
            <DialogDescription>
              {selectedRequest?.partnerName} - ${selectedRequest?.amount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div>
                  <p className="font-semibold text-sm">Partner:</p>
                  <p className="text-sm">{selectedRequest.partnerName}</p>
                  <p className="text-xs text-muted-foreground">{selectedRequest.partnerEmail}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm">Monto Solicitado:</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedRequest.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm">Razon:</p>
                  <p className="text-sm">{selectedRequest.reason}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm">Justificacion:</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.justification}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm">Fecha de Solicitud:</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedRequest.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <>
                  <div>
                    <Label htmlFor="reviewStatus">Decision</Label>
                    <Select value={reviewStatus} onValueChange={setReviewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una decision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Aprobar</SelectItem>
                        {isSuperAdmin && (
                          <SelectItem value="counter_offer">Contraoferta</SelectItem>
                        )}
                        <SelectItem value="rejected">Rechazar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {reviewStatus === 'counter_offer' && (
                    <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                      <Label htmlFor="counterOfferAmount" className="text-blue-900">
                        Monto de Contraoferta ($)
                      </Label>
                      <Input
                        id="counterOfferAmount"
                        type="number"
                        value={counterOfferAmount}
                        onChange={(e) => setCounterOfferAmount(e.target.value)}
                        placeholder="Ingresa el monto ajustado"
                        className="mt-2"
                      />
                      <p className="text-xs text-blue-700 mt-2">
                        Monto original solicitado: ${selectedRequest?.amount.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {(reviewStatus === 'approved' || reviewStatus === 'counter_offer') && (
                    <div>
                      <Label htmlFor="expireDays">Dias para Expirar (opcional)</Label>
                      <Input
                        id="expireDays"
                        type="number"
                        value={expireDays}
                        onChange={(e) => setExpireDays(e.target.value)}
                        placeholder="Dejar vacio para sin expiracion"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="reviewNotes">Notas de Revision</Label>
                    <Textarea
                      id="reviewNotes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Agrega notas sobre tu decision..."
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="w-full"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      'Enviar Decision'
                    )}
                  </Button>
                </>
              )}

              {selectedRequest.status !== 'pending' && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="font-semibold text-sm mb-2">Esta solicitud ya fue revisada</p>
                  {selectedRequest.status === 'counter_offer' && selectedRequest.counterOfferAmount && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-700 font-semibold mb-1">Contraoferta:</p>
                      <div className="flex items-center gap-3">
                        <div className="text-lg text-gray-400 line-through">
                          ${selectedRequest.amount.toLocaleString()}
                        </div>
                        <span className="text-blue-600">→</span>
                        <div className="text-2xl font-bold text-blue-600">
                          ${selectedRequest.counterOfferAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedRequest.reviewNotes && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground">Notas:</p>
                      <p className="text-sm">{selectedRequest.reviewNotes}</p>
                    </div>
                  )}
                  {selectedRequest.reviewedByName && (
                    <p className="text-xs text-muted-foreground">
                      Revisado por: {selectedRequest.reviewedByName}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
