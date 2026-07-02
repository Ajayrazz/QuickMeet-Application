import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock } from 'lucide-react-native';

import { loginSchema, LoginInput } from '../../src/lib/validation/auth.schema';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/stores/auth.store';
import { useToastStore } from '../../src/stores/toast.store';

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const showToast = useToastStore((state) => state.show);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', data);
      setSession(response.data.user, response.data.accessToken, response.data.refreshToken);
      showToast({ message: 'Welcome back!', type: 'success' });
      router.replace('/(tabs)');
    } catch (error: any) {
      showToast({
        message: error.response?.data?.message || 'Failed to login',
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
          <Text className="text-4xl font-bold text-text dark:text-text-dark mb-2">
            Welcome Back
          </Text>
          <Text className="text-text-muted dark:text-text-muted-dark text-base">
            Log in to manage your appointments and queue status.
          </Text>
        </View>

        <View className="space-y-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
                leftIcon={<Mail size={20} className="text-gray-400" />}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
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

          <View className="flex-row justify-end mb-6">
            <Link href="/(auth)/forgot-password">
              <Text className="text-primary dark:text-primary-light font-medium">
                Forgot Password?
              </Text>
            </Link>
          </View>

          <Button
            label="Log In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={!isValid || isLoading}
            className="w-full mb-6"
          />

          <View className="flex-row justify-center mt-4">
            <Text className="text-text-muted dark:text-text-muted-dark mt-6 text-center">Don&apos;t have an account?</Text>
            <Link href="/(auth)/register">
              <Text className="text-primary dark:text-primary-light font-bold">
                Sign Up
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
