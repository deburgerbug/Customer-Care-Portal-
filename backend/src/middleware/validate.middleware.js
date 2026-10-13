import { AppError } from "../errors/AppError.js";

export function createValidationError(zodError) {
  return new AppError("Request validation failed", {
    statusCode: 400,
    errorCode: "VALIDATION_ERROR",
    details: zodError.issues.map(({ path, message }) => ({
      path: path.join("."),
      message,
    })),
  });
}

export function validate(schemas) {
  return (req, res, next) => {
    const validated = {};

    for (const [part, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[part]);

      if (!result.success) {
        return next(createValidationError(result.error));
      }

      validated[part] = result.data;
    }

    req.validated = validated;
    return next();
  };
}
