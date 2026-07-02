# QuickMeet API 🚀

**QuickMeet** is a production-grade full-stack mobile platform that combines pre-scheduled appointment booking (like Calendly) with a real-time live queue system (like a modern hospital or bank token queue).

This repository contains the **NestJS Backend**, providing a robust, highly concurrent, and scalable API.

---

## 🏗️ Architecture Overview

The backend is engineered for high concurrency and real-time responsiveness.
- **Framework**: NestJS (TypeScript, strict-mode)
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache & Real-time Adapter**: Redis (Upstash) for caching analytics, rate limiting, and scaling Socket.IO across multiple nodes.
- **Real-time Gateway**: Socket.IO for live queue updates.
- **Background Jobs**: BullMQ (Redis-backed) for scheduling pre-appointment reminders.
- **Authentication**: JWT access tokens (15m) and rotating refresh tokens (7d), with Argon2 password hashing.
- **Rate Limiting**: Globally enforced via `@nestjs/throttler` (Redis storage) to prevent slot-sniping.

---

## 📁 Folder Structure

```text
src/
├── common/              # Global decorators, exceptions, DTOs, and utils
├── health/              # Liveness and Readiness probes (DB & Redis)
├── jobs/                # BullMQ Queues and Processors
├── modules/
│   ├── analytics/       # Aggregated queue insights and wait times
│   ├── appointment-types/ # Admin service definitions
│   ├── auth/            # JWT issuance, refresh, and verification
│   ├── bookings/        # Transactional slot bookings and queue assignment
│   ├── notifications/   # Expo Push Notification integration
│   ├── queue/           # Socket.IO Gateway for live queue tracking
│   ├── slots/           # Time windows with capacity management
│   └── users/           # User profile management
├── prisma/              # Prisma Service instantiation
├── redis/               # Global Redis client and helpers
├── app.module.ts        # Root module aggregator
└── main.ts              # Entry point, CORS, validation, and filters
```

---

## 🗄️ Database Schema

The database relies on a strict schema with transactional integrity. Key entities:
- **User**: The client or admin.
- **AppointmentType**: The service being offered (e.g., "General Consultation").
- **Slot**: A specific time window belonging to an `AppointmentType` with a fixed `capacity`.
- **Booking**: A user's reservation for a `Slot`. Holds the crucial `queuePosition` and `status` (PENDING, SERVED, CANCELLED, NO_SHOW).
- **Notification**: Audit log of alerts sent to the user.

*(See `prisma/schema.prisma` for the exact schema).*

---

## 🔑 Authentication Flow

We utilize a stateless access token paired with a stateful refresh token.
1. **POST `/auth/register`**: Hashes password using Argon2 and sends an email verification token.
2. **GET `/auth/verify-email?token=...`**: Activates the account.
3. **POST `/auth/login`**: Returns short-lived `accessToken` and long-lived `refreshToken`.
4. **POST `/auth/refresh`**: Exchanges a valid `refreshToken` for a new pair (Token Rotation).
5. **POST `/auth/logout`**: Revokes the refresh token.

---

## 🎫 Queue System & Concurrency

The core value proposition of QuickMeet is the Queue System.
When a user books a slot, the system uses a **Prisma Serializable Transaction** to:
1. Ensure the slot's `capacity` is not exceeded.
2. Assign the next incremental `queuePosition` for that specific slot.

If a user ahead in the queue cancels or is marked as "NO_SHOW", the system runs a **Queue Compaction** algorithm that decrements the `queuePosition` of everyone waiting behind them, and emits real-time updates.

---

## 🔌 WebSocket Events

Clients connect to the `/queue` namespace using their JWT token.

**Client -> Server (Subscribe)**
- Connect to namespace with `auth: { token: 'JWT' }`.
- Client automatically joins a room matching their `userId` and rooms for their active `slotId`s.

**Server -> Client (Emitted Events)**
- `queue:update`: Emitted when the queue moves (e.g., someone cancels). Includes new position and estimated wait time (ETA).
- `queue:your-turn`: Emitted when the user's position becomes `1`.

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. |
| `REDIS_URL` | Redis connection string (`redis://` or `rediss://`). |
| `PORT` | API Port (Default: 3000). |
| `JWT_ACCESS_SECRET` | Secret for short-lived access tokens. |
| `JWT_REFRESH_SECRET` | Secret for long-lived refresh tokens. |
| `JWT_ACCESS_EXPIRY` | Access token lifespan (e.g., `15m`). |
| `JWT_REFRESH_EXPIRY` | Refresh token lifespan (e.g., `7d`). |
| `ALLOWED_ORIGINS` | Comma-separated list of CORS origins (e.g., `https://quickmeet.app`). |
| `NOTIFICATION_PROVIDER` | Set to `expo` for real push notifications, or `console` for dev. |

---

## 🚀 Deployment Guide (Render + Neon + Upstash)

This backend is pre-configured for Serverless deployment.

1. **Database & Cache**: 
   - Provision Postgres on [Neon](https://neon.tech).
   - Provision Redis on [Upstash](https://upstash.com).
2. **Deploy to Render**:
   - Use the included `render.yaml` Blueprint.
   - Connect your GitHub repo and provide the `DATABASE_URL` and `REDIS_URL` secrets when prompted.
3. **Database Migration**:
   - Run the migration against production from your local machine:
     ```bash
     DATABASE_URL="your-neon-url" npx prisma migrate deploy
     ```

---

## 💻 Local Development

1. **Install Dependencies**: `npm install`
2. **Setup Database**: 
   - Start local Postgres and Redis.
   - Update `.env`.
   - `npx prisma migrate dev`
3. **Start the Server**:
   - `npm run start:dev` (Watch mode)
4. **Code Quality**:
   - `npm run lint` (ESLint)
   - `npm run typecheck` (TypeScript validation)

---

## 🧪 Testing Guide

We maintain strict test coverage for core workflows.
- **Unit Tests**: `npm run test`
- **E2E Tests**: `npm run test:e2e` (Requires local Postgres and Redis running).

Ensure you've set up `.env` correctly before running E2E tests, as they hit the live database instance.
