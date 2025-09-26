// Client-side compatible property logger that falls back to console on client

// Type definitions for better TypeScript support
interface LogData {
  timestamp?: string;
  level: string;
  message: string;
  propertyId?: string;
  userId?: string;
  action?: string;
  [key: string]: any;
}

// Check if we're running on the server
const isServer = typeof window === 'undefined';

// Create a logger that works on both client and server
const createPropertyLogger = () => {
  if (isServer) {
    // Server-side: Use console logging for now (winston disabled for build compatibility)
    return createConsoleLogger();
  } else {
    // Client-side: Use console with structured logging
    return createConsoleLogger();
  }
};

// Create a console-based logger for client-side
const createConsoleLogger = () => {
  const formatLogData = (level: string, message: string, data?: any): LogData => ({
    timestamp: new Date().toISOString(),
    level,
    message,
    component: isServer ? 'server' : 'client',
    ...data
  });

  return {
    log: (level: string, message: string, data?: any) => {
      const logData = formatLogData(level, message, data);
      const logString = `[${logData.timestamp}] [${logData.level.toUpperCase()}] ${message}`;

      if (level === 'error') {
        console.error(logString, data || '');
      } else if (level === 'warn') {
        console.warn(logString, data || '');
      } else {
        console.log(logString, data || '');
      }
    },
    error: (message: string, data?: any) => {
      const logData = formatLogData('error', message, data);
      console.error(`[${logData.timestamp}] [ERROR] ${message}`, data || '');
    },
    warn: (message: string, data?: any) => {
      const logData = formatLogData('warn', message, data);
      console.warn(`[${logData.timestamp}] [WARN] ${message}`, data || '');
    },
    info: (message: string, data?: any) => {
      const logData = formatLogData('info', message, data);
      console.log(`[${logData.timestamp}] [INFO] ${message}`, data || '');
    }
  };
};

// Create the logger instance
const propertyLogger = createPropertyLogger();

// Property-specific logging methods
export const PropertyLogger = {
  // Property Creation Logging
  logPropertyCreationStart: (userId: string, stepNumber: number, formData?: any) => {
    propertyLogger.log('property_create', 'Property creation started', {
      userId,
      action: 'creation_start',
      stepNumber,
      formData: formData ? {
        propertyType: formData.propertyType,
        hasTitle: !!formData.title,
        hasAddress: !!formData.address?.street,
        hasPrice: !!formData.price?.amount,
        imageCount: formData.images?.length || 0
      } : null
    });
  },

  logPropertyCreationStep: (userId: string, stepNumber: number, stepName: string, formData?: any, validationErrors?: any) => {
    propertyLogger.log('property_create', `Property creation step ${stepNumber}: ${stepName}`, {
      userId,
      action: 'creation_step',
      stepNumber,
      stepName,
      hasValidationErrors: !!validationErrors,
      validationErrors: validationErrors || null,
      formData: formData ? {
        propertyType: formData.propertyType,
        title: formData.title?.substring(0, 50),
        price: formData.price,
        features: formData.features,
        addressCity: formData.address?.city,
        imageCount: formData.images?.length || 0
      } : null
    });
  },

  logPropertyCreationValidation: (userId: string, stepNumber: number, isValid: boolean, errors?: any) => {
    const level = isValid ? 'property_create' : 'warn';
    propertyLogger.log(level, `Property creation validation - Step ${stepNumber}`, {
      userId,
      action: 'validation',
      stepNumber,
      isValid,
      errorCount: errors ? Object.keys(errors).length : 0,
      errors: errors || null
    });
  },

  logPropertyCreationSubmit: (userId: string, formData: any, isSuccess: boolean, error?: any) => {
    const level = isSuccess ? 'property_create' : 'error';
    propertyLogger.log(level, 'Property creation submitted', {
      userId,
      action: 'creation_submit',
      isSuccess,
      error: error || null,
      propertyData: {
        propertyType: formData.propertyType,
        title: formData.title?.substring(0, 50),
        price: formData.price,
        bedrooms: formData.features?.bedrooms,
        bathrooms: formData.features?.bathrooms,
        squareMeters: formData.features?.squareMeters,
        city: formData.address?.city,
        imageCount: formData.images?.length || 0,
        amenitiesCount: formData.features?.amenities?.length || 0
      }
    });
  },

  // Property Editing Logging
  logPropertyEditStart: (userId: string, propertyId: string, originalData?: any) => {
    propertyLogger.log('property_edit', 'Property editing started', {
      userId,
      propertyId,
      action: 'edit_start',
      originalData: originalData ? {
        title: originalData.title?.substring(0, 50),
        status: originalData.status,
        price: originalData.price,
        imageCount: originalData.images?.length || 0
      } : null
    });
  },

  logPropertyFieldChange: (userId: string, propertyId: string, fieldName: string, oldValue: any, newValue: any) => {
    propertyLogger.log('property_edit', `Property field changed: ${fieldName}`, {
      userId,
      propertyId,
      action: 'field_change',
      fieldName,
      oldValue: typeof oldValue === 'string' ? oldValue.substring(0, 100) : oldValue,
      newValue: typeof newValue === 'string' ? newValue.substring(0, 100) : newValue,
      hasChange: oldValue !== newValue
    });
  },

  logPropertyImageUpload: (userId: string, propertyId: string, uploadCount: number, isSuccess: boolean, error?: any) => {
    const level = isSuccess ? 'property_edit' : 'error';
    propertyLogger.log(level, 'Property images uploaded', {
      userId,
      propertyId,
      action: 'image_upload',
      uploadCount,
      isSuccess,
      error: error || null
    });
  },

  logPropertySave: (userId: string, propertyId: string, changedFields: string[], isSuccess: boolean, error?: any) => {
    const level = isSuccess ? 'property_edit' : 'error';
    propertyLogger.log(level, 'Property saved', {
      userId,
      propertyId,
      action: 'save',
      changedFields,
      changeCount: changedFields.length,
      isSuccess,
      error: error || null
    });
  },

  logPropertyStatusChange: (userId: string, propertyId: string, oldStatus: string, newStatus: string, isSuccess: boolean, error?: any) => {
    const level = isSuccess ? 'property_edit' : 'error';
    propertyLogger.log(level, 'Property status changed', {
      userId,
      propertyId,
      action: 'status_change',
      oldStatus,
      newStatus,
      isSuccess,
      error: error || null
    });
  },

  // Property Viewing Logging
  logPropertyView: (propertyId: string, userId?: string, userAgent?: string, referrer?: string) => {
    propertyLogger.log('property_view', 'Property viewed', {
      propertyId,
      userId: userId || 'anonymous',
      action: 'view',
      userAgent: userAgent?.substring(0, 200),
      referrer: referrer?.substring(0, 200),
      viewTimestamp: new Date().toISOString()
    });
  },

  logPropertyGalleryInteraction: (propertyId: string, userId: string, interactionType: string, imageIndex?: number) => {
    propertyLogger.log('property_view', 'Property gallery interaction', {
      propertyId,
      userId,
      action: 'gallery_interaction',
      interactionType, // 'open', 'close', 'next', 'prev', 'click_image'
      imageIndex
    });
  },

  logPropertyFavoriteToggle: (propertyId: string, userId: string, isFavorite: boolean, isSuccess: boolean, error?: any) => {
    const level = isSuccess ? 'property_view' : 'error';
    propertyLogger.log(level, 'Property favorite toggled', {
      propertyId,
      userId,
      action: 'favorite_toggle',
      isFavorite,
      isSuccess,
      error: error || null
    });
  },

  logPropertyContactForm: (propertyId: string, userId: string, formData: any, isSuccess: boolean, error?: any) => {
    const level = isSuccess ? 'property_view' : 'error';
    propertyLogger.log(level, 'Property contact form submitted', {
      propertyId,
      userId,
      action: 'contact_form',
      hasName: !!formData.name,
      hasEmail: !!formData.email,
      hasPhone: !!formData.phone,
      hasMessage: !!formData.message,
      isSuccess,
      error: error || null
    });
  },

  // General Property Actions
  logPropertySearch: (searchParams: any, resultCount: number, userId?: string) => {
    propertyLogger.log('property_action', 'Property search performed', {
      userId: userId || 'anonymous',
      action: 'search',
      searchParams: {
        propertyType: searchParams.propertyType,
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice,
        bedrooms: searchParams.bedrooms,
        bathrooms: searchParams.bathrooms,
        city: searchParams.city
      },
      resultCount
    });
  },

  logPropertyFilter: (filterParams: any, resultCount: number, userId?: string) => {
    propertyLogger.log('property_action', 'Property filter applied', {
      userId: userId || 'anonymous',
      action: 'filter',
      filterParams,
      resultCount
    });
  },

  // Performance and Error Logging
  logPerformance: (action: string, duration: number, additionalData?: any) => {
    propertyLogger.log('verbose', `Performance: ${action}`, {
      action: 'performance',
      performanceAction: action,
      duration,
      ...additionalData
    });
  },

  logError: (error: Error, context: string, additionalData?: any) => {
    propertyLogger.error(`Error in ${context}`, {
      action: 'error',
      context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      ...additionalData
    });
  },

  // Frontend-specific logging methods
  logComponentMount: (componentName: string, props?: any) => {
    propertyLogger.log('debug', `Component mounted: ${componentName}`, {
      action: 'component_mount',
      componentName,
      propsKeys: props ? Object.keys(props) : []
    });
  },

  logComponentUnmount: (componentName: string) => {
    propertyLogger.log('debug', `Component unmounted: ${componentName}`, {
      action: 'component_unmount',
      componentName
    });
  },

  logUserInteraction: (interactionType: string, elementId?: string, additionalData?: any) => {
    propertyLogger.log('property_action', `User interaction: ${interactionType}`, {
      action: 'user_interaction',
      interactionType,
      elementId,
      ...additionalData
    });
  }
};

export default PropertyLogger;