import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/auth.store';
import { useUIStore } from '../../src/stores/ui.store';
import { useRouter } from 'expo-router';

export default function TabsIndexPlaceholder() {
  const { user, clearSession } = useAuthStore();
  const { colorScheme, setColorScheme } = useUIStore();
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark px-6 space-y-4">
      <Text className="text-2xl font-bold text-text dark:text-text-dark">
        Welcome, {user?.name}!
      </Text>
      <Text className="text-text-muted dark:text-text-muted-dark text-center">
        This is a placeholder for the Tabs navigation (Phase 6+).
      </Text>

      <View className="flex-row space-x-4 mt-8">
        <Button
          label="Toggle Dark Mode"
          variant="secondary"
          onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
        />
        <Button label="Log Out" variant="destructive" onPress={handleLogout} />
      </View>
    </View>
  );
}
