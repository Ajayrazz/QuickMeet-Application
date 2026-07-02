# QuickMeet 🚀

**QuickMeet** is a production-grade, real-time smart appointment and queue management platform. It bridges the gap between digital bookings and physical waiting rooms, eliminating long wait times and providing a seamless, live-updated experience for both end-users and service providers.

This repository contains the complete full-stack application, divided into two main workspaces:
- **`quickmeet-api`**: The robust backend built with NestJS.
- **`quickmeet-app`**: The cross-platform mobile application built with React Native and Expo.

---

## 🌟 Key Features

### For Users (End-Users)
- **Smart Booking Flow**: Browse available appointment types and seamlessly book time slots.
- **Real-Time Queue Tracking**: Live updates on queue position and Estimated Time of Arrival (ETA) powered by WebSockets.
- **Digital QR Tickets**: Secure QR code generation for quick check-ins at the physical location.
- **Push Notifications**: Receive instant alerts when it's your turn to proceed to the desk.

### For Admins (Service Providers)
- **Role-Based Admin Dashboard**: A gated interface to manage the entire service operation.
- **Service & Slot Management**: Create, edit, and publish appointment types and time slots dynamically.
- **Live Queue Control**: A real-time control center to manually adjust queue statuses (e.g., mark as "In Progress", "Completed", or "No Show").
- **QR Scanning**: Built-in camera integration to scan user QR tickets and instantly retrieve booking details.
- **Business Analytics**: High-level metrics tracking total bookings and slot utilization over time.

---

## 🏗 Tech Stack

### Backend (`quickmeet-api`)
- **Framework**: [NestJS](https://nestjs.com/) (TypeScript strict mode)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT access tokens, Refresh Token rotation, and secure password hashing via `argon2`.
- **Real-Time**: [Socket.IO](https://socket.io/) (via `@nestjs/platform-socket.io`) for live queue updates on the `/queue` namespace.
- **Validation & Serialization**: `class-validator` and `class-transformer`.
- **Architecture**: Domain-driven modules (Auth, Users, AppointmentTypes, Slots, Bookings, Queue, Notifications, Analytics).

### Mobile App (`quickmeet-app`)
- **Framework**: [Expo](https://expo.dev/) (React Native) with managed workflow.
- **Routing**: Expo Router (file-based navigation with layout groups like `(auth)`, `(tabs)`, and `(admin)`).
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native) featuring a complete custom Design System with Dark Mode support.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for global client state (e.g., Auth Session).
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/v5) (React Query) for caching and synchronizing server state.
- **Forms & Validation**: React Hook Form combined with Zod for strict type-safe schemas.
- **Local Storage**: `expo-secure-store` for secure token persistence.

---

## 📂 Repository Structure

```
QuickMeet-Application/
├── quickmeet-api/          # NestJS Backend Project
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── modules/        # Feature modules (auth, bookings, queue, etc.)
│   │   ├── common/         # Global guards, decorators, and interceptors
│   │   └── main.ts         # App entry point
│   └── test/               # E2E test suites
│
├── quickmeet-app/          # Expo / React Native Mobile App
│   ├── app/                # Expo Router file-based navigation tree
│   │   ├── (auth)/         # Unauthenticated routes (Login, Register)
│   │   ├── (tabs)/         # Standard user routes (Home, Profile, Bookings)
│   │   └── (admin)/        # Gated admin-only routes (Dashboard, Queue Control)
│   ├── src/
│   │   ├── api/            # Axios clients and TanStack Query fetchers
│   │   ├── components/     # Reusable UI kit and domain-specific components
│   │   ├── hooks/          # Custom React hooks (Socket sync, push registration)
│   │   ├── lib/            # Utilities (Socket.IO client, classnames merger)
│   │   └── stores/         # Zustand global stores
│   └── tailwind.config.js  # NativeWind theme configuration
└── README.md               # Global project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Running locally or via Docker)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your physical device (for testing push notifications/camera)

### 1. Backend Setup (`quickmeet-api`)

1. **Navigate to the backend directory**:
   ```bash
   cd quickmeet-api
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Configuration**:
   Create a `.env` file in the root of `quickmeet-api`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/quickmeet?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key"
   PORT=3000
   ```
4. **Database Migrations**:
   Apply the Prisma schema to your PostgreSQL instance:
   ```bash
   npx prisma migrate dev
   ```
5. **Start the Server**:
   ```bash
   npm run start:dev
   ```

### 2. Mobile App Setup (`quickmeet-app`)

1. **Navigate to the frontend directory**:
   ```bash
   cd ../quickmeet-app
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Configuration**:
   Create a `.env` file in the root of `quickmeet-app`:
   ```env
   # Replace with your local machine's IP address (e.g., 192.168.1.x)
   EXPO_PUBLIC_API_URL="http://<YOUR_LOCAL_IP>:3000"
   EXPO_PUBLIC_WS_URL="ws://<YOUR_LOCAL_IP>:3000"
   ```
4. **Start the Expo Development Server**:
   ```bash
   npx expo start --clear
   ```
5. **Run on Device**:
   Scan the QR code displayed in the terminal using the Expo Go app on your iOS or Android device.

---

## 🔐 Authentication & Roles

QuickMeet supports two main user roles: `USER` and `ADMIN`.
By default, new sign-ups are assigned the `USER` role.

To test the Admin functionality, you can manually update a user's role directly in the PostgreSQL database:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

---

## 💡 System Architecture Highlights

- **JWT Token Rotation**: The mobile app seamlessly intercepts 401 Unauthorized responses via Axios interceptors, silently requesting a new access token using the stored refresh token, ensuring the user stays logged in securely without disruption.
- **WebSocket Synchronization**: The mobile client maintains a persistent Socket.IO connection. The backend broadcasts `queue:update` and `queue:your-turn` events targeted precisely to specific Slot rooms, minimizing network overhead.
- **Push Notification Pipeline**: The app requests device push tokens using `expo-notifications`, securely stores them in the backend database, and processes triggered server-side events to alert users even when the app is backgrounded.

---
*Developed with modern best practices for performance, strict type-safety, and elegant UI/UX design.*
