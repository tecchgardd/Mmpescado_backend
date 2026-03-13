import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../utils/auth.js";

const betterAuthRoutes = Router();

betterAuthRoutes.all("/*", toNodeHandler(auth));

export default betterAuthRoutes;