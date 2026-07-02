import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { Check, X } from 'lucide-react-native';
import { QueueData } from '../../hooks/useQueueSocket';
import { Card } from '../ui/Card';

interface QueueControlRowProps {
  item: QueueData;
  isNext: boolean;
  onCallNext: (bookingId: string) => void;
  onNoShow: (bookingId: string) => void;
  isProcessing: boolean;
}

export function QueueControlRow({ item, isNext, onCallNext, onNoShow, isProcessing }: QueueControlRowProps) {
  // Since the backend snapshot doesn't include the User's name, we show a snippet of their ID.
  const displayName = `User ${item.userId.substring(0, 4).toUpperCase()}`;

  return (
    <Animated.View
      layout={Layout.springify()}
      entering={FadeIn}
      exiting={FadeOut}
      className="mb-3"
    >
      <Card className={`p-4 flex-row items-center border-l-4 ${isNext ? 'border-green-500 bg-green-500/10' : 'border-primary'}`}>
        <View className="w-10 h-10 rounded-full bg-surface-alt dark:bg-surface-alt-dark items-center justify-center mr-4">
          <Text className="text-lg font-bold text-text dark:text-text-dark">{item.position}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-lg font-bold text-text dark:text-text-dark">{displayName}</Text>
          <Text className="text-sm text-text-muted dark:text-text-muted-dark">ETA: {item.etaMinutes} min</Text>
        </View>

        <View className="flex-row">
          <TouchableOpacity
            testID="no-show-button"
            onPress={() => onNoShow(item.bookingId!)}
            disabled={isProcessing}
            className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center mr-2"
          >
            {isProcessing ? <ActivityIndicator size="small" color="#ef4444" /> : <X size={20} color="#ef4444" />}
          </TouchableOpacity>
          
          {isNext && (
            <TouchableOpacity
              testID="call-next-button"
              onPress={() => onCallNext(item.bookingId!)}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-500 rounded-full items-center justify-center flex-row"
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Check size={16} color="#ffffff" className="mr-1" />
                  <Text className="text-white font-bold text-sm">Call Next</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </Animated.View>
  );
}
