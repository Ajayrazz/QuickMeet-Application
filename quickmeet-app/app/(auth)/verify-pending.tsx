import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { MailWarning } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/auth.store';
import { apiClient } from '../../src/api/client';
import { useToastStore } from '../../src/stores/toast.store';

export default function VerifyPendingScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const showToast = useToastStore((state) => state.show);
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    setIsLoading(true);
    try {
      // Assuming backend has a resend-verification endpoint, adjust as needed.
      await apiClient.post('/auth/resend-verification', { email: user?.email });
      showToast({ message: 'Verification email resent!', type: 'success' });
    } catch (error) {
      showToast({ message: 'Failed to resend verification email.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark items-center justify-center px-6">
      <View className="bg-amber-100 dark:bg-amber-900/30 p-6 rounded-full mb-8">
        <MailWarning size={64} className="text-amber-600 dark:text-amber-400" />
      </View>
      
      <Text className="text-3xl font-bold text-text dark:text-text-dark text-center mb-4">
        Verify Your Email
      </Text>
      
      <Text className="text-text-muted dark:text-text-muted-dark text-center mb-8 text-base">
        You need to verify your email address ({user?.email}) before you can book appointments and join the queue.
      </Text>

      <Button
        label="Resend Email"
        onPress={handleResend}
        loading={isLoading}
        className="w-full mb-4"
      />
      
      <Button
        label="Log Out"
        variant="ghost"
        onPress={handleLogout}
        className="w-full"
      />
    </View>
  );
}
