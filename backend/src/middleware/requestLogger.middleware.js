import { randomUUID } from "node:crypto";
import { logger } from "../utils/logger.js";

export function requestLogger(req, res, next) {
  const requestId = randomUUID();
  const startedAt = process.hrtime.bigint();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const responseTimeMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const log = {
      requestId,
      method: req.method,
      statusCode: res.statusCode,
      responseTimeMs: Number(responseTimeMs.toFixed(2)),
    };

    if (res.statusCode >= 500) {
      logger.error(log, "Request failed");
    } else if (res.statusCode >= 400) {
      logger.warn(log, "Request completed with a client error");
    } else {
      logger.info(log, "Request completed");
    }
  });

  next();
}
