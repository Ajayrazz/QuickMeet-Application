# QuickMeet API

Backend API for QuickMeet — Real-Time Smart Appointment & Queue Management Platform.

## Prerequisites
- Node.js
- PostgreSQL (or connection string to Neon)

## Setup
1. Clone the repository and `cd quickmeet-api`
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in the database URL and JWT secrets.
4. Run `npx prisma migrate dev` to setup the database.

## Running the app
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Example API Requests

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"password123", "name":"Test User"}'
```

### Verify Email
Retrieve the verification token generated in the database or logs and use it.
```bash
curl "http://localhost:3000/auth/verify-email?token=user_id:raw_token"
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"password123"}'
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"user_id:raw_token"}'
```

### Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"user_id:raw_token"}'
```

## Deployment Runbook (Render + Neon + Upstash)

This backend is pre-configured to be deployed on **Render** (as the compute engine), **Neon** (for Serverless Postgres), and **Upstash** (for Serverless Redis).

### 1. Database & Cache Setup
1. Create a Postgres database on [Neon](https://neon.tech). Note the connection string.
2. Create a Redis database on [Upstash](https://upstash.com). Note the connection string.

### 2. Deploying to Render
The repository includes a `render.yaml` blueprint.
1. In your Render Dashboard, click **New > Blueprint**.
2. Connect this GitHub repository.
3. Render will prompt you to provide values for the sync: false environment variables:
   - `DATABASE_URL`: Paste your Neon connection string.
   - `REDIS_URL`: Paste your Upstash connection string (`rediss://...`).
4. Wait for the initial build and deployment to finish.

### 3. Database Migration (Production)
Once deployed, you must run the Prisma migrations against your production database.
Since this is a managed serverless platform without a persistent CLI, you can execute the migration from your local machine pointing to the production DB.
Locally, run:
```bash
DATABASE_URL="your-neon-url" npx prisma migrate deploy
```

### 4. Customizing Environment Variables
In the Render dashboard under **Environment**, make sure to set:
- `ALLOWED_ORIGINS`: Comma-separated list of your client domains (e.g., `https://quickmeet.app`).
- `NOTIFICATION_PROVIDER`: Keep it as `expo` to send real push notifications to devices.
