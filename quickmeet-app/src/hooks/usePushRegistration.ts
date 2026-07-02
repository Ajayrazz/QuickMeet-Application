import { useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { registerPushToken } from '../api/users.api';
import { useAuthStore } from '../stores/auth.store';

let Notifications: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch {
  console.warn('expo-notifications is not available in Expo Go SDK 53+');
}

async function registerForPushNotificationsAsync() {
  if (!Notifications) return undefined;

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    // @ts-ignore - Ignore type error since this is dynamically loaded
    const { status: existingStatus } = await Notifications.getPermissionsAsync({});
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      // @ts-ignore
      const { status } = await Notifications.requestPermissionsAsync({});
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // Here we use a generic string to allow it to work without a strict EAS configuration for this local phase.
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId ?? 'dummy-project-id';
    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (e) {
      console.warn('Could not get push token', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export function usePushRegistration() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        registerPushToken(token).catch((err) => {
          console.warn('Failed to register push token with backend:', err);
        });
      }
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    if (Notifications) {
      notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
        console.log('Notification received in foreground:', notification);
      });

      // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
        const data = response.notification.request.content.data;
        if (data && data.relatedBookingId) {
          router.push(`/booking/${data.relatedBookingId}`);
        }
      });
    }

    return () => {
      if (Notifications) {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      }
    };
  }, [isAuthenticated, router]);
}
