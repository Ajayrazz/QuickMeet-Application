import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { apiClient } from '../../src/api/client';
import { useToastStore } from '../../src/stores/toast.store';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      showToast({ message: 'If an account exists, a reset link was sent.', type: 'info' });
      router.back();
    } catch (error) {
      showToast({ message: 'Failed to request reset.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background dark:bg-background-dark"
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
        <View className="mb-10">
          <Text className="text-3xl font-bold text-text dark:text-text-dark mb-2">
            Reset Password
          </Text>
          <Text className="text-text-muted dark:text-text-muted-dark text-base">
            Enter your email to receive a password reset link.
          </Text>
        </View>

        <Input
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          leftIcon={<Mail size={20} className="text-gray-400" />}
        />

        <Button
          label="Send Reset Link"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!email || isLoading}
          className="w-full mt-4"
        />
        
        <Button
          label="Back to Login"
          variant="ghost"
          onPress={() => router.back()}
          className="w-full mt-2"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
