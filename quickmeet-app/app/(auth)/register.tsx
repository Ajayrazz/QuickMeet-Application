import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User } from 'lucide-react-native';

import { registerSchema, RegisterInput } from '../../src/lib/validation/auth.schema';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { apiClient } from '../../src/api/client';
import { useToastStore } from '../../src/stores/toast.store';

export default function RegisterScreen() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      showToast({ message: 'Registration successful! Please check your email to verify your account.', type: 'success', duration: 5000 });
      router.replace('/(auth)/login');
    } catch (error: any) {
      showToast({
        message: error.response?.data?.message || 'Registration failed',
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
            Create Account
          </Text>
          <Text className="text-text-muted dark:text-text-muted-dark text-base">
            Join QuickMeet to simplify your appointments.
          </Text>
        </View>

        <View className="space-y-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full Name"
                placeholder="John Doe"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
                leftIcon={<User size={20} className="text-gray-400" />}
              />
            )}
          />

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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
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
            label="Sign Up"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={!isValid || isLoading}
            className="w-full mt-4 mb-6"
          />

          <View className="flex-row justify-center mt-2">
            <Text className="text-text-muted dark:text-text-muted-dark">
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login">
              <Text className="text-primary dark:text-primary-light font-bold">
                Log In
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
