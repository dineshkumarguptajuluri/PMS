# Backend DB Setup

This backend uses PostgreSQL with Prisma.

## Required environment variables

Create `Backend/.env` with these values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
JWT_SECRET="replace-with-a-strong-secret"
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Notes:

- `DATABASE_URL` is required by Prisma.
- `JWT_SECRET` is required for login/token verification.
- `CORS_ORIGIN` should match the frontend URL.
- `PORT` defaults to `3001` if omitted, but keeping it in `.env` is clearer.

## Initial setup

From the project root:

```bash
npm install
```

Or from the backend folder only:

```bash
cd Backend
npm install
```

## Create/update the database schema

From `Backend/` run:

```bash
npx prisma migrate dev
```

This will:

- create the database tables from `prisma/schema.prisma`
- generate the Prisma client
- apply any existing migrations

## Seed sample data

From `Backend/` run:

```bash
npm run seed
```

## Start the backend

From `Backend/` run:

```bash
npm run dev
```

The API will start on `http://localhost:3001` unless `PORT` is changed.

## Frontend environment note

The frontend reads `VITE_API_URL` from `Frontend/.env` through Vite. If it is not set, it falls back to:

```env
VITE_API_URL=http://localhost:3001/api
```
