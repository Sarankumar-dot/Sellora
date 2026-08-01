import Joi from 'joi';
import ApiError from '../errors/ApiError.js';

const REQUEST_PARTS = ['body', 'params', 'query'];

const joiOptions = {
  abortEarly: false,
  allowUnknown: false,
  convert: true,
};

const formatFieldName = (path = []) => (path.length > 0 ? path.join('.') : 'unknown');

const buildJoiErrors = (details = []) =>
  details.map((detail) => ({
    field: formatFieldName(detail.path),
    message: detail.message,
  }));

const validateRequestSegment = (schema, value = {}) => {
  const { error, value: validatedValue } = schema.validate(value, joiOptions);

  const errors = [];

  if (error) {
    errors.push(...buildJoiErrors(error.details));
  }

  return {
    errors,
    validatedValue,
  };
};

const validate =
  (schemas = {}) =>
  (req, res, next) => {
    const errors = [];

    for (const key of REQUEST_PARTS) {
      const schema = schemas[key];

      if (!schema) {
        continue;
      }

      const { errors: segmentErrors, validatedValue } = validateRequestSegment(
        schema,
        req[key] ?? {}
      );

      if (segmentErrors.length > 0) {
        errors.push(...segmentErrors);
        continue;
      }

      if (key === 'query') {
        Object.assign(req.query, validatedValue);
      } else {
        req[key] = validatedValue;
      }
    }

    if (errors.length > 0) {
      const validationError = new ApiError(400, 'Validation Error');
      validationError.errors = errors;

      return next(validationError);
    }

    return next();
  };

export default validate;
export { validate };
