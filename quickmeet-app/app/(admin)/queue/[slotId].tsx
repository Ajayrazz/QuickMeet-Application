import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQueueSnapshot } from '../../../src/hooks/useBookings';
import { useQueueSocket } from '../../../src/hooks/useQueueSocket';
import { useAdminQueueActions } from '../../../src/hooks/useAdminQueueActions';
import { QueueControlRow } from '../../../src/components/domain/QueueControlRow';
import { EmptyState, Skeleton } from '../../../src/components/ui/Misc';
import { Card } from '../../../src/components/ui/Card';

export default function AdminQueueControlScreen() {
  const { slotId } = useLocalSearchParams<{ slotId: string }>();
  
  // Use the same snapshot + socket hook from Phase 7.
  const { data: queueSnapshot, isLoading: isQueueLoading } = useQueueSnapshot(slotId);
  const { fullQueue, isConnected } = useQueueSocket(slotId, queueSnapshot || undefined);
  
  const { serveBooking, isServing, servingId, markNoShow, isMarkingNoShow, noShowId } = useAdminQueueActions();

  const handleCallNext = (bookingId: string) => {
    serveBooking(bookingId);
  };

  const handleNoShow = (bookingId: string) => {
    markNoShow(bookingId);
  };

  if (isQueueLoading) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark p-6 pt-12">
        <Skeleton className="w-1/2 h-8 mb-6" />
        <Card className="h-20 mb-4 p-4 flex-row items-center">
          <Skeleton className="w-10 h-10 rounded-full mr-4" />
          <View className="flex-1"><Skeleton className="w-2/3 h-5 mb-2" /><Skeleton className="w-1/3 h-4" /></View>
        </Card>
        <Card className="h-20 mb-4 p-4 flex-row items-center">
          <Skeleton className="w-10 h-10 rounded-full mr-4" />
          <View className="flex-1"><Skeleton className="w-2/3 h-5 mb-2" /><Skeleton className="w-1/3 h-4" /></View>
        </Card>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-text dark:text-text-dark mb-1">Live Queue</Text>
        <View className="flex-row items-center">
          <View className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <Text className="text-sm text-text-muted dark:text-text-muted-dark">
            {isConnected ? 'Connected & Live' : 'Reconnecting...'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerClassName="p-6 pb-32">
        {fullQueue.length > 0 ? (
          fullQueue.map((item, index) => {
            const isProcessing = (isServing && servingId === item.bookingId) || (isMarkingNoShow && noShowId === item.bookingId);
            return (
              <QueueControlRow
                key={item.bookingId || item.userId}
                item={item}
                isNext={index === 0}
                onCallNext={handleCallNext}
                onNoShow={handleNoShow}
                isProcessing={isProcessing}
              />
            );
          })
        ) : (
          <EmptyState
            title="Queue is empty"
            description="Nobody is waiting for this slot currently."
          />
        )}
      </ScrollView>
    </View>
  );
}
