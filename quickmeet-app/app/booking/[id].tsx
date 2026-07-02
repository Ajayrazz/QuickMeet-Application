import React from 'react';
import { View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBooking, useQueueSnapshot, useCancelBooking } from '../../src/hooks/useBookings';
import { useAuthStore } from '../../src/stores/auth.store';
import { QRTicket } from '../../src/components/domain/QRTicket';
import { QueuePositionBadge } from '../../src/components/domain/QueuePositionBadge';
import { EmptyState } from '../../src/components/ui/Misc';
import { Button } from '../../src/components/ui/Button';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const { data: booking, isLoading: isBookingLoading } = useBooking(id as string);
  const { data: queueSnapshot, isLoading: isQueueLoading } = useQueueSnapshot(booking?.slotId || '');
  const cancelBooking = useCancelBooking();

  if (isBookingLoading) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <EmptyState title="Ticket Not Found" description="This booking could not be found." />
      </View>
    );
  }

  // Find user's position in snapshot
  const myQueueData = queueSnapshot?.find(q => q.userId === user?.id);
  const position = myQueueData?.position ?? null;
  const eta = myQueueData?.etaMinutes ?? 0;

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? This action cannot be undone.",
      [
        { text: "No, Keep It", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: () => {
            cancelBooking.mutate(booking.id, {
              onSuccess: () => {
                router.replace('/(tabs)/bookings');
              }
            });
          }
        }
      ]
    );
  };

  const isCancellable = booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'IN_QUEUE';

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView contentContainerClassName="p-6 pb-24">
        <QRTicket booking={booking} />
        
        <View className="mt-2">
          <QueuePositionBadge 
            position={position} 
            eta={eta} 
            isLoading={isQueueLoading} 
          />
        </View>

        {isCancellable && (
          <View className="mt-8">
            <Button 
              label="Cancel Booking" 
              variant="destructive" 
              onPress={handleCancel}
              loading={cancelBooking.isPending}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
