import type { IncomingMessage, ServerResponse } from "node:http";
import pinoHttpModule from "pino-http";
import { logger } from "../utils/logger.js";

const pinoHttp = pinoHttpModule.default ?? pinoHttpModule;

export const httpLogger = pinoHttp({
  logger,
  customLogLevel(
    req: IncomingMessage,
    res: ServerResponse,
    error?: Error
  ) {
    if (res.statusCode >= 500 || error) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
});