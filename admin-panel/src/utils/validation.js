/**
 * Enhanced validation utilities
 */

export const validators = {
  required: (value, message = 'This field is required') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message;
    }
    return null;
  },

  email: (value, message = 'Invalid email address') => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message;
    }
    return null;
  },

  minLength: (min, message) => (value) => {
    if (value && value.toString().length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (value && value.toString().length > max) {
      return message || `Must be at most ${max} characters`;
    }
    return null;
  },

  min: (min, message) => (value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num < min) {
      return message || `Must be at least ${min}`;
    }
    return null;
  },

  max: (max, message) => (value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > max) {
      return message || `Must be at most ${max}`;
    }
    return null;
  },

  number: (value, message = 'Must be a number') => {
    if (value && isNaN(value)) {
      return message;
    }
    return null;
  },

  url: (value, message = 'Invalid URL') => {
    if (value && !/^https?:\/\/.+/.test(value)) {
      return message;
    }
    return null;
  },

  phone: (value, message = 'Invalid phone number') => {
    if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
      return message;
    }
    return null;
  },

  pattern: (regex, message = 'Invalid format') => (value) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return null;
  },

  custom: (validator, message) => (value) => {
    if (!validator(value)) {
      return message || 'Validation failed';
    }
    return null;
  },
};

export const validate = (value, rules) => {
  for (const rule of rules) {
    const error = typeof rule === 'function' ? rule(value) : rule(value);
    if (error) {
      return error;
    }
  }
  return null;
};

export const validateForm = (data, schema) => {
  const errors = {};
  
  Object.keys(schema).forEach((field) => {
    const rules = schema[field];
    const value = data[field];
    const error = validate(value, Array.isArray(rules) ? rules : [rules]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Common validation schemas
export const schemas = {
  product: {
    name: [validators.required, validators.minLength(3), validators.maxLength(200)],
    description: [validators.required, validators.minLength(10)],
    price: [validators.required, validators.number, validators.min(0)],
    stock: [validators.required, validators.number, validators.min(0)],
    category: [validators.required],
  },
  
  email: {
    email: [validators.required, validators.email],
  },
  
  url: {
    url: [validators.required, validators.url],
  },
};

export default {
  validators,
  validate,
  validateForm,
  schemas,
};

