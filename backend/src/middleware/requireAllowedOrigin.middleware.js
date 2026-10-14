import { allowedOrigin } from "../config/env.js";
import { AppError } from "../errors/AppError.js";

export function requireAllowedOrigin(req, res, next) {
  const origin = req.get("Origin");

  if (origin && !allowedOrigin.includes(origin)) {
    return next(new AppError("Request origin is not allowed", {
      statusCode: 403,
      errorCode: "ORIGIN_NOT_ALLOWED",
    }));
  }

  return next();
}
