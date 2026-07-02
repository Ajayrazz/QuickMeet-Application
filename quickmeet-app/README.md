# QuickMeet Mobile App (Phase 5)

This is the Expo/React Native frontend for QuickMeet.

## Architecture & Tech Stack
- **Framework**: Expo (SDK 52), React Native, Expo Router.
- **Styling**: NativeWind v4 (Tailwind CSS) with custom dark mode and premium tokens.
- **State & Storage**: Zustand + `expo-secure-store` for auth state and theme persistence.
- **API Client**: Axios with automatic `401` refresh token rotation interceptors.
- **Validation**: `react-hook-form` and `zod` for strict frontend validations matching the backend DTOs.

## Auth Flow Manual Test Checklist (Phase 5)

Since E2E testing on devices is out of scope for this phase, please verify the implementation manually using the following checklist against your local backend:

1. **Onboarding**: Open the app fresh. Swipe through the 3 onboarding screens. Click "Get Started" and verify it navigates to `/login`.
2. **Registration**: Go to "Sign Up". Provide invalid details (e.g. short password) to trigger Zod validation. Provide valid details, verify success toast, and check email (or console) for verification link.
3. **Verification Gate**: Log in with an unverified account. Verify it automatically redirects to the `/verify-pending` screen.
4. **Login**: Log in with a verified account. Verify successful routing to the Home `(tabs)` screen.
5. **Dark Mode**: On the Home screen, toggle dark mode. Ensure `SecureStore` persists the choice upon reload.
6. **Token Refresh (Interceptor)**: Manually alter your `accessToken` in the `auth.store` or wait 15 minutes. Trigger any secured endpoint and verify Axios seamlessly calls `/auth/refresh` behind the scenes without logging you out.
7. **Logout**: Click logout and verify the session is wiped from `SecureStore`.

## Booking Flow Manual Test Checklist (Phase 6)
1. **Home/Browse**: Log in and land on the Home tab. Verify the Appointment Types fetch correctly. Try the Search Bar to filter list dynamically.
2. **Slot Selection**: Tap an appointment type. Verify the Horizontal Date Strip defaults to today. Tap around and verify slots render properly. Verify color-coded capacity states (Full, almost full, plenty).
3. **Booking**: Tap an open slot. Verify the confirmation alert pops up. Confirm and watch the optimistic mutation trigger a success toast and routing to the QR ticket.
4. **Race Condition (Optional)**: If you can run 2 simulators, attempt to book the last remaining slot at the exact same time to trigger the graceful 409 UI Toast.
5. **QR Ticket**: Ensure the ticket renders the QR code. Confirm the static Queue position + ETA loads in the sub-component beneath it.
6. **Cancel Booking**: Scroll down on the ticket and press Cancel. Verify the alert pops up, then routes you back to History. 
7. **History Tab**: Navigate to the History (Calendar icon) tab. Verify Upcoming, Past, and Cancelled tabs properly filter the bookings and render their correct Empty States if no data exists.

## Scripts
- `npm start`: Start Expo Metro Bundler
- `npm run ios`: Start in iOS Simulator
- `npm run android`: Start in Android Emulator
- `npm test`: Run Jest unit tests
