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
