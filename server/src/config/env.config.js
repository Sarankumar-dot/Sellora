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
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().integer().min(1).max(65535).required(),
  DB_HOST: Joi.string().trim().min(1).required(),
  DB_PORT: Joi.number().integer().min(1).max(65535).required(),
  DB_USER: Joi.string().trim().min(1).required(),
  DB_PASSWORD: Joi.string().min(1).required(),
  DB_NAME: Joi.string().trim().min(1).required(),
  JWT_SECRET: Joi.string().min(1).required(),
  JWT_REFRESH_SECRET: Joi.string().min(1).required(),
  JWT_EXPIRES_IN: jwtDurationSchema.required(),
  JWT_REFRESH_EXPIRES_IN: jwtDurationSchema.required(),
  CLIENT_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  BREVO_API_KEY: Joi.string().required(),

  EMAIL_FROM: Joi.string().email().required(),

  EMAIL_FROM_NAME: Joi.string().required(),

  RAZORPAY_KEY_ID: Joi.string().trim().min(1).required(),
  RAZORPAY_KEY_SECRET: Joi.string().trim().min(1).required(),
}).unknown(true);

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
