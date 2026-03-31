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

const app = express();

app.set("trust proxy", 1);

app.use(httpLogger);
app.use(globalRateLimit);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/api/auth", (_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  next();
}, authRateLimit, betterAuthRoutes);

app.use(
  "/api/webhooks",
  webhookRateLimit,
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  }),
  webhookRoutes,
);

app.use(express.json());

app.use("/api", routes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

export default app;