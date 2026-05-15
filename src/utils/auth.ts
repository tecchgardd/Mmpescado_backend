import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../database/prisma.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,

  trustedOrigins: [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    process.env.FRONTEND_URL,
    process.env.BETTER_AUTH_URL,
  ].filter(Boolean) as string[],

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectURI:
      process.env.GOOGLE_REDIRECT_URI ||
      `${process.env.BETTER_AUTH_URL ?? "https://mmpescado-backend.vercel.app"}/api/auth/callback/google`,
  },
},

  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: "none",
      httpOnly: true,
      secure: true,
    },
  },
});
