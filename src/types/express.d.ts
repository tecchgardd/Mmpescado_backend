import type { Session, User } from "better-auth";

declare global {
  namespace Express {
    interface Request {
      session?: Session | null;
      currentUser?: User | null;
    }
  }
}

export {};