import React, { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, KeyRound } from 'lucide-react-native';

import { resetPasswordSchema, ResetPasswordInput } from '../../src/lib/validation/auth.schema';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { apiClient } from '../../src/api/client';
import { useToastStore } from '../../src/stores/toast.store';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const showToast = useToastStore((state) => state.show);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenParam, setTokenParam] = useState<string>('');

  useEffect(() => {
    if (params.token && typeof params.token === 'string') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTokenParam(params.token);
    }
  }, [params.token]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!tokenParam) {
      showToast({ message: 'Reset token is missing.', type: 'error' });
      return;
    }
    
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token: tokenParam,
        newPassword: data.password,
      });
      showToast({ message: 'Password reset successfully! You can now log in.', type: 'success' });
      router.replace('/(auth)/login');
    } catch (error: any) {
      showToast({
        message: error.response?.data?.message || 'Failed to reset password',
        type: 'error',
      });
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
            Create New Password
          </Text>
          <Text className="text-text-muted dark:text-text-muted-dark text-base">
            Your new password must be different from previous used passwords.
          </Text>
        </View>

        {!params.token && (
          <Input
            label="Reset Token"
            placeholder="Paste token here if not filled"
            value={tokenParam}
            onChangeText={setTokenParam}
            leftIcon={<KeyRound size={20} className="text-gray-400" />}
          />
        )}

        <View className="space-y-4">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="New Password"
                placeholder="********"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
                leftIcon={<Lock size={20} className="text-gray-400" />}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm New Password"
                placeholder="********"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.confirmPassword?.message}
                leftIcon={<Lock size={20} className="text-gray-400" />}
              />
            )}
          />

          <Button
            label="Reset Password"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={!isValid || isLoading || !tokenParam}
            className="w-full mt-4 mb-6"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
