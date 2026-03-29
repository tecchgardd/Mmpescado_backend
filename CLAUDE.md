# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Run in development mode (tsx watch)
npm run build      # Compile TypeScript
npm run start      # Run compiled output
npm run lint       # Run ESLint
npm run seed       # Seed the database
npm run generate   # Regenerate Prisma client after schema changes
npm run studio     # Open Prisma Studio
npm run db:pull    # Pull schema from existing database
```

There are no automated tests in this project.

## Architecture

Express + TypeScript API (ESM modules, `"type": "module"`) running on port **3333**. Docs available at `/docs` (Swagger UI).

### Request lifecycle

```
app.ts → routes/index.ts → route file → middleware chain → controller → service → prisma
```

Every protected route passes through: `requireAuth` → `requireRole(...)` → `validateBody(schema)` → controller.

- `requireAuth` calls Better Auth's session API and attaches `req.session` and `req.currentUser` (full Prisma User)
- `requireRole` reads `req.currentUser.role` — roles are `ADMIN`, `STAFF`, `USER`
- `validateBody` runs Zod `schema.parse(req.body)` and reassigns `req.body` with the parsed result

### Route structure

All routes are mounted under `/api/` in `routes/index.ts`. Better Auth is mounted separately at `/api/auth/*` (handled entirely by `toNodeHandler(auth)`). Webhooks are at `/api/webhooks/*` and receive raw body for signature verification.

Zod validation schemas are defined **inline in each route file** — not in separate schema files.

### Service layer

Services live in `src/services/<domain>/` (one file per operation, e.g. `create-product.service.ts`). Business errors are thrown as plain objects:

```ts
throw { status: 404, message: "Produto não encontrado." };
```

Controllers catch these and forward `error.status` / `error.message` to the response.

### Key conventions

- **Prices are always in cents** — fields named `priceCents`, `promoPriceCents`, `totalCents`, etc.
- **Prisma singleton** — imported from `src/database/prisma.ts`, uses a `pg.Pool` connection pool via `@prisma/adapter-pg`
- **Image uploads** — multer with `memoryStorage` (max 5 MB), then streamed to Cloudinary via `uploadProductImageService`. The `POST /products` route accepts `multipart/form-data` with a `product` JSON field and an `image` file field.
- **Payment gateway** — AbacatePay (`src/services/payment/abacatepay-client.ts`), supports PIX and card

### Environment variables required

```
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET
CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
ABACATEPAY_API_URL / ABACATEPAY_API_TOKEN
```
