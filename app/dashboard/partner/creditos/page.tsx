// LIVINNING - Partner Credits Page

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
import { Coins, Loader2, TrendingUp, DollarSign, Gift, Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CreditsTable } from '@/components/credits/credits-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Credit {
  id: string;
  amount: number;
  reason: string;
  grantedBy: string;
  grantedByName: string;
  createdAt: number;
  used: boolean;
  usedAt?: number;
  expiresAt?: number;
}

interface CreditRequest {
  id: string;
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

export default function PartnerCreditsPage() {
  const { user: clerkUser } = useUser();
  const [credits, setCredits] = useState<Credit[]>([]);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [totalUsed, setTotalUsed] = useState(0);

  const [requestDialog, setRequestDialog] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [requestJustification, setRequestJustification] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchCredits();
    fetchCreditRequests();
  }, []);

  const fetchCredits = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/partner/credits');
      const data = await response.json();

      if (data.success) {
        setCredits(data.data.credits);
        setTotalAvailable(data.data.totalAvailable);
        setTotalUsed(data.data.totalUsed);
      } else {
        toast.error('Error al cargar creditos');
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast.error('Error al cargar creditos');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCreditRequests = async () => {
    try {
      const response = await fetch('/api/partner/credit-request');
      const data = await response.json();

      if (data.success) {
        setCreditRequests(data.data.requests);
      }
    } catch (error) {
      console.error('Error fetching credit requests:', error);
    }
  };

  const handleSubmitRequest = async () => {
    if (!requestAmount || parseFloat(requestAmount) <= 0) {
      toast.error('Ingresa un monto valido');
      return;
    }

    if (!requestReason) {
      toast.error('Ingresa la razon de tu solicitud');
      return;
    }

    if (!requestJustification) {
      toast.error('Ingresa una justificacion detallada');
      return;
    }

    try {
      setSubmittingRequest(true);
      const response = await fetch('/api/partner/credit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(requestAmount),
          reason: requestReason,
          justification: requestJustification,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Solicitud enviada exitosamente');
        setRequestDialog(false);
        setRequestAmount('');
        setRequestReason('');
        setRequestJustification('');
        fetchCreditRequests();
      } else {
        toast.error(data.error?.message || 'Error al enviar solicitud');
      }
    } catch (error) {
      toast.error('Error al enviar solicitud');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 gap-1">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600 gap-1">
            <CheckCircle className="h-3 w-3" />
            Aprobada
          </Badge>
        );
      case 'counter_offer':
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 gap-1">
            <CheckCircle className="h-3 w-3" />
            Contraoferta
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rechazada
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 rounded-lg">
            <Coins className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Mis Creditos
            </h1>
            <p className="text-neutral-600 mt-1">
              Facilidades otorgadas por buen desempeno
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Creditos Disponibles</CardDescription>
              <Gift className="h-4 w-4 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-600">
              ${totalAvailable.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Creditos Usados</CardDescription>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-3xl">
              ${totalUsed.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Recibido</CardDescription>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <CardTitle className="text-3xl">
              ${(totalAvailable + totalUsed).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Request Credit Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-900">Solicitar Credito</CardTitle>
              <CardDescription className="text-blue-700">
                Solicita credito por buen desempeno y confiabilidad
              </CardDescription>
            </div>
            <Button
              onClick={() => setRequestDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Solicitar Credito
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Credit Requests Card */}
      {creditRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mis Solicitudes</CardTitle>
            <CardDescription>
              Historial de solicitudes de credito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {creditRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {request.status === 'counter_offer' && request.counterOfferAmount ? (
                        <div className="flex flex-col">
                          <div className="text-lg font-medium text-gray-400 line-through">
                            ${request.amount.toLocaleString()}
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${request.counterOfferAmount.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-green-600">
                          ${request.amount.toLocaleString()}
                        </div>
                      )}
                      {getRequestStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Razon:</p>
                    <p className="text-sm">{request.reason}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Justificacion:</p>
                    <p className="text-sm text-muted-foreground">{request.justification}</p>
                  </div>
                  {request.reviewNotes && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-semibold text-sm">Notas de Revision:</p>
                      <p className="text-sm text-muted-foreground">{request.reviewNotes}</p>
                      {request.reviewedByName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Revisado por: {request.reviewedByName}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">Que son los creditos?</CardTitle>
          <CardDescription className="text-amber-700">
            Los creditos son facilidades otorgadas por el equipo administrativo a partners de confianza
            con buen historial. Estos creditos pueden ser utilizados para diversos beneficios y servicios
            dentro de la plataforma.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Credits Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Creditos</CardTitle>
              <CardDescription>
                Todos los creditos que has recibido
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <CreditsTable credits={credits} />
          )}
        </CardContent>
      </Card>

      {/* Request Credit Dialog */}
      <Dialog open={requestDialog} onOpenChange={setRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Credito</DialogTitle>
            <DialogDescription>
              Completa el formulario para solicitar un credito
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="requestAmount">Monto Solicitado ($)</Label>
              <Input
                id="requestAmount"
                type="number"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestReason">Razon</Label>
              <Input
                id="requestReason"
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Ej: Expansion de servicios, herramientas, vehiculo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestJustification">Justificacion Detallada</Label>
              <Textarea
                id="requestJustification"
                value={requestJustification}
                onChange={(e) => setRequestJustification(e.target.value)}
                placeholder="Explica por que necesitas este credito y como lo utilizaras..."
                rows={5}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
              <p className="font-semibold">Importante:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Los creditos estan sujetos a revision y aprobacion</li>
                <li>Debes tener buen historial de desempeno</li>
                <li>Proporciona una justificacion clara y detallada</li>
              </ul>
            </div>
          </div>
          <Button
            onClick={handleSubmitRequest}
            disabled={submittingRequest}
            className="w-full"
          >
            {submittingRequest ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Enviar Solicitud
              </>
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
