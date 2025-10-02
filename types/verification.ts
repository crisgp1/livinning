// ============================================
// LIVINNING - Tipos para Verificación de Agencias
// ============================================

export type VerificationStatus = 'pending' | 'in_review' | 'verified' | 'rejected';

export type DocumentType =
  | 'company_registration' // Acta constitutiva
  | 'tax_id' // RFC
  | 'proof_of_address' // Comprobante de domicilio
  | 'official_id' // Identificación oficial del representante
  | 'power_of_attorney'; // Poder notarial (opcional)

export interface VerificationDocument {
  type: DocumentType;
  url: string;
  fileName: string;
  uploadedAt: Date;
}

export interface AgencyVerificationData {
  // Información de la empresa
  companyName: string;
  legalName: string;
  taxId: string; // RFC
  foundedYear: number;

  // Dirección
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Representante legal
  legalRepresentativeName: string;
  legalRepresentativeRole: string;
  legalRepresentativeEmail: string;
  legalRepresentativePhone: string;

  // Información del negocio
  numberOfAgents: number;
  yearsOfExperience: number;
  propertiesManaged: number;
  specializations: string[]; // residential, commercial, luxury, etc.
  serviceAreas: string[]; // Ciudades/estados donde operan

  // Documentos
  documents: VerificationDocument[];

  // Estado
  status: VerificationStatus;
  submittedAt?: Date;
  reviewedAt?: Date;
  verifiedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;

  // Notas del revisor (ADMIN/SUPERADMIN)
  reviewerNotes?: string;
  reviewedBy?: string; // User ID del admin que revisó
}

export interface AgencyVerificationFormData {
  // Paso 1: Información básica
  companyName: string;
  legalName: string;
  taxId: string;
  foundedYear: string;

  // Paso 2: Dirección
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Paso 3: Representante legal
  legalRepresentativeName: string;
  legalRepresentativeRole: string;
  legalRepresentativeEmail: string;
  legalRepresentativePhone: string;

  // Paso 4: Información del negocio
  numberOfAgents: string;
  yearsOfExperience: string;
  propertiesManaged: string;
  specializations: string[];
  serviceAreas: string[];
}

export const SPECIALIZATION_OPTIONS = [
  { value: 'residential', label: 'Residencial' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'luxury', label: 'Lujo' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'land', label: 'Terrenos' },
  { value: 'vacation', label: 'Vacacional' },
];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  company_registration: 'Acta Constitutiva',
  tax_id: 'RFC (Constancia de Situación Fiscal)',
  proof_of_address: 'Comprobante de Domicilio',
  official_id: 'Identificación Oficial del Representante',
  power_of_attorney: 'Poder Notarial (Opcional)',
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: 'Pendiente de enviar',
  in_review: 'En revisión',
  verified: 'Verificada',
  rejected: 'Rechazada',
};
