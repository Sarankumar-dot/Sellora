import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config({ quiet: true });

const jwtDurationSchema = Joi.string()
  .trim()
  .pattern(/^\d+[smhd]$/i)
  .messages({
    'string.pattern.base': '{{#label}} must use a number followed by s, m, h, or d',
  });

const environmentSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').optional(),
  PORT: Joi.number().integer().min(1).max(65535).default(5000),
  DB_HOST: Joi.string().trim().min(1).required(),
  DB_PORT: Joi.number().integer().min(1).max(65535).required(),
  DB_USER: Joi.string().trim().min(1).required(),
  DB_PASSWORD: Joi.string().min(1).required(),
  DB_NAME: Joi.string().trim().min(1).required(),
  JWT_SECRET: Joi.string().min(1).optional(),
  JWT_ACCESS_SECRET: Joi.string().min(1).optional(),
  JWT_REFRESH_SECRET: Joi.string().min(1).optional(),
  JWT_ACCESS_EXPIRES: jwtDurationSchema.optional(),
  JWT_REFRESH_EXPIRES: jwtDurationSchema.optional(),
  JWT_EXPIRES_IN: jwtDurationSchema.optional(),
  EMAIL_HOST: Joi.string().hostname().optional(),
  EMAIL_PORT: Joi.number().integer().min(1).max(65535).optional(),
  EMAIL_USER: Joi.string().trim().min(1).required(),
  EMAIL_PASS: Joi.string().min(1).required(),
  CLIENT_URL: Joi.string().uri({ scheme: ['http', 'https'] }).default('http://localhost:5173'),
  CLOUDINARY_CLOUD_NAME: Joi.string().trim().min(1).optional(),
  CLOUDINARY_API_KEY: Joi.string().trim().min(1).optional(),
  CLOUDINARY_API_SECRET: Joi.string().min(1).optional(),
})
  .or('JWT_SECRET', 'JWT_ACCESS_SECRET')
  .or('JWT_SECRET', 'JWT_REFRESH_SECRET')
  .unknown(true);

const formatValidationError = (error) => {
  const invalidVariables = error.details.map((detail) => {
    if (detail.path.length > 0) {
      return detail.path.join('.');
    }

    return detail.context?.peers?.join(' or ') || detail.message;
  });

  return [...new Set(invalidVariables)];
};

const { error, value } = environmentSchema.validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
  convert: true,
});

if (error) {
  console.error('❌ Environment validation failed');
  console.error('\nMissing or invalid variables:');

  for (const variable of formatValidationError(error)) {
    console.error(`- ${variable}`);
  }

  process.exit(1);
}

const env = value;

export default env;
