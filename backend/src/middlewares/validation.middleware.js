import { ZodError } from 'zod';
import { errorResponse } from '../utils/response.util.js';

const formatZodErrors = (error) => {
  return error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = formatZodErrors(error);
        console.log('ZodError:', errors);

        return errorResponse(res, errors, 422);
      }

      return errorResponse(res, 'Lỗi validation', 500);
    }
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = formatZodErrors(error);

        return errorResponse(res, errors, 422);
      }

      return errorResponse(res, 'Lỗi validation', 500);
    }
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = formatZodErrors(error);

        return errorResponse(res, errors, 422);
      }

      return errorResponse(res, 'Lỗi validation', 500);
    }
  };
};

export { validateBody, validateQuery, validateParams };
