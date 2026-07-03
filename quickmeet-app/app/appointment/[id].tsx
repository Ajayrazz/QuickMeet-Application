import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppointmentType } from '../../src/hooks/useAppointmentTypes';
import { useSlots } from '../../src/hooks/useSlots';
import { useCreateBooking } from '../../src/hooks/useBookings';
import { useAuthStore } from '../../src/stores/auth.store';
import { DateStrip } from '../../src/components/domain/DateStrip';
import { SlotCard } from '../../src/components/domain/SlotCard';
import { Slot } from '../../src/api/slots.api';
import { Button } from '../../src/components/ui/Button';
import { EmptyState, Badge, Skeleton } from '../../src/components/ui/Misc';

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const { data: type, isLoading: isTypeLoading } = useAppointmentType(id as string);
  const { data: slots, isLoading: isSlotsLoading } = useSlots(id as string, dateStr);
  
  const createBooking = useCreateBooking(id as string, dateStr);

  if (isTypeLoading) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <View className="p-6 bg-primary/10 dark:bg-primary-dark/20 rounded-b-3xl mb-4 pt-12 h-64">
          <Skeleton className="w-20 h-6 rounded-full mb-4 mt-8" />
          <Skeleton className="w-2/3 h-10 mb-2" />
          <Skeleton className="w-full h-4 mb-1" />
          <Skeleton className="w-3/4 h-4" />
        </View>
        <View className="p-6">
          <Skeleton className="w-1/3 h-6 mb-4" />
          <Skeleton className="w-full h-24 mb-8 rounded-full" />
          <Skeleton className="w-1/3 h-6 mb-4" />
          <Skeleton className="w-full h-20 mb-4 rounded-2xl" />
          <Skeleton className="w-full h-20 rounded-2xl" />
        </View>
      </View>
    );
  }

  if (!type) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <EmptyState title="Not found" description="This appointment type could not be loaded." />
      </View>
    );
  }

  const handleBookSlot = () => {
    if (!selectedSlot) return;

    if (!user?.isVerified) {
      router.push('/(auth)/verify-pending');
      return;
    }

    Alert.alert(
      "Confirm Booking",
      `Do you want to book ${type.title} on ${format(selectedDate, 'MMM d')} at ${format(new Date(selectedSlot.startTime), 'h:mm a')}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: () => {
            createBooking.mutate(selectedSlot.id, {
              onSuccess: (newBooking) => {
                router.replace(`/booking/${newBooking.id}`);
              }
            });
          }
        }
      ]
    );
  };

  const isFull = selectedSlot?.status === 'FULL' || (selectedSlot && selectedSlot.remainingCapacity <= 0);

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView contentContainerClassName="pb-32">
        {/* Header */}
        <LinearGradient
          colors={['#4f46e5', '#818cf8']}
          className="p-6 pt-16 pb-12 rounded-b-[40px] mb-6 shadow-md"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-4">
            <Text className="text-white font-bold text-xs">{type.category || 'General'}</Text>
          </View>
          <Text className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            {type.title}
          </Text>
          <Text className="text-indigo-100 leading-relaxed font-medium">
            {type.description}
          </Text>
        </LinearGradient>

        {/* Date Picker */}
        <Text className="text-xl font-bold text-text dark:text-text-dark px-6 mb-3">Select Date</Text>
        <DateStrip 
          selectedDate={selectedDate} 
          onSelectDate={(date) => {
            setSelectedDate(date);
            setSelectedSlot(null);
          }} 
        />

        {/* Slots */}
        <View className="px-6 mt-6">
          <Text className="text-xl font-bold text-text dark:text-text-dark mb-4">
            Available Times
          </Text>
          
          {isSlotsLoading ? (
            <View>
              <Skeleton className="w-full h-24 mb-4 rounded-2xl" />
              <Skeleton className="w-full h-24 mb-4 rounded-2xl" />
              <Skeleton className="w-full h-24 mb-4 rounded-2xl" />
            </View>
          ) : slots && slots.length > 0 ? (
            slots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                isSelected={selectedSlot?.id === slot.id}
                onPress={setSelectedSlot}
              />
            ))
          ) : (
            <EmptyState 
              title="No slots available" 
              description="There are no slots available for this date."
              className="py-8"
            />
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-6 left-6 right-6">
        <View className="p-4 bg-surface/90 dark:bg-surface-dark/90 rounded-3xl shadow-xl shadow-black/20">
          <Button 
            label={isFull ? "Slot Full" : !user?.isVerified ? "Verify Email to Book" : "Book This Slot"}
            onPress={handleBookSlot}
            disabled={!selectedSlot || createBooking.isPending || isFull}
            loading={createBooking.isPending}
            className="w-full"
          />
        </View>
      </View>
    </View>
  );
}
