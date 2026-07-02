import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Clock, Users } from 'lucide-react-native';
import { Card } from '../ui/Card';

interface QueuePositionBadgeProps {
  position: number | null;
  eta: number;
  isLoading?: boolean;
}

export const QueuePositionBadge = ({ position, eta, isLoading }: QueuePositionBadgeProps) => {
  if (isLoading) {
    return (
      <Card className="p-4 flex-row justify-center items-center h-24">
        <ActivityIndicator size="small" color="#6366f1" />
      </Card>
    );
  }

  // If position is null or undefined, the user is either served, not in queue yet, or no snapshot available.
  if (position == null) {
    return (
      <Card className="p-4 flex-row justify-center items-center">
        <Text className="text-text-muted dark:text-text-muted-dark font-medium">
          Queue information unavailable
        </Text>
      </Card>
    );
  }

  return (
    <Card className="p-4 flex-row items-center justify-around bg-primary/5 dark:bg-primary-dark/10">
      <View className="items-center">
        <View className="flex-row items-center mb-1">
          <Users size={16} className="text-primary dark:text-primary-light mr-1" />
          <Text className="text-sm font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">
            Your Position
          </Text>
        </View>
        <Text className="text-3xl font-black text-primary dark:text-primary-light">
          {position}
        </Text>
      </View>

      <View className="w-[1px] h-12 bg-border dark:bg-border-dark" />

      <View className="items-center">
        <View className="flex-row items-center mb-1">
          <Clock size={16} className="text-amber-500 dark:text-amber-400 mr-1" />
          <Text className="text-sm font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">
            Est. Wait Time
          </Text>
        </View>
        <Text className="text-3xl font-black text-amber-500 dark:text-amber-400">
          {eta} <Text className="text-lg font-medium">min</Text>
        </Text>
      </View>
    </Card>
  );
};
