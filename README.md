# QuickMeet 🚀

**QuickMeet** is a production-grade, real-time smart appointment and queue management platform. It bridges the gap between digital bookings and physical waiting rooms, eliminating long wait times and providing a seamless, live-updated experience for both end-users and service providers. 

This repository contains the complete full-stack application, divided into two main workspaces:
- **`quickmeet-api`**: The robust backend built with NestJS, featuring real-time WebSockets and secure auth.
- **`quickmeet-app`**: The cross-platform mobile application built with React Native and Expo, featuring a premium custom design system.

---

## 🏗 Architecture & System Design

QuickMeet utilizes a decoupled client-server architecture designed for real-time responsiveness and scalability.

```mermaid
graph TD
    Client[React Native App] --> |REST API| API[NestJS API]
    Client <--> |WebSockets| WSS[Socket.IO Server]
    API --> |Prisma ORM| DB[(PostgreSQL on Neon)]
    API <--> |Pub/Sub| Redis[(Upstash Redis)]
    WSS <--> |Pub/Sub| Redis
```

**Key System Components:**
- **NestJS API**: Handles core business logic, secure authentication (JWT access/refresh tokens via `argon2`), and domain-driven REST endpoints.
- **WebSocket Gateway**: A Socket.IO gateway handles persistent real-time connections, allowing the server to broadcast `queue:update` events directly to clients when their queue position changes, avoiding aggressive HTTP polling.
- **PostgreSQL Database**: Managed via Neon.tech.
- **Redis Cache**: Managed via Upstash. Used for BullMQ background job processing (notifications) and Socket.IO multi-node Redis Adapters.
- **Mobile Client**: Expo/React Native app utilizing TanStack Query for server-state caching, optimistic UI updates, and WebSocket event invalidations.

*For more details, see [ARCHITECTURE.md](./ARCHITECTURE.md).*

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Neon)
- Redis (Local or Upstash)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your physical device

### 1. Backend (`quickmeet-api`)
```bash
cd quickmeet-api
npm install
```
**Environment Configuration**: Create `.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/quickmeet"
REDIS_URL="redis://localhost:6379"
JWT_ACCESS_SECRET="secret"
JWT_REFRESH_SECRET="refresh-secret"
PORT=3000
ALLOWED_ORIGINS="*"
```
**Database Setup**:
```bash
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### 2. Mobile App (`quickmeet-app`)
```bash
cd ../quickmeet-app
npm install
```
**Environment Configuration**: Create `.env` (Replace with your local IP)
```env
EXPO_PUBLIC_API_URL="http://192.168.1.100:3000"
EXPO_PUBLIC_WS_URL="ws://192.168.1.100:3000"
```
**Start the App**:
```bash
npx expo start --clear
```

---

## 🌍 Deployment Instructions

### Backend (Render / Railway)
1. Provision a PostgreSQL database on [Neon](https://neon.tech/) and a Redis instance on [Upstash](https://upstash.com/).
2. Connect your GitHub repository to Render as a "Web Service".
3. Render will automatically detect the `render.yaml` configuration in the `quickmeet-api` folder.
4. Set the environment variables (`DATABASE_URL`, `REDIS_URL`, etc.) in the Render Dashboard.
5. The deployment will automatically run `npm install && npm run build && npx prisma migrate deploy` and start the server.
6. Verify deployment by visiting `https://your-api-url.onrender.com/health`.

### Database Seeding (Production)
Once the backend is live, you can seed the production database locally by running:
```bash
DATABASE_URL="your_neon_production_url" npx prisma db seed
```
This populates the database with realistic demo data, including Admin accounts (`admin@quickmeet.com` / `password123`), Appointment Types, and historical/upcoming bookings.

### Mobile App (EAS Build)
1. Install EAS CLI: `npm install -g eas-cli`
2. Run `eas login` and `eas build:configure`. The `eas.json` is already provided.
3. To generate an internal preview build for physical devices (APK / iOS Simulator):
   ```bash
   eas build --profile preview --platform android
   ```
4. Install the resulting binary on your device.

---

## 🧪 End-to-End Smoke Test Checklist

Once the system is deployed or running locally, verify the core functionality using this script:

- [ ] **Onboarding & Auth**: Register a new user, log in, and verify you are routed to the Home tab.
- [ ] **Booking Flow**: Browse available slots, book an open slot, and view your generated QR Ticket.
- [ ] **Slot Capacity Handling**: Open a second device/session, attempt to book the same slot to fill its capacity, and confirm the system gracefully handles the 409 Slot Full error with a toast.
- [ ] **Real-Time Queue Compaction**: Book an upcoming slot. Have another user book the same slot. Cancel your booking, and verify the other user's queue position instantly updates on their screen without refreshing.
- [ ] **Admin Queue Control**: Log in as the seeded admin (`admin@quickmeet.com` / `password123`). Navigate to the Queue Control Dashboard. Hit "Call Next" on a booking and verify the end-user receives a push notification and their UI updates to "It's your turn!".
- [ ] **Analytics**: Verify the Admin Dashboard correctly reflects the total bookings and completion rates.
