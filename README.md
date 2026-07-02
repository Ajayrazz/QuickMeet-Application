# QuickMeet 🚀

A modern, full-stack appointment booking and real-time queue management platform built with **NestJS**, **React Native (Expo)**, **PostgreSQL**, and **Socket.IO**.

QuickMeet bridges the gap between online appointment booking and physical waiting rooms by providing live queue updates, QR-based check-ins, push notifications, and an intuitive admin dashboard for managing appointments and customer flow.

---

## ✨ Features

### 👤 User Features

* Secure user authentication with JWT
* Browse available appointment types
* Book appointments with available time slots
* View booking history
* Receive a digital QR code for check-in
* Track live queue position and estimated waiting time
* Receive push notifications when it's almost your turn
* Dark mode support

### 🛠️ Admin Features

* Secure admin authentication
* Create, update, and delete appointment types
* Manage appointment slots
* Real-time queue management
* Scan QR codes for customer check-in
* Mark appointments as:

  * Pending
  * In Progress
  * Completed
  * No Show
* View booking statistics and analytics

---

## 🏗️ Tech Stack

### Backend

* NestJS
* TypeScript
* PostgreSQL
* Prisma ORM
* JWT Authentication
* Argon2 Password Hashing
* Socket.IO
* Class Validator
* Class Transformer

### Mobile App

* React Native
* Expo
* Expo Router
* NativeWind
* Zustand
* TanStack Query
* React Hook Form
* Zod
* Expo Secure Store
* Expo Notifications

---

## 📁 Project Structure

```text
QuickMeet/
│
├── quickmeet-api/
│   ├── prisma/
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── .env
│
├── quickmeet-app/
│   ├── app/
│   ├── src/
│   ├── assets/
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

* Node.js 18+
* PostgreSQL
* npm or yarn
* Expo Go (for mobile testing)

---

## Backend Setup

Navigate to the backend folder.

```bash
cd quickmeet-api
```

Install dependencies.

```bash
npm install
```

Create a `.env` file.

```env
DATABASE_URL="postgresql://user:password@localhost:5432/quickmeet?schema=public"

JWT_SECRET="your-secret"

JWT_REFRESH_SECRET="your-refresh-secret"

PORT=3000
```

Run Prisma migrations.

```bash
npx prisma migrate dev
```

Start the backend.

```bash
npm run start:dev
```

Backend will run on:

```
http://localhost:3000
```

---

## Mobile App Setup

Navigate to the mobile application.

```bash
cd ../quickmeet-app
```

Install dependencies.

```bash
npm install
```

Create a `.env` file.

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000

EXPO_PUBLIC_WS_URL=ws://YOUR_LOCAL_IP:3000
```

Start Expo.

```bash
npx expo start --clear
```

Scan the QR code using Expo Go.

---

# 🔐 Authentication

QuickMeet uses:

* JWT Access Tokens
* Refresh Token Rotation
* Argon2 Password Hashing
* Role-Based Authorization

Available roles:

* USER
* ADMIN

To promote a user to an administrator:

```sql
UPDATE "User"
SET role='ADMIN'
WHERE email='your-email@example.com';
```

---

# ⚡ Real-Time Features

* Live queue updates using Socket.IO
* Automatic queue position updates
* Estimated waiting time
* QR-based check-in
* Push notifications
* Automatic token refresh
* Live synchronization across connected devices

---

# 📊 Architecture

```text
React Native App
        │
        │ REST API + WebSockets
        ▼
NestJS Backend
        │
        ▼
Prisma ORM
        │
        ▼
PostgreSQL
```

---

# 📱 Screens

* Login
* Register
* Home
* Book Appointment
* Appointment Details
* QR Ticket
* Queue Tracking
* Profile
* Admin Dashboard
* Queue Management
* QR Scanner
* Analytics

---

# 📦 API Modules

* Authentication
* Users
* Appointment Types
* Slots
* Bookings
* Queue
* Notifications
* Analytics

---

# 🚀 Future Improvements

* Email notifications
* SMS reminders
* Payment integration
* Calendar synchronization
* Multi-branch support
* Doctor/Service provider scheduling
* AI-powered waiting time prediction

---

# 📄 License

This project is intended for educational and portfolio purposes.

---

## 👨‍💻 Author

Developed with ❤️ using modern full-stack technologies including NestJS, React Native, Expo, PostgreSQL, Prisma, Socket.IO, and TypeScript.
