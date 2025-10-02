// ============================================
// LIVINNING - Formulario de Verificación de Agencia
// ============================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  MapPin,
  User,
  Briefcase,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AgencyVerificationFormData,
  SPECIALIZATION_OPTIONS,
  DocumentType,
  DOCUMENT_TYPE_LABELS,
} from '@/types/verification';

const STEPS = [
  { id: 1, title: 'Información Básica', icon: Building2 },
  { id: 2, title: 'Dirección', icon: MapPin },
  { id: 3, title: 'Representante Legal', icon: User },
  { id: 4, title: 'Información del Negocio', icon: Briefcase },
  { id: 5, title: 'Documentos', icon: Upload },
];

interface VerificationFormProps {
  userId: string;
  userEmail: string;
}

/**
 * Formulario de verificación de agencia multi-paso
 * Principio de Responsabilidad Única: Solo maneja el formulario de verificación
 */
export function VerificationForm({ userId, userEmail }: VerificationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AgencyVerificationFormData>({
    companyName: '',
    legalName: '',
    taxId: '',
    foundedYear: '',
    street: '',
    exteriorNumber: '',
    interiorNumber: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'México',
    legalRepresentativeName: '',
    legalRepresentativeRole: '',
    legalRepresentativeEmail: userEmail,
    legalRepresentativePhone: '',
    numberOfAgents: '',
    yearsOfExperience: '',
    propertiesManaged: '',
    specializations: [],
    serviceAreas: [],
  });

  const [documents, setDocuments] = useState<Record<DocumentType, File | null>>({
    company_registration: null,
    tax_id: null,
    proof_of_address: null,
    official_id: null,
    power_of_attorney: null,
  });

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDocumentUpload = (type: DocumentType, file: File | null) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // TODO: Subir documentos a servicio de almacenamiento (Cloudinary, S3, etc.)
      // Por ahora, simulamos URLs
      const documentUrls: any = {};
      Object.entries(documents).forEach(([type, file]) => {
        if (file) {
          documentUrls[type] = {
            type,
            url: `https://storage.example.com/${type}/${file.name}`,
            fileName: file.name,
            uploadedAt: new Date(),
          };
        }
      });

      const verificationData = {
        ...formData,
        foundedYear: parseInt(formData.foundedYear),
        numberOfAgents: parseInt(formData.numberOfAgents),
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        propertiesManaged: parseInt(formData.propertiesManaged),
        documents: Object.values(documentUrls),
      };

      const response = await fetch('/api/agency/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Solicitud de verificación enviada exitosamente');
        router.push('/dashboard/agency?verification=submitted');
        router.refresh();
      } else {
        toast.error(data.error?.message || 'Error al enviar verificación');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar verificación');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} setFormData={setFormData} />;
      case 2:
        return <Step2Address formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step3LegalRep formData={formData} setFormData={setFormData} />;
      case 4:
        return <Step4BusinessInfo formData={formData} setFormData={setFormData} />;
      case 5:
        return <Step5Documents documents={documents} onDocumentUpload={handleDocumentUpload} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-700">
            Paso {currentStep} de {STEPS.length}
          </span>
          <span className="text-neutral-500">{Math.round(progress)}% completado</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2
                  ${isCompleted ? 'bg-primary border-primary text-white' : ''}
                  ${isCurrent ? 'border-primary text-primary' : ''}
                  ${!isCompleted && !isCurrent ? 'border-neutral-300 text-neutral-400' : ''}
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-16 h-0.5 ${
                    isCompleted ? 'bg-primary' : 'bg-neutral-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(STEPS[currentStep - 1].icon, {
              className: 'h-5 w-5 text-primary',
            })}
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            Completa la información requerida para verificar tu agencia
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        {currentStep < STEPS.length ? (
          <Button onClick={handleNext} disabled={isLoading}>
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading} className="btn-primary">
            {isLoading ? 'Enviando...' : 'Enviar Verificación'}
          </Button>
        )}
      </div>
    </div>
  );
}

// Step 1: Información Básica
function Step1BasicInfo({
  formData,
  setFormData,
}: {
  formData: AgencyVerificationFormData;
  setFormData: (data: AgencyVerificationFormData) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Nombre Comercial *</Label>
        <Input
          id="companyName"
          placeholder="Ej: Inmobiliaria Premium"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="legalName">Razón Social *</Label>
        <Input
          id="legalName"
          placeholder="Ej: Premium Real Estate S.A. de C.V."
          value={formData.legalName}
          onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taxId">RFC *</Label>
          <Input
            id="taxId"
            placeholder="PRE123456AB1"
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="foundedYear">Año de Fundación *</Label>
          <Input
            id="foundedYear"
            type="number"
            placeholder="2020"
            value={formData.foundedYear}
            onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  );
}

// Step 2: Dirección
function Step2Address({
  formData,
  setFormData,
}: {
  formData: AgencyVerificationFormData;
  setFormData: (data: AgencyVerificationFormData) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="street">Calle *</Label>
          <Input
            id="street"
            placeholder="Av. Reforma"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exteriorNumber">Número Ext. *</Label>
          <Input
            id="exteriorNumber"
            placeholder="123"
            value={formData.exteriorNumber}
            onChange={(e) => setFormData({ ...formData, exteriorNumber: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="interiorNumber">Número Int.</Label>
          <Input
            id="interiorNumber"
            placeholder="Piso 5"
            value={formData.interiorNumber || ''}
            onChange={(e) => setFormData({ ...formData, interiorNumber: e.target.value })}
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="neighborhood">Colonia *</Label>
          <Input
            id="neighborhood"
            placeholder="Polanco"
            value={formData.neighborhood}
            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad *</Label>
          <Input
            id="city"
            placeholder="CDMX"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado *</Label>
          <Input
            id="state"
            placeholder="Ciudad de México"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zipCode">Código Postal *</Label>
          <Input
            id="zipCode"
            placeholder="11560"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">País *</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  );
}

// Step 3: Representante Legal
function Step3LegalRep({
  formData,
  setFormData,
}: {
  formData: AgencyVerificationFormData;
  setFormData: (data: AgencyVerificationFormData) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="legalRepresentativeName">Nombre Completo *</Label>
        <Input
          id="legalRepresentativeName"
          placeholder="Juan Pérez García"
          value={formData.legalRepresentativeName}
          onChange={(e) =>
            setFormData({ ...formData, legalRepresentativeName: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="legalRepresentativeRole">Cargo *</Label>
        <Input
          id="legalRepresentativeRole"
          placeholder="Director General"
          value={formData.legalRepresentativeRole}
          onChange={(e) =>
            setFormData({ ...formData, legalRepresentativeRole: e.target.value })
          }
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="legalRepresentativeEmail">Email *</Label>
          <Input
            id="legalRepresentativeEmail"
            type="email"
            placeholder="juan@inmobiliaria.com"
            value={formData.legalRepresentativeEmail}
            onChange={(e) =>
              setFormData({ ...formData, legalRepresentativeEmail: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="legalRepresentativePhone">Teléfono *</Label>
          <Input
            id="legalRepresentativePhone"
            type="tel"
            placeholder="5512345678"
            value={formData.legalRepresentativePhone}
            onChange={(e) =>
              setFormData({ ...formData, legalRepresentativePhone: e.target.value })
            }
            required
          />
        </div>
      </div>
    </div>
  );
}

// Step 4: Información del Negocio
function Step4BusinessInfo({
  formData,
  setFormData,
}: {
  formData: AgencyVerificationFormData;
  setFormData: (data: AgencyVerificationFormData) => void;
}) {
  const handleSpecializationToggle = (value: string) => {
    const current = formData.specializations || [];
    if (current.includes(value)) {
      setFormData({ ...formData, specializations: current.filter(s => s !== value) });
    } else {
      setFormData({ ...formData, specializations: [...current, value] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numberOfAgents">Número de Agentes *</Label>
          <Input
            id="numberOfAgents"
            type="number"
            placeholder="10"
            value={formData.numberOfAgents}
            onChange={(e) => setFormData({ ...formData, numberOfAgents: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">Años de Experiencia *</Label>
          <Input
            id="yearsOfExperience"
            type="number"
            placeholder="5"
            value={formData.yearsOfExperience}
            onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertiesManaged">Propiedades Gestionadas *</Label>
          <Input
            id="propertiesManaged"
            type="number"
            placeholder="100"
            value={formData.propertiesManaged}
            onChange={(e) => setFormData({ ...formData, propertiesManaged: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Especializaciones *</Label>
        <div className="grid grid-cols-2 gap-2">
          {SPECIALIZATION_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={formData.specializations?.includes(option.value)}
                onCheckedChange={() => handleSpecializationToggle(option.value)}
              />
              <label htmlFor={option.value} className="text-sm cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceAreas">Áreas de Servicio *</Label>
        <Textarea
          id="serviceAreas"
          placeholder="Ej: Ciudad de México, Estado de México, Guadalajara"
          rows={3}
          value={formData.serviceAreas?.join(', ')}
          onChange={(e) =>
            setFormData({
              ...formData,
              serviceAreas: e.target.value.split(',').map(s => s.trim()),
            })
          }
          required
        />
        <p className="text-xs text-muted-foreground">Separa las ciudades/estados con comas</p>
      </div>
    </div>
  );
}

// Step 5: Documentos
function Step5Documents({
  documents,
  onDocumentUpload,
}: {
  documents: Record<DocumentType, File | null>;
  onDocumentUpload: (type: DocumentType, file: File | null) => void;
}) {
  const requiredDocs: DocumentType[] = [
    'company_registration',
    'tax_id',
    'proof_of_address',
    'official_id',
  ];
  const optionalDocs: DocumentType[] = ['power_of_attorney'];

  return (
    <div className="space-y-6">
      {/* Documentos Requeridos */}
      <div className="space-y-4">
        <h3 className="font-semibold text-neutral-900">Documentos Requeridos</h3>
        {requiredDocs.map((docType) => (
          <div key={docType} className="space-y-2">
            <Label htmlFor={docType}>{DOCUMENT_TYPE_LABELS[docType]} *</Label>
            <Input
              id={docType}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => onDocumentUpload(docType, e.target.files?.[0] || null)}
            />
            {documents[docType] && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {documents[docType]?.name}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Documentos Opcionales */}
      <div className="space-y-4">
        <h3 className="font-semibold text-neutral-900">Documentos Opcionales</h3>
        {optionalDocs.map((docType) => (
          <div key={docType} className="space-y-2">
            <Label htmlFor={docType}>{DOCUMENT_TYPE_LABELS[docType]}</Label>
            <Input
              id={docType}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => onDocumentUpload(docType, e.target.files?.[0] || null)}
            />
            {documents[docType] && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {documents[docType]?.name}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <FileText className="h-4 w-4 inline mr-2" />
          Los documentos deben estar en formato PDF, JPG o PNG. Tamaño máximo: 5MB por archivo.
        </p>
      </div>
    </div>
  );
}
