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
  const displayName = `User ${item.userId.substring(0, 4).toUpperCase()}`;

  return (
    <Animated.View
      layout={Layout.springify()}
      entering={FadeIn}
      exiting={FadeOut}
      className="mb-4"
    >
      <Card className={`p-5 flex-row items-center border-0 shadow-sm ${isNext ? 'border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-900/10' : ''}`}>
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isNext ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-slate-800'}`}>
          <Text className={`text-xl font-black ${isNext ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{item.position}</Text>
        </View>

        <View className="flex-1">
          <Text className="text-xl font-bold text-text dark:text-text-dark mb-0.5">{displayName}</Text>
          <Text className="text-sm font-medium text-text-muted dark:text-text-muted-dark">ETA: {item.etaMinutes} min</Text>
        </View>

        <View className="flex-row">
          <TouchableOpacity
            testID="no-show-button"
            onPress={() => onNoShow(item.bookingId!)}
            disabled={isProcessing}
            className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center mr-2 border border-red-100 dark:border-red-900/30"
          >
            {isProcessing ? <ActivityIndicator size="small" color="#ef4444" /> : <X size={22} className="text-red-500 dark:text-red-400" />}
          </TouchableOpacity>
          
          {isNext && (
            <TouchableOpacity
              testID="call-next-button"
              onPress={() => onCallNext(item.bookingId!)}
              disabled={isProcessing}
              className="px-5 h-12 bg-green-500 rounded-full items-center justify-center flex-row shadow-md shadow-green-500/30"
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Check size={18} color="#ffffff" className="mr-1.5" />
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
