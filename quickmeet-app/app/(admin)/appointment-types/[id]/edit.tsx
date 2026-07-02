import React, { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAppointmentType, useUpdateAppointmentType } from '../../../../src/hooks/useMyAppointmentTypes';
import { useAppointmentType } from '../../../../src/hooks/useAppointmentTypes';
import { Input } from '../../../../src/components/ui/Input';
import { Button } from '../../../../src/components/ui/Button';
import { Card } from '../../../../src/components/ui/Card';
import { Skeleton } from '../../../../src/components/ui/Misc';

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  category: z.string().min(2, 'Category is required'),
  location: z.string().min(2, 'Location is required'),
  avgServiceDurationMinutes: z.coerce.number().min(5, 'Duration must be at least 5 minutes'),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export default function AppointmentTypeEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = id && id !== 'new';
  const router = useRouter();

  const { data: appointmentType, isLoading: isLoadingInitial } = useAppointmentType(isEditing ? id : '');
  const createMutation = useCreateAppointmentType();
  const updateMutation = useUpdateAppointmentType(id || '');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<any>({
    // @ts-ignore
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      location: '',
      avgServiceDurationMinutes: 15,
      isActive: true,
    }
  });

  useEffect(() => {
    if (isEditing && appointmentType) {
      reset({
        title: appointmentType.title,
        description: appointmentType.description,
        category: appointmentType.category,
        location: appointmentType.location,
        avgServiceDurationMinutes: appointmentType.avgServiceDurationMinutes,
        isActive: appointmentType.isActive,
      });
    }
  }, [isEditing, appointmentType, reset]);

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate(data, {
        onSuccess: () => router.back()
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => router.back()
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingInitial) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark p-6">
        <Skeleton className="w-1/2 h-8 mb-6 mt-4" />
        <Card className="p-4">
          <Skeleton className="w-1/4 h-4 mb-2" />
          <Skeleton className="w-full h-12 mb-4 rounded-xl" />
          <Skeleton className="w-1/4 h-4 mb-2" />
          <Skeleton className="w-full h-24 mb-4 rounded-xl" />
          <Skeleton className="w-1/4 h-4 mb-2" />
          <Skeleton className="w-full h-12 mb-6 rounded-xl" />
          <Skeleton className="w-full h-12 rounded-xl" />
        </Card>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark p-6">
      <Text className="text-3xl font-bold text-text dark:text-text-dark mb-6">
        {isEditing ? 'Edit Service' : 'New Service'}
      </Text>

      <Card className="p-4 mb-24">
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Title"
              placeholder="e.g. Standard Haircut"
              value={value}
              onChangeText={onChange}
              error={errors.title?.message as string}
            />
          )}
        />
        
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Description"
              placeholder="Brief description of the service"
              value={value}
              onChangeText={onChange}
              error={errors.description?.message as string}
              multiline
              numberOfLines={3}
            />
          )}
        />

        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Category"
              placeholder="e.g. Barber, Health"
              value={value}
              onChangeText={onChange}
              error={errors.category?.message as string}
            />
          )}
        />

        <Controller
          control={control}
          name="location"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Location"
              placeholder="e.g. Room 101 or Virtual"
              value={value}
              onChangeText={onChange}
              error={errors.location?.message as string}
            />
          )}
        />

        <Controller
          control={control}
          name="avgServiceDurationMinutes"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Average Duration (minutes)"
              placeholder="15"
              value={value?.toString()}
              onChangeText={onChange}
              keyboardType="number-pad"
              error={errors.avgServiceDurationMinutes?.message as string}
            />
          )}
        />

        {isEditing && (
          <View className="flex-row justify-between items-center mt-2 mb-6">
            <Text className="text-text dark:text-text-dark font-medium">Active (Visible to users)</Text>
            <Controller
              control={control}
              name="isActive"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={value ? '#6366f1' : '#f4f3f4'}
                />
              )}
            />
          </View>
        )}

        <View className="mt-4">
          <Button
            label={isEditing ? "Save Changes" : "Create Service"}
            onPress={handleSubmit(onSubmit as any)}
            loading={isSubmitting}
          />
        </View>
      </Card>
    </ScrollView>
  );
}
