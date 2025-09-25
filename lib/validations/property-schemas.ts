import Joi from 'joi'

// ESQUEMA SUPER FLEXIBLE - PERMITE PUBLICAR TODO
const baseSchema = {
  title: Joi.string()
    .min(1)
    .max(300)
    .required()
    .messages({
      'string.min': 'El título no puede estar vacío',
      'string.max': 'El título es muy largo (máximo 300 caracteres)',
      'any.required': 'El título es obligatorio'
    }),

  description: Joi.string()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.min': 'La descripción no puede estar vacía',
      'string.max': 'La descripción es muy larga (máximo 5000 caracteres)',
      'any.required': 'La descripción es obligatoria'
    }),

  price: Joi.object({
    amount: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.base': 'El precio debe ser un número válido',
        'number.min': 'El precio no puede ser negativo',
        'any.required': 'El precio es obligatorio'
      }),
    currency: Joi.string()
      .required()
      .messages({
        'any.required': 'La moneda es obligatoria'
      })
  }).required(),

  address: Joi.object({
    street: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': 'La dirección no puede estar vacía',
        'string.max': 'La dirección es muy larga',
        'any.required': 'La dirección es obligatoria'
      }),
    city: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'La ciudad no puede estar vacía',
        'string.max': 'El nombre de la ciudad es muy largo',
        'any.required': 'La ciudad es obligatoria'
      }),
    state: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'El estado/provincia no puede estar vacío',
        'string.max': 'El nombre del estado/provincia es muy largo',
        'any.required': 'El estado/provincia es obligatorio'
      }),
    country: Joi.string()
      .min(1)
      .max(100)
      .default('México')
      .required(),
    postalCode: Joi.string()
      .min(1)
      .max(20)
      .required()
      .messages({
        'string.min': 'El código postal no puede estar vacío',
        'string.max': 'El código postal es muy largo',
        'any.required': 'El código postal es obligatorio'
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
    .max(50)
    .required()
    .messages({
      'array.min': 'Sube al menos una imagen',
      'array.max': 'Máximo 50 imágenes por propiedad'
    })
}

// ESQUEMA UNIVERSAL SÚPER FLEXIBLE - PERMITE PUBLICAR TODO
export const universalPropertySchema = Joi.object({
  ...baseSchema,
  propertyType: Joi.string()
    .required()
    .messages({
      'any.required': 'El tipo de propiedad es obligatorio'
    }),
  features: Joi.object({
    bedrooms: Joi.number()
      .min(0)
      .max(100)
      .allow(null)
      .optional()
      .messages({
        'number.base': 'El número de habitaciones debe ser un número válido',
        'number.min': 'El número de habitaciones no puede ser negativo',
        'number.max': 'El número de habitaciones es muy alto'
      }),
    bathrooms: Joi.number()
      .min(0)
      .max(50)
      .allow(null)
      .optional()
      .messages({
        'number.base': 'El número de baños debe ser un número válido',
        'number.min': 'El número de baños no puede ser negativo',
        'number.max': 'El número de baños es muy alto'
      }),
    squareMeters: Joi.number()
      .min(1)
      .max(1000000)
      .allow(null)
      .optional()
      .messages({
        'number.base': 'Los metros cuadrados deben ser un número válido',
        'number.min': 'Los metros cuadrados deben ser mayor que 0',
        'number.max': 'El tamaño es extremadamente grande'
      }),
    parking: Joi.number()
      .min(0)
      .max(100)
      .allow(null)
      .optional()
      .messages({
        'number.base': 'El número de estacionamientos debe ser un número válido',
        'number.min': 'El número de estacionamientos no puede ser negativo',
        'number.max': 'El número de estacionamientos es muy alto'
      }),
    amenities: Joi.array()
      .items(Joi.string())
      .allow(null, [])
      .optional()
      .messages({
        'array.base': 'Las características deben ser una lista válida'
      }),
    lotSize: Joi.number()
      .min(0)
      .max(10000000)
      .allow(null)
      .optional(),
    yearBuilt: Joi.number()
      .min(1800)
      .max(2050)
      .allow(null)
      .optional()
  }).optional()
})

// Esquemas compatibles - todos usan el mismo esquema flexible
export const houseSchema = universalPropertySchema
export const apartmentSchema = universalPropertySchema
export const villaSchema = universalPropertySchema
export const penthouseSchema = universalPropertySchema
export const loftSchema = universalPropertySchema
export const townhouseSchema = universalPropertySchema
export const studioSchema = universalPropertySchema
export const duplexSchema = universalPropertySchema

export const getSchemaByPropertyType = (propertyType: string) => {
  // Siempre devuelve el esquema universal flexible
  return universalPropertySchema
}