export function errorMiddleware(error, req, res, next) {
  console.error(error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(error.errors).map((err) => err.message),
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid customer ID",
    });
  }

  //Return descriptive message for business logic and validation errors
  res.status(error.statusCode || 400).json({
    success: false,
    message: error.message || "Internal server error",
  });
}