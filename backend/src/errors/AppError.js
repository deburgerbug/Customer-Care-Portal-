export class AppError extends Error {
  constructor(
    message,
    {
      statusCode = 500,
      errorCode = "INTERNAL_SERVER_ERROR",
      details,
      isOperational = statusCode < 500,
    } = {}
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    if (details !== undefined) {
      this.details = details;
    }

    Error.captureStackTrace?.(this, AppError);
  }
}