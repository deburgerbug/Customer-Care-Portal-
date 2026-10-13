import { AppError } from "../errors/AppError.js";

export function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      console.error(error);
      return res.status(error.statusCode).json({
        success: false,
        errorCode: error.errorCode,
        message: "Internal server error",
      });
    }

    return res.status(error.statusCode).json({
      success: false,
      errorCode: error.errorCode,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    });
  }

  if (error.name === "ValidationError" && error.errors) {
    const errors = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      errorCode: "VALIDATION_ERROR",
      message: "Validation failed",
      errors,
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      errorCode: "INVALID_ID",
      message: `Invalid ID format for ${error.path || 'resource'}`,
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      errorCode: "DUPLICATE_RESOURCE",
      message: "A resource with this value already exists",
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      errorCode: "INVALID_JSON",
      message: "Request body contains invalid JSON",
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      errorCode: "PAYLOAD_TOO_LARGE",
      message: "Request body is too large",
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    errorCode: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  });
}