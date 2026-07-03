import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { loginSchema, LoginInput } from '../../src/lib/validation/auth.schema';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/stores/auth.store';
import { useToastStore } from '../../src/stores/toast.store';

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const showToast = useToastStore((state) => state.show);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

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
      const user = response.data.user;
      setSession(user, response.data.accessToken, response.data.refreshToken);
      showToast({ message: 'Welcome back!', type: 'success' });
      
      if (user.role === 'ADMIN') {
        router.replace('/(admin)/dashboard' as any);
      } else {
        router.replace('/(tabs)');
      }
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
      <ScrollView contentContainerClassName="flex-grow" bounces={false}>
        <LinearGradient
          colors={['#4f46e5', '#818cf8']}
          className="px-8 pb-32 rounded-b-[40px] shadow-lg"
          style={{ paddingTop: Math.max(insets.top + 20, 60) }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text className="text-4xl font-extrabold text-white mb-2 tracking-tight">
            Welcome Back
          </Text>
          <Text className="text-indigo-100 text-base font-medium opacity-90">
            Log in to manage your appointments and queue status.
          </Text>
        </LinearGradient>

        <View className="px-6 -mt-20 flex-1 pb-12">
          <Card className="p-8 shadow-xl shadow-indigo-500/10 rounded-3xl border border-white/50 dark:border-slate-800">
            <View className="space-y-5">
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
                    placeholder="••••••••"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                    leftIcon={<Lock size={20} className="text-gray-400" />}
                  />
                )}
              />

              <View className="flex-row justify-end mb-4">
                <Link href="/(auth)/forgot-password">
                  <Text className="text-indigo-600 dark:text-indigo-400 font-bold">
                    Forgot Password?
                  </Text>
                </Link>
              </View>

              <Button
                label="Log In"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={!isValid || isLoading}
                className="w-full mt-2"
              />
            </View>
          </Card>
          
          <View className="flex-row justify-center mt-12 mb-8">
            <Text className="text-text-muted dark:text-text-muted-dark font-medium text-base">Don't have an account? </Text>
            <Link href="/(auth)/register">
              <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-base">
                Sign Up
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
