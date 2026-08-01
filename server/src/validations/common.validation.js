import Joi from 'joi';

export const createSchema = (fields) => Joi.object(fields).unknown(false);

export const requiredStringValidator = (label) =>
  Joi.string()
    .required()
    .messages({
      'string.empty': `${label} is required`,
      'any.required': `${label} is required`,
    });

const numericStringPattern = (pattern, message) =>
  Joi.string().required().pattern(pattern).messages({
    'string.empty': message,
    'string.pattern.base': message,
    'any.required': message,
  });

export const idValidator = Joi.number().integer().positive().required().messages({
  'number.base': 'id must be a positive integer',
  'number.integer': 'id must be a positive integer',
  'number.positive': 'id must be a positive integer',
  'any.required': 'id must be a positive integer',
});

export const idParamSchema = createSchema({
  id: idValidator,
});

export const emailValidator = Joi.string().trim().lowercase().email().required().messages({
  'string.empty': 'Email is required',
  'string.email': 'Email must be a valid email address',
  'any.required': 'Email is required',
});

export const passwordValidator = Joi.string()
  .min(8)
  .max(30)
  .required()
  .pattern(/[A-Z]/, 'uppercase letter')
  .pattern(/[a-z]/, 'lowercase letter')
  .pattern(/[0-9]/, 'number')
  .pattern(/[^A-Za-z0-9]/, 'special character')
  .messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must be at most 30 characters long',
    'string.pattern.name': 'Password must contain at least one {{#name}}',
    'any.required': 'Password is required',
  });

export const mobileNumberValidator = numericStringPattern(
  /^\d{10}$/,
  'Mobile number must contain exactly 10 digits'
);

export const otpValidator = numericStringPattern(/^\d{6}$/, 'OTP must contain exactly 6 digits');

export const positiveNumberValidator = Joi.number().positive().required().messages({
  'number.base': 'Value must be a positive number',
  'number.positive': 'Value must be a positive number',
  'any.required': 'Value is required',
});

export const nonNegativeIntegerValidator = Joi.number().integer().min(0).required().messages({
  'number.base': 'Value must be an integer',
  'number.integer': 'Value must be an integer',
  'number.min': 'Value must be greater than or equal to 0',
  'any.required': 'Value is required',
});

export const quantityValidator = Joi.number().integer().min(1).required().messages({
  'number.base': 'Quantity must be an integer',
  'number.integer': 'Quantity must be an integer',
  'number.min': 'Quantity must be at least 1',
  'any.required': 'Quantity is required',
});

export const pageValidator = Joi.number().integer().min(1).default(1).messages({
  'number.base': 'Page must be an integer',
  'number.integer': 'Page must be an integer',
  'number.min': 'Page must be at least 1',
});

export const limitValidator = Joi.number().integer().min(1).max(100).default(10).messages({
  'number.base': 'Limit must be an integer',
  'number.integer': 'Limit must be an integer',
  'number.min': 'Limit must be at least 1',
  'number.max': 'Limit must be at most 100',
});

export const searchValidator = Joi.string().trim().min(2).max(100).optional().messages({
  'string.empty': 'Search must be at least 2 characters long',
  'string.min': 'Search must be at least 2 characters long',
  'string.max': 'Search must be at most 100 characters long',
});

export const nameValidator = (label = 'Name') =>
  requiredStringValidator(label)
    .min(3)
    .max(100)
    .messages({
      'string.min': `${label} must be at least 3 characters long`,
      'string.max': `${label} must be at most 100 characters long`,
    });

export const descriptionValidator = (label = 'Description', options = {}) => {
  const { required = false, min = 0, max = 500 } = options;

  let schema = Joi.string().trim().min(min).max(max);

  schema = required ? schema.required() : schema.optional();

  return schema.messages({
    'string.empty': `${label} is required`,
    'string.min': `${label} must be at least ${min} characters long`,
    'string.max': `${label} must be at most ${max} characters long`,
    'any.required': `${label} is required`,
  });
};
