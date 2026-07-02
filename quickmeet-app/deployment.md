# QuickMeet Mobile App Deployment Guide

This guide walks through deploying the React Native (Expo) mobile app to production using Expo Application Services (EAS).

## 1. Configure Production API URLs

Before building the app, you need to point it to your live backend.

1. Open `quickmeet-app/eas.json`.
2. Locate the `"production"` and `"preview"` blocks.
3. Replace the `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_WS_URL` with the URL you received from Render (or your hosting provider).
   
*Example:*
```json
"production": {
  "env": {
    "EXPO_PUBLIC_API_URL": "https://quickmeet-api-xyz.onrender.com",
    "EXPO_PUBLIC_WS_URL": "wss://quickmeet-api-xyz.onrender.com"
  }
}
```

## 2. Build for Android (APK / AAB)

1. Open a terminal in the `quickmeet-app` folder.
2. Run the EAS build command for an Android APK (good for manual testing):
   ```bash
   npx eas build -p android --profile preview
   ```
   *Note: If you want to publish to the Google Play Store, build an AAB file by running:*
   ```bash
   npx eas build -p android --profile production
   ```
3. Follow the CLI prompts to log into your Expo account and generate a keystore (let Expo handle this automatically).
4. Wait for the build to finish on Expo's servers. You will be provided with a URL to download the `.apk` or `.aab` file.

## 3. Build for iOS

*Note: Building for iOS requires an Apple Developer Account ($99/yr).*

1. Run the EAS build command:
   ```bash
   npx eas build -p ios --profile production
   ```
2. Follow the prompts to log into your Apple account. Expo will automatically manage your provisioning profiles and certificates.
3. Once the build finishes, you can use Expo to automatically submit it to TestFlight:
   ```bash
   npx eas submit -p ios
   ```
