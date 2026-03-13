import pinoHttp from "pino-http";
import { logger } from "../utils/logger.js";

export const httpLogger = pinoHttp({
  logger,
  customLogLevel(req, res, error) {
    if (res.statusCode >= 500 || error) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
});