import { useEffect } from 'react';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../src/stores/auth.store';
import { useUIStore } from '../src/stores/ui.store';
import { ToastProvider } from '../src/components/ui/Toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View } from 'react-native';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { OfflineBanner } from '../src/components/OfflineBanner';

import '../src/global.css';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const { hasSeenOnboarding, colorScheme } = useUIStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return; // Wait for the root navigation to mount

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inAdminGroup = (segments[0] as string) === '(admin)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated) {
      if (!hasSeenOnboarding && !inOnboardingGroup) {
        router.replace('/(onboarding)');
      } else if (hasSeenOnboarding && !inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      const isAdmin = user?.role === 'ADMIN';

      if (inAuthGroup || inOnboardingGroup) {
        // Just logged in or already logged in
        if (isAdmin) {
          router.replace('/(admin)/dashboard' as any);
        } else {
          router.replace('/(tabs)');
        }
      } else if (inAdminGroup && !isAdmin) {
        // Prevent non-admins from accessing admin routes
        router.replace('/(tabs)');
      } else if (!inAdminGroup && isAdmin) {
        // Force admins into admin routes
        router.replace('/(admin)/dashboard' as any);
      }
    }
  }, [isAuthenticated, hasSeenOnboarding, segments, user, rootNavigationState?.key]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <View className={`flex-1 bg-background dark:bg-background-dark ${colorScheme === 'dark' ? 'dark' : ''}`}>
          <OfflineBanner />
          <Slot />
          <ToastProvider />
        </View>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
