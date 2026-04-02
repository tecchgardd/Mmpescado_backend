import express from "express";
import swaggerUi from "swagger-ui-express";
import { openapi } from "./docs/openapi.js";
import routes from "./routes/index.js";
import betterAuthRoutes from "./routes/better-auth.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import { httpLogger } from "./middlewares/logger.middleware.js";
import {
  authRateLimit,
  globalRateLimit,
  webhookRateLimit,
} from "./middlewares/rate-limit.middleware.js";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";

const app = express();

app.set("trust proxy", 1);

app.use(httpLogger);
app.use(globalRateLimit);

const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "MM Pescado backend online",
  });
});

app.use(
  "/api/auth",
  (_req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
    next();
  },
  authRateLimit,
  betterAuthRoutes
);

app.all("/api/auth/*", toNodeHandler(auth));

app.use(
  "/api/webhooks",
  webhookRateLimit,
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  }),
  webhookRoutes
);

app.use(express.json());

app.use("/api", routes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

export default app;