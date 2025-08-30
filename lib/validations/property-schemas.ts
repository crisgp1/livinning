import Joi from 'joi'

const baseSchema = {
  title: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-,.()]+$/)
    .required()
    .messages({
      'string.pattern.base': 'El título solo puede contener letras, números, espacios, guiones, comas, puntos y paréntesis',
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede tener más de 100 caracteres',
      'any.required': 'El título es obligatorio',
      'string.empty': 'El título no puede estar vacío'
    }),
  
  description: Joi.string()
    .min(20)
    .max(2000)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-,.;:!¡?¿()%$#@&*+="']+$/)
    .required()
    .messages({
      'string.pattern.base': 'La descripción contiene caracteres especiales no permitidos',
      'string.min': 'La descripción debe tener al menos 20 caracteres',
      'string.max': 'La descripción no puede tener más de 2000 caracteres',
      'any.required': 'La descripción es obligatoria',
      'string.empty': 'La descripción no puede estar vacía'
    }),
    
  price: Joi.object({
    amount: Joi.number()
      .min(1)
      .max(99999999)
      .required()
      .messages({
        'number.base': 'El precio debe ser un número válido',
        'number.min': 'El precio debe ser mayor que 0',
        'number.max': 'El precio no puede ser mayor a 99,999,999',
        'any.required': 'El precio es obligatorio',
        'number.unsafe': 'El precio ingresado es muy grande'
      }),
    currency: Joi.string()
      .valid('USD', 'MXN')
      .required()
      .messages({
        'any.only': 'La moneda debe ser USD o MXN',
        'any.required': 'La moneda es obligatoria'
      })
  }).required().messages({
    'any.required': 'La información del precio es obligatoria'
  }),
  
  address: Joi.object({
    street: Joi.string()
      .min(5)
      .max(100)
      .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-,.#°ªº]+$/)
      .required()
      .messages({
        'string.pattern.base': 'La dirección solo puede contener letras, números, espacios y símbolos básicos (#, °, -, .)',
        'string.min': 'La dirección debe tener al menos 5 caracteres',
        'string.max': 'La dirección no puede tener más de 100 caracteres',
        'any.required': 'La dirección es obligatoria',
        'string.empty': 'La dirección no puede estar vacía'
      }),
    city: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'La ciudad solo puede contener letras, espacios y guiones',
        'string.min': 'La ciudad debe tener al menos 2 caracteres',
        'string.max': 'La ciudad no puede tener más de 50 caracteres',
        'any.required': 'La ciudad es obligatoria',
        'string.empty': 'La ciudad no puede estar vacía'
      }),
    state: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'El estado/provincia solo puede contener letras, espacios y guiones',
        'string.min': 'El estado/provincia debe tener al menos 2 caracteres',
        'string.max': 'El estado/provincia no puede tener más de 50 caracteres',
        'any.required': 'El estado/provincia es obligatorio',
        'string.empty': 'El estado/provincia no puede estar vacío'
      }),
    country: Joi.string()
      .default('México')
      .required(),
    postalCode: Joi.string()
      .pattern(/^[0-9]{5}$/)
      .required()
      .messages({
        'string.pattern.base': 'El código postal debe tener exactamente 5 números',
        'any.required': 'El código postal es obligatorio',
        'string.empty': 'El código postal no puede estar vacío'
      }),
    coordinates: Joi.object({
      latitude: Joi.number(),
      longitude: Joi.number()
    }).optional(),
    displayPrivacy: Joi.boolean().default(false)
  }).required(),
  
  images: Joi.array()
    .items(Joi.string().uri())
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.min': 'Sube al menos una imagen',
      'array.max': 'No puedes subir más de 20 imágenes'
    })
}

// Casa
export const houseSchema = Joi.object({
  ...baseSchema,
  propertyType: Joi.string().valid('house').required(),
  features: Joi.object({
    bedrooms: Joi.number()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.base': 'El número de habitaciones debe ser un número válido',
        'number.min': 'Una casa debe tener al menos 1 habitación',
        'number.max': 'Una casa no puede tener más de 10 habitaciones',
        'any.required': 'El número de habitaciones es obligatorio'
      }),
    bathrooms: Joi.number()
      .min(1)
      .max(8)
      .required()
      .messages({
        'number.base': 'El número de baños debe ser un número válido',
        'number.min': 'Una casa debe tener al menos 1 baño',
        'number.max': 'Una casa no puede tener más de 8 baños',
        'any.required': 'El número de baños es obligatorio'
      }),
    squareMeters: Joi.number()
      .min(50)
      .max(5000)
      .required()
      .messages({
        'number.base': 'Los metros cuadrados deben ser un número válido',
        'number.min': 'Una casa debe tener al menos 50 metros cuadrados',
        'number.max': 'Una casa no puede tener más de 5000 metros cuadrados',
        'any.required': 'Los metros cuadrados son obligatorios'
      }),
    parking: Joi.number()
      .min(1)
      .max(5)
      .allow(null)
      .messages({
        'number.base': 'El número de estacionamientos debe ser un número válido',
        'number.min': 'El estacionamiento debe ser entre 1 y 5',
        'number.max': 'El estacionamiento debe ser entre 1 y 5'
      }),
    amenities: Joi.array()
      .items(Joi.string())
      .min(1)
      .required()
      .messages({
        'array.base': 'Las características deben ser una lista válida',
        'array.min': 'Debes seleccionar al menos una característica',
        'any.required': 'Las características son obligatorias'
      }),
    lotSize: Joi.number().optional(),
    yearBuilt: Joi.number().optional()
  }).required()
})

// Apartamento
export const apartmentSchema = Joi.object({
  ...baseSchema,
  propertyType: Joi.string().valid('apartment').required(),
  features: Joi.object({
    bedrooms: Joi.number()
      .min(1)
      .max(5)
      .required()
      .messages({
        'number.base': 'El número de habitaciones debe ser un número válido',
        'number.min': 'Un apartamento debe tener al menos 1 habitación',
        'number.max': 'Un apartamento no puede tener más de 5 habitaciones',
        'any.required': 'El número de habitaciones es obligatorio'
      }),
    bathrooms: Joi.number()
      .min(1)
      .max(3)
      .required()
      .messages({
        'number.base': 'El número de baños debe ser un número válido',
        'number.min': 'Un apartamento debe tener al menos 1 baño',
        'number.max': 'Un apartamento no puede tener más de 3 baños',
        'any.required': 'El número de baños es obligatorio'
      }),
    squareMeters: Joi.number()
      .min(30)
      .max(300)
      .required()
      .messages({
        'number.base': 'Los metros cuadrados deben ser un número válido',
        'number.min': 'Un apartamento debe tener al menos 30 metros cuadrados',
        'number.max': 'Un apartamento no puede tener más de 300 metros cuadrados',
        'any.required': 'Los metros cuadrados son obligatorios'
      }),
    parking: Joi.number()
      .min(0)
      .max(2)
      .allow(null)
      .messages({
        'number.max': 'Un apartamento no puede tener más de 2 estacionamientos'
      }),
    amenities: Joi.array()
      .items(Joi.string())
      .min(1)
      .required()
      .messages({
        'array.min': 'Selecciona al menos una característica'
      }),
    lotSize: Joi.number().optional(),
    yearBuilt: Joi.number().optional()
  }).required()
})

// Villa
export const villaSchema = Joi.object({
  ...baseSchema,
  propertyType: Joi.string().valid('villa').required(),
  features: Joi.object({
    bedrooms: Joi.number()
      .min(3)
      .max(15)
      .required()
      .messages({
        'number.min': 'Una villa debe tener al menos 3 habitaciones',
        'number.max': 'El número de habitaciones no puede exceder 15'
      }),
    bathrooms: Joi.number()
      .min(2)
      .max(10)
      .required()
      .messages({
        'number.min': 'Una villa debe tener al menos 2 baños',
        'number.max': 'El número de baños no puede exceder 10'
      }),
    squareMeters: Joi.number()
      .min(200)
      .max(10000)
      .required()
      .messages({
        'number.min': 'Una villa debe tener al menos 200 m²',
        'number.max': 'El tamaño no puede exceder 10000 m²'
      }),
    parking: Joi.number()
      .min(2)
      .max(5)
      .required()
      .messages({
        'number.min': 'Una villa debe tener al menos 2 estacionamientos',
        'number.max': 'El estacionamiento debe ser entre 2 y 5',
        'any.required': 'El estacionamiento es obligatorio para villas'
      }),
    amenities: Joi.array()
      .items(Joi.string())
      .min(3)
      .required()
      .messages({
        'array.min': 'Una villa debe tener al menos 3 características'
      }),
    lotSize: Joi.number().optional(),
    yearBuilt: Joi.number().optional()
  }).required()
})

// Penthouse
export const penthouseSchema = Joi.object({
  ...baseSchema,
  propertyType: Joi.string().valid('penthouse').required(),
  features: Joi.object({
    bedrooms: Joi.number()
      .min(2)
      .max(8)
      .required()
      .messages({
        'number.min': 'Un penthouse debe tener al menos 2 habitaciones',
        'number.max': 'El número de habitaciones no puede exceder 8'
      }),
    bathrooms: Joi.number()
      .min(2)
      .max(6)
      .required()
      .messages({
        'number.min': 'Un penthouse debe tener al menos 2 baños',
        'number.max': 'El número de baños no puede exceder 6'
      }),
    squareMeters: Joi.number()
      .min(100)
      .max(1000)
      .required()
      .messages({
        'number.min': 'Un penthouse debe tener al menos 100 m²',
        'number.max': 'El tamaño no puede exceder 1000 m²'
      }),
    parking: Joi.number()
      .min(1)
      .max(4)
      .required()
      .messages({
        'number.min': 'Un penthouse debe tener al menos 1 estacionamiento',
        'number.max': 'El estacionamiento debe ser entre 1 y 4',
        'any.required': 'El estacionamiento es obligatorio para penthouse'
      }),
    amenities: Joi.array()
      .items(Joi.string())
      .min(2)
      .required()
      .messages({
        'array.min': 'Un penthouse debe tener al menos 2 características'
      }),
    lotSize: Joi.number().optional(),
    yearBuilt: Joi.number().optional()
  }).required()
})

// Loft
export const loftSchema = Joi.object({
  ...baseSchema,
  propertyType: Joi.string().valid('loft').required(),
  features: Joi.object({
    bedrooms: Joi.number()
      .min(0)
      .max(2)
      .required()
      .messages({
        'number.max': 'Un loft no puede tener más de 2 habitaciones'
      }),
    bathrooms: Joi.number()
      .min(1)
      .max(2)
      .required()
      .messages({
        'number.min': 'Un loft debe tener al menos 1 baño',
        'number.max': 'Un loft no puede tener más de 2 baños'
      }),
    squareMeters: Joi.number()
      .min(40)
      .max(200)
      .required()
      .messages({
        'number.min': 'Un loft debe tener al menos 40 m²',
        'number.max': 'El tamaño no puede exceder 200 m²'
      }),
    parking: Joi.number()
      .min(0)
      .max(1)
      .allow(null)
      .messages({
        'number.max': 'Un loft no puede tener más de 1 estacionamiento'
      }),
    amenities: Joi.array()
      .items(Joi.string())
      .min(1)
      .required()
      .messages({
        'array.min': 'Selecciona al menos una característica'
      }),
    lotSize: Joi.number().optional(),
    yearBuilt: Joi.number().optional()
  }).required()
})

// Townhouse
export const townhouseSchema = Joi.object({
  ...baseSchema,
  propertyType: Joi.string().valid('townhouse').required(),
  features: Joi.object({
    bedrooms: Joi.number()
      .min(2)
      .max(6)
      .required()
      .messages({
        'number.min': 'Un townhouse debe tener al menos 2 habitaciones',
        'number.max': 'El número de habitaciones no puede exceder 6'
      }),
    bathrooms: Joi.number()
      .min(1)
      .max(4)
      .required()
      .messages({
        'number.min': 'Un townhouse debe tener al menos 1 baño',
        'number.max': 'El número de baños no puede exceder 4'
      }),
    squareMeters: Joi.number()
      .min(80)
      .max(400)
      .required()
      .messages({
        'number.min': 'Un townhouse debe tener al menos 80 m²',
        'number.max': 'El tamaño no puede exceder 400 m²'
      }),
    parking: Joi.number()
      .min(1)
      .max(3)
      .allow(null)
      .messages({
        'number.min': 'El estacionamiento debe ser entre 1 y 3',
        'number.max': 'El estacionamiento debe ser entre 1 y 3'
      }),
    amenities: Joi.array()
      .items(Joi.string())
      .min(1)
      .required()
      .messages({
        'array.min': 'Selecciona al menos una característica'
      }),
    lotSize: Joi.number().optional(),
    yearBuilt: Joi.number().optional()
  }).required()
})

// Estudio
export const studioSchema = Joi.object({
  ...baseSchema,
  propertyType: Joi.string().valid('studio').required(),
  features: Joi.object({
    bedrooms: Joi.number()
      .valid(0, 1)
      .required()
      .messages({
        'any.only': 'Un estudio solo puede tener 0 o 1 habitación'
      }),
    bathrooms: Joi.number()
      .valid(1)
      .required()
      .messages({
        'any.only': 'Un estudio debe tener exactamente 1 baño'
      }),
    squareMeters: Joi.number()
      .min(20)
      .max(60)
      .required()
      .messages({
        'number.min': 'Un estudio debe tener al menos 20 m²',
        'number.max': 'Un estudio no puede exceder 60 m²'
      }),
    parking: Joi.number()
      .min(0)
      .max(1)
      .allow(null)
      .messages({
        'number.max': 'Un estudio no puede tener más de 1 estacionamiento'
      }),
    amenities: Joi.array()
      .items(Joi.string())
      .min(1)
      .required()
      .messages({
        'array.min': 'Selecciona al menos una característica'
      }),
    lotSize: Joi.number().optional(),
    yearBuilt: Joi.number().optional()
  }).required()
})

// Dúplex
export const duplexSchema = Joi.object({
  ...baseSchema,
  propertyType: Joi.string().valid('duplex').required(),
  features: Joi.object({
    bedrooms: Joi.number()
      .min(2)
      .max(8)
      .required()
      .messages({
        'number.min': 'Un dúplex debe tener al menos 2 habitaciones',
        'number.max': 'El número de habitaciones no puede exceder 8'
      }),
    bathrooms: Joi.number()
      .min(2)
      .max(5)
      .required()
      .messages({
        'number.min': 'Un dúplex debe tener al menos 2 baños',
        'number.max': 'El número de baños no puede exceder 5'
      }),
    squareMeters: Joi.number()
      .min(100)
      .max(500)
      .required()
      .messages({
        'number.min': 'Un dúplex debe tener al menos 100 m²',
        'number.max': 'El tamaño no puede exceder 500 m²'
      }),
    parking: Joi.number()
      .min(1)
      .max(3)
      .allow(null)
      .messages({
        'number.min': 'El estacionamiento debe ser entre 1 y 3',
        'number.max': 'El estacionamiento debe ser entre 1 y 3'
      }),
    amenities: Joi.array()
      .items(Joi.string())
      .min(1)
      .required()
      .messages({
        'array.min': 'Selecciona al menos una característica'
      }),
    lotSize: Joi.number().optional(),
    yearBuilt: Joi.number().optional()
  }).required()
})

export const getSchemaByPropertyType = (propertyType: string) => {
  const schemas: Record<string, Joi.ObjectSchema> = {
    house: houseSchema,
    apartment: apartmentSchema,
    villa: villaSchema,
    penthouse: penthouseSchema,
    loft: loftSchema,
    townhouse: townhouseSchema,
    studio: studioSchema,
    duplex: duplexSchema
  }
  
  return schemas[propertyType] || houseSchema
}