import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Formats Zod validation errors into a user-friendly format
 */
export function formatZodErrors(errors: z.ZodError['errors']) {
  return errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Validates data against a Zod schema and returns formatted errors
 */
export function validateWithZod<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
):
  | { success: true; data: T }
  | { success: false; errors: ReturnType<typeof formatZodErrors> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatZodErrors(result.error.errors),
  };
}

/**
 * Creates a standardized validation error response
 */
export function createValidationErrorResponse(
  errors: ReturnType<typeof formatZodErrors>,
  message: string = 'Validation failed',
) {
  return NextResponse.json(
    {
      error: message,
      details: errors,
    },
    { status: 400 },
  );
}

/**
 * Middleware-style validator for API routes
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    const validation = validateWithZod(schema, data);
    if (!validation.success) {
      return {
        isValid: false,
        response: createValidationErrorResponse(validation.errors),
      };
    }
    return {
      isValid: true,
      data: validation.data,
    };
  };
}
