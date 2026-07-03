import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
      <View className="flex-1 bg-background dark:bg-background-dark">
        <View className="px-6 pt-16 pb-12 rounded-b-[40px] mb-6 bg-indigo-900/10">
          <Skeleton className="w-1/2 h-10 mb-4" />
          <Skeleton className="w-1/3 h-5" />
        </View>
        <View className="px-6">
          <Card className="h-24 mb-4 p-5 flex-row items-center rounded-2xl">
            <Skeleton className="w-12 h-12 rounded-full mr-4" />
            <View className="flex-1"><Skeleton className="w-2/3 h-6 mb-2" /><Skeleton className="w-1/3 h-4" /></View>
          </Card>
          <Card className="h-24 mb-4 p-5 flex-row items-center rounded-2xl">
            <Skeleton className="w-12 h-12 rounded-full mr-4" />
            <View className="flex-1"><Skeleton className="w-2/3 h-6 mb-2" /><Skeleton className="w-1/3 h-4" /></View>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <LinearGradient
        colors={['#1e1b4b', '#4338ca']}
        className="px-6 pt-16 pb-10 rounded-b-[40px] shadow-md mb-6"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text className="text-4xl font-extrabold text-white tracking-tight mb-3">Live Queue</Text>
        <View className="flex-row items-center bg-white/10 self-start px-3 py-1.5 rounded-full">
          <View className={`w-2.5 h-2.5 rounded-full mr-2 shadow-sm ${isConnected ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'}`} />
          <Text className="text-sm font-semibold text-white">
            {isConnected ? 'Connected & Live' : 'Reconnecting...'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerClassName="px-6 pb-32">
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
          <View className="mt-8">
            <EmptyState
              title="Queue is empty"
              description="Nobody is waiting for this slot currently. You can relax!"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
