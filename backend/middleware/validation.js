const Joi = require('joi');

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace req[property] with validated and sanitized value
    req[property] = value;
    next();
  };
};

// Order validation schemas
const orderSchemas = {
  create: Joi.object({
    userId: Joi.string().hex().length(24).optional().allow(null),
    products: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().hex().length(24).required(),
          name: Joi.string().required(),
          price: Joi.number().positive().required(),
          quantity: Joi.number().integer().min(1).required(),
          size: Joi.string().required(),
        })
      )
      .min(1)
      .required(),
    shippingAddress: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
    }).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional().allow('', null),
    totalAmount: Joi.number().positive().required(),
    paymentType: Joi.string().valid('cod', 'online').required(),
    paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').optional(),
    orderStatus: Joi.string()
      .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
      .optional(),
    stripeSessionId: Joi.string().optional().allow('', null),
  }),

  updateStatus: Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
      .required(),
  }),

  updateTracking: Joi.object({
    trackingNumber: Joi.string().required(),
    carrier: Joi.string().optional(),
    estimatedDelivery: Joi.date().optional(),
  }),

  addNote: Joi.object({
    note: Joi.string().min(1).max(1000).required(),
    isInternal: Joi.boolean().default(true),
  }),
};

// Review validation schemas
const reviewSchemas = {
  create: Joi.object({
    productId: Joi.string().hex().length(24).required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().max(200).optional().allow('', null),
    comment: Joi.string().min(1).max(5000).required(),
    images: Joi.array().items(Joi.string().uri()).optional(),
  }),

  update: Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    title: Joi.string().max(200).optional().allow('', null),
    comment: Joi.string().min(1).max(5000).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
  }),

  approve: Joi.object({
    isApproved: Joi.boolean().required(),
  }),
};

// Question validation schemas
const questionSchemas = {
  create: Joi.object({
    productId: Joi.string().hex().length(24).required(),
    question: Joi.string().min(1).max(1000).required(),
  }),

  answer: Joi.object({
    answer: Joi.string().min(1).max(2000).required(),
  }),
};

// Product validation schemas
const productSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(5000).optional(),
    price: Joi.number().positive().required(),
    category: Joi.string().hex().length(24).required(),
    stock: Joi.number().integer().min(0).required(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    sizes: Joi.array().items(Joi.string()).optional(),
    sizeStock: Joi.object().pattern(Joi.string(), Joi.number().integer().min(0)).optional(),
    isActive: Joi.boolean().default(true),
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(5000).optional(),
    price: Joi.number().positive().optional(),
    category: Joi.string().hex().length(24).optional(),
    stock: Joi.number().integer().min(0).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    sizes: Joi.array().items(Joi.string()).optional(),
    sizeStock: Joi.object().pattern(Joi.string(), Joi.number().integer().min(0)).optional(),
    isActive: Joi.boolean().optional(),
  }),
};

// Auth validation schemas
const authSchemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};

module.exports = {
  validate,
  orderSchemas,
  reviewSchemas,
  questionSchemas,
  productSchemas,
  authSchemas,
};

