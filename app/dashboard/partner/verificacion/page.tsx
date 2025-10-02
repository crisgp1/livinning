// LIVINNING - Partner Verification Page

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
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { PARTNER_VERIFICATION_STATUSES, VERIFICATION_DOCUMENT_TYPES } from '@/lib/utils/constants';

interface VerificationData {
  status: string;
  documents: Record<string, string>;
  bankInfo: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    clabe: string;
  } | null;
  submittedAt: number | null;
  reviewedAt: number | null;
  reviewNotes: string | null;
}

export default function PartnerVerificationPage() {
  const { user: clerkUser } = useUser();
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [documents, setDocuments] = useState<Record<string, string>>({
    identification: '',
    proof_of_address: '',
    bank_statement: '',
    tax_id: '',
    professional_license: '',
    insurance_certificate: '',
  });

  const [bankInfo, setBankInfo] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    clabe: '',
  });

  useEffect(() => {
    fetchVerification();
  }, []);

  const fetchVerification = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/partner/verification');
      const data = await response.json();

      if (data.success) {
        setVerification(data.data);
        if (data.data.documents) {
          setDocuments(data.data.documents);
        }
        if (data.data.bankInfo) {
          setBankInfo(data.data.bankInfo);
        }
      } else {
        toast.error('Error al cargar verificacion');
      }
    } catch (error) {
      console.error('Error fetching verification:', error);
      toast.error('Error al cargar verificacion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!bankInfo.accountHolder || !bankInfo.bankName || !bankInfo.accountNumber) {
      toast.error('Completa la informacion bancaria');
      return;
    }

    if (!documents.identification || !documents.proof_of_address) {
      toast.error('Documentos de identificacion y comprobante de domicilio son requeridos');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/partner/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents, bankInfo }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Verificacion enviada exitosamente');
        fetchVerification();
      } else {
        toast.error(data.error?.message || 'Error al enviar verificacion');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Error al enviar verificacion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_started':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            No Iniciada
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 gap-1">
            <Clock className="h-3 w-3" />
            Pendiente de Revision
          </Badge>
        );
      case 'in_review':
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 gap-1">
            <AlertCircle className="h-3 w-3" />
            En Revision
          </Badge>
        );
      case 'verified':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600 gap-1">
            <CheckCircle className="h-3 w-3" />
            Verificado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rechazada
          </Badge>
        );
      case 'resubmit_required':
        return (
          <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 gap-1">
            <AlertCircle className="h-3 w-3" />
            Requiere Reenvio
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const canEdit = !verification || ['not_started', 'rejected', 'resubmit_required'].includes(verification.status);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Verificacion de Partner
            </h1>
            <p className="text-neutral-600 mt-1">
              Completa tu verificacion para empezar a recibir ordenes de servicio
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Estado de Verificacion</CardTitle>
                  <CardDescription>
                    Estado actual de tu solicitud de verificacion
                  </CardDescription>
                </div>
                {verification && getStatusBadge(verification.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {verification?.status === 'verified' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Verificacion Completada</p>
                      <p className="text-sm text-green-700 mt-1">
                        Tu cuenta ha sido verificada. Ahora puedes recibir ordenes de servicio.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {verification?.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900">Revision Pendiente</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Tu solicitud esta siendo revisada por nuestro equipo. Te notificaremos pronto.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {verification?.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">Verificacion Rechazada</p>
                      {verification.reviewNotes && (
                        <p className="text-sm text-red-700 mt-1">
                          Razon: {verification.reviewNotes}
                        </p>
                      )}
                      <p className="text-sm text-red-700 mt-1">
                        Por favor corrige los problemas y vuelve a enviar.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {verification?.status === 'resubmit_required' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900">Se Requiere Reenvio</p>
                      {verification.reviewNotes && (
                        <p className="text-sm text-orange-700 mt-1">
                          Razon: {verification.reviewNotes}
                        </p>
                      )}
                      <p className="text-sm text-orange-700 mt-1">
                        Por favor actualiza tu informacion y vuelve a enviar.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {verification?.submittedAt && (
                <div className="text-sm text-muted-foreground">
                  Enviado: {new Date(verification.submittedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}

              {verification?.reviewedAt && (
                <div className="text-sm text-muted-foreground">
                  Revisado: {new Date(verification.reviewedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informacion Bancaria</CardTitle>
              <CardDescription>
                Proporciona tu informacion bancaria para recibir pagos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountHolder">Titular de la Cuenta *</Label>
                  <Input
                    id="accountHolder"
                    value={bankInfo.accountHolder}
                    onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
                    disabled={!canEdit}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">Banco *</Label>
                  <Input
                    id="bankName"
                    value={bankInfo.bankName}
                    onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                    disabled={!canEdit}
                    placeholder="Nombre del banco"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Numero de Cuenta *</Label>
                  <Input
                    id="accountNumber"
                    value={bankInfo.accountNumber}
                    onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                    disabled={!canEdit}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <Label htmlFor="clabe">CLABE</Label>
                  <Input
                    id="clabe"
                    value={bankInfo.clabe}
                    onChange={(e) => setBankInfo({ ...bankInfo, clabe: e.target.value })}
                    disabled={!canEdit}
                    placeholder="18 digitos"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos de Verificacion</CardTitle>
              <CardDescription>
                Proporciona URLs de tus documentos (almacenados en tu servicio preferido)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="identification">Identificacion Oficial * (URL)</Label>
                  <Input
                    id="identification"
                    value={documents.identification}
                    onChange={(e) => setDocuments({ ...documents, identification: e.target.value })}
                    disabled={!canEdit}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="proof_of_address">Comprobante de Domicilio * (URL)</Label>
                  <Input
                    id="proof_of_address"
                    value={documents.proof_of_address}
                    onChange={(e) => setDocuments({ ...documents, proof_of_address: e.target.value })}
                    disabled={!canEdit}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="bank_statement">Estado de Cuenta Bancario (URL)</Label>
                  <Input
                    id="bank_statement"
                    value={documents.bank_statement}
                    onChange={(e) => setDocuments({ ...documents, bank_statement: e.target.value })}
                    disabled={!canEdit}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="tax_id">RFC / Tax ID (URL)</Label>
                  <Input
                    id="tax_id"
                    value={documents.tax_id}
                    onChange={(e) => setDocuments({ ...documents, tax_id: e.target.value })}
                    disabled={!canEdit}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="professional_license">Licencia Profesional (URL)</Label>
                  <Input
                    id="professional_license"
                    value={documents.professional_license}
                    onChange={(e) => setDocuments({ ...documents, professional_license: e.target.value })}
                    disabled={!canEdit}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_certificate">Certificado de Seguro (URL)</Label>
                  <Input
                    id="insurance_certificate"
                    value={documents.insurance_certificate}
                    onChange={(e) => setDocuments({ ...documents, insurance_certificate: e.target.value })}
                    disabled={!canEdit}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {canEdit && (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar Verificacion
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Importante</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Los documentos deben ser claros y legibles
                </li>
                <li className="flex gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  La informacion bancaria debe coincidir con tu identificacion
                </li>
                <li className="flex gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  El proceso de verificacion puede tomar 2-3 dias habiles
                </li>
                <li className="flex gap-2">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Sube tus documentos a un servicio como Google Drive o Dropbox y comparte el link
                </li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
