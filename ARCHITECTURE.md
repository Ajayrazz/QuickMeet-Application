# QuickMeet Architecture & Design Decisions

This document outlines the high-level architecture, design decisions, and known limitations of the QuickMeet platform, a real-time smart appointment and queue management system.

## 1. System Architecture Overview

QuickMeet uses a decoupled client-server architecture:
- **Client (Frontend)**: Expo / React Native mobile application.
- **Server (Backend)**: NestJS REST API with WebSocket (Socket.IO) capabilities.
- **Database**: PostgreSQL (managed via Neon), queried through Prisma ORM.
- **Caching & Pub/Sub**: Upstash Redis (used for Socket.IO adapters and BullMQ workers).

### High-Level Data Flow
1. User logs in (JWT issued by NestJS).
2. User browses appointment types (REST `GET /appointment-types`).
3. User books a slot (REST `POST /bookings`).
4. The backend verifies capacity, processes the booking, and emits a WebSocket event `queue:update` via Redis Pub/Sub to all connected clients in that specific slot's "room".
5. The mobile client receives the event and invalidates the local TanStack Query cache to seamlessly update the UI in real time.

---

## 2. Key Design Decisions

### 2.1 Backend Frameowrk (NestJS)
We chose NestJS for its strict TypeScript integration, modular architecture, and built-in dependency injection. It enforces a domain-driven structure (e.g., Auth, Bookings, Queue modules) that ensures the codebase remains maintainable as it scales.

### 2.2 Real-Time Updates (WebSockets vs. Polling)
Given the nature of a waiting room, real-time feedback is essential. We implemented WebSockets via `Socket.IO` instead of standard HTTP polling to minimize network overhead and ensure immediate state propagation when an admin clicks "Call Next". We scoped WebSocket emissions to specific "Rooms" (using `slotId`) to prevent broadcasting updates to the entire user base.

### 2.3 Mobile State Management
Instead of coupling our data fetching to a global state store like Redux, we use **TanStack Query (React Query)** for server state (caching, deduplication, optimistic updates) and **Zustand** purely for global client state (session token, theme preference). This prevents "state bloat" and simplifies offline handling.

### 2.4 Offline Capabilities & Graceful Degradation
Mobile networks are unreliable. If the WebSocket disconnects, the app falls back to a 30-second polling interval via React Query. We also implemented an `OfflineBanner` that visually indicates loss of connection and pauses mutation requests until the network is restored.

### 2.5 Security & Authentication
- **Token Rotation**: We use short-lived Access Tokens (JWT) and long-lived Refresh Tokens. The mobile app utilizes an Axios interceptor to seamlessly refresh the access token upon encountering a `401 Unauthorized` response, ensuring the user is never abruptly logged out.
- **Password Hashing**: `argon2` is utilized for secure password hashing.

---

## 3. Known Limitations & Future Work

While QuickMeet is a production-ready MVP, several scope simplifications were made:

### 3.1 Single-Tier Admin Role
**Limitation**: Currently, any user with the `ADMIN` role has global access to all appointment types and queues.
**Future Work**: Implement a multi-tenant RBAC (Role-Based Access Control) system where admins belong to specific "Organizations" or "Locations", restricting their view to only their assigned queues.

### 3.2 Notification Delivery Infrastructure
**Limitation**: The system currently relies exclusively on Expo Push Notifications.
**Future Work**: Integrate AWS SNS, Twilio, or SendGrid to provide SMS and Email fallbacks for users who have disabled push notifications or do not have the app actively installed.

### 3.3 Analytics Complexity
**Limitation**: Analytics currently provide basic daily aggregation (bookings per day, no-show rates).
**Future Work**: Implement a dedicated OLAP database (like ClickHouse) or use TimescaleDB for complex time-series queries to generate advanced insights (e.g., average wait time fluctuations by hour).

### 3.4 Automated End-to-End Device Testing
**Limitation**: Testing relies on Jest unit/integration tests and manual smoke testing.
**Future Work**: Introduce Detox or Appium, combined with an AWS Device Farm or BrowserStack, to execute automated E2E tests on physical iOS and Android devices during the CI/CD pipeline.
