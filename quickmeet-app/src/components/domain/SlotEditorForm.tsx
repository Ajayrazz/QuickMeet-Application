import React from 'react';
import { View, Text, Modal, Switch } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

const schema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Must be HH:MM format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Must be HH:MM format'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
}).refine(data => {
  const start = new Date(`1970-01-01T${data.startTime}:00`);
  const end = new Date(`1970-01-01T${data.endTime}:00`);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});

export type SlotFormData = z.infer<typeof schema>;

interface SlotEditorFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: SlotFormData) => void;
  isLoading?: boolean;
}

export function SlotEditorForm({ visible, onClose, onSubmit, isLoading }: SlotEditorFormProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      startTime: '',
      endTime: '',
      capacity: 10,
    }
  });

  const submitAndReset = (data: SlotFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-background dark:bg-background-dark rounded-t-3xl p-6">
          <Text className="text-2xl font-bold text-text dark:text-text-dark mb-6">Create Slot</Text>
          
          <Controller
            control={control}
            name="startTime"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Start Time (HH:MM)"
                placeholder="09:00"
                value={value}
                onChangeText={onChange}
                error={errors.startTime?.message as string}
              />
            )}
          />

          <Controller
            control={control}
            name="endTime"
            render={({ field: { onChange, value } }) => (
              <Input
                label="End Time (HH:MM)"
                placeholder="10:00"
                value={value}
                onChangeText={onChange}
                error={errors.endTime?.message as string}
              />
            )}
          />

          <Controller
            control={control}
            name="capacity"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Capacity"
                placeholder="10"
                value={value?.toString()}
                onChangeText={onChange}
                keyboardType="number-pad"
                error={errors.capacity?.message as string}
              />
            )}
          />

          <View className="flex-row justify-end mt-4">
            <Button
              label="Cancel"
              variant="ghost"
              className="mr-2"
              onPress={() => {
                reset();
                onClose();
              }}
            />
            <Button
              label="Create"
              onPress={handleSubmit(submitAndReset as any)}
              loading={isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
