export const serviceTypeTranslations: Record<string, string> = {
  // Main service types
  cleaning: 'Limpieza',
  maintenance: 'Mantenimiento',
  electrical: 'Eléctrico',
  plumbing: 'Plomería',
  painting: 'Pintura',
  gardening: 'Jardinería',
  carpentry: 'Carpintería',
  photography: 'Fotografía',
  legal: 'Legal',
  
  // Additional service types
  hvac: 'Climatización',
  moving: 'Mudanza',
  security: 'Seguridad',
  pest_control: 'Control de Plagas',
  appliance_repair: 'Reparación de Electrodomésticos',
  locksmith: 'Cerrajería',
  roofing: 'Techado',
  flooring: 'Pisos',
  window_cleaning: 'Limpieza de Ventanas',
  pool_maintenance: 'Mantenimiento de Piscina',
  
  // Specific service names
  'Deep Residential Cleaning': 'Limpieza Profunda Residencial',
  'Complete Garden Maintenance': 'Mantenimiento de Jardín Completo',
  'Plumbing Repair': 'Reparación de Plomería',
  'Electrical Installation': 'Instalación Eléctrica',
  'House Painting': 'Pintura de Casa',
  'Office Cleaning': 'Limpieza de Oficinas',
  'Commercial Cleaning': 'Limpieza Comercial',
  'Post-Construction Cleaning': 'Limpieza Post-Construcción',
  'Window Installation': 'Instalación de Ventanas',
  'Fence Installation': 'Instalación de Cercas',
}

export function translateServiceType(serviceType: string): string {
  return serviceTypeTranslations[serviceType] || serviceType
}

export function translateServiceName(serviceName: string): string {
  // Check if there's a direct translation
  if (serviceTypeTranslations[serviceName]) {
    return serviceTypeTranslations[serviceName]
  }
  
  // Try to find partial matches for common patterns
  const lowerName = serviceName.toLowerCase()
  
  if (lowerName.includes('cleaning')) {
    return serviceName.replace(/cleaning/gi, 'Limpieza')
  }
  if (lowerName.includes('maintenance')) {
    return serviceName.replace(/maintenance/gi, 'Mantenimiento')
  }
  if (lowerName.includes('repair')) {
    return serviceName.replace(/repair/gi, 'Reparación')
  }
  if (lowerName.includes('installation')) {
    return serviceName.replace(/installation/gi, 'Instalación')
  }
  if (lowerName.includes('service')) {
    return serviceName.replace(/service/gi, 'Servicio')
  }
  
  return serviceName
}