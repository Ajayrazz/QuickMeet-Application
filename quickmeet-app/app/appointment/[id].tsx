import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useAppointmentType } from '../../src/hooks/useAppointmentTypes';
import { useSlots } from '../../src/hooks/useSlots';
import { useCreateBooking } from '../../src/hooks/useBookings';
import { useAuthStore } from '../../src/stores/auth.store';
import { DateStrip } from '../../src/components/domain/DateStrip';
import { SlotCard } from '../../src/components/domain/SlotCard';
import { Slot } from '../../src/api/slots.api';
import { Button } from '../../src/components/ui/Button';
import { EmptyState, Badge } from '../../src/components/ui/Misc';

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
      <View className="flex-1 bg-background dark:bg-background-dark justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
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

    if (!user?.isEmailVerified) {
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
        <View className="p-6 bg-primary/10 dark:bg-primary-dark/20 rounded-b-3xl mb-4">
          <Badge label={type.category || 'General'} className="self-start mb-4" />
          <Text className="text-3xl font-bold text-text dark:text-text-dark mb-2">
            {type.title}
          </Text>
          <Text className="text-text-muted dark:text-text-muted-dark leading-relaxed">
            {type.description}
          </Text>
        </View>

        {/* Date Picker */}
        <Text className="text-lg font-bold text-text dark:text-text-dark px-6 mb-2">Select Date</Text>
        <DateStrip 
          selectedDate={selectedDate} 
          onSelectDate={(date) => {
            setSelectedDate(date);
            setSelectedSlot(null);
          }} 
        />

        {/* Slots */}
        <View className="px-6 mt-4">
          <Text className="text-lg font-bold text-text dark:text-text-dark mb-4">
            Available Times
          </Text>
          
          {isSlotsLoading ? (
            <ActivityIndicator size="small" color="#6366f1" />
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
            <Text className="text-center text-text-muted dark:text-text-muted-dark py-8">
              No slots available for this date.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-background/90 dark:bg-background-dark/90 border-t border-border dark:border-border-dark">
        <Button 
          label={isFull ? "Slot Full" : !user?.isEmailVerified ? "Verify Email to Book" : "Book This Slot"}
          onPress={handleBookSlot}
          disabled={!selectedSlot || createBooking.isPending || isFull}
          loading={createBooking.isPending}
        />
      </View>
    </View>
  );
}
