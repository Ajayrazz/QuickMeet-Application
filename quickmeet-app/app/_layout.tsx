import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/stores/auth.store';
import { useUIStore } from '../src/stores/ui.store';
import { ToastProvider } from '../src/components/ui/Toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View } from 'react-native';

import '../src/global.css';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const { hasSeenOnboarding, colorScheme } = useUIStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!isAuthenticated) {
      if (!hasSeenOnboarding && !inOnboardingGroup) {
        router.replace('/(onboarding)');
      } else if (hasSeenOnboarding && !inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      if (inAuthGroup || inOnboardingGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, hasSeenOnboarding, segments]);

  return (
    <QueryClientProvider client={queryClient}>
      <View className={`flex-1 bg-background dark:bg-background-dark ${colorScheme === 'dark' ? 'dark' : ''}`}>
        <Slot />
        <ToastProvider />
      </View>
    </QueryClientProvider>
  );
}
