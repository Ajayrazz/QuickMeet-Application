import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useMyNotifications, useMarkNotificationRead } from '../../src/hooks/useMyNotifications';
import { EmptyState, Skeleton } from '../../src/components/ui/Misc';
import { Card } from '../../src/components/ui/Card';

export default function NotificationsScreen() {
  const router = useRouter();
  const { data: notifications, isLoading } = useMyNotifications();
  const markAsRead = useMarkNotificationRead();

  const handlePress = (notification: any) => {
    if (!notification.readAt) {
      markAsRead.mutate(notification.id);
    }
    if (notification.relatedBookingId) {
      router.push(`/booking/${notification.relatedBookingId}`);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark p-6">
        <Card className="h-24 mb-4 p-4"><Skeleton className="w-1/2 h-6 mb-2" /><Skeleton className="w-full h-4" /></Card>
        <Card className="h-24 mb-4 p-4"><Skeleton className="w-1/2 h-6 mb-2" /><Skeleton className="w-full h-4" /></Card>
        <Card className="h-24 mb-4 p-4"><Skeleton className="w-1/2 h-6 mb-2" /><Skeleton className="w-full h-4" /></Card>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-6 pb-24"
        ListEmptyComponent={
          <EmptyState title="No notifications" description="You're all caught up!" />
        }
        renderItem={({ item }) => {
          const isUnread = !item.readAt;
          return (
            <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.7} className="mb-4">
              <Card className={`p-4 ${isUnread ? 'border-l-4 border-l-primary' : ''}`}>
                <View className="flex-row items-center mb-2">
                  <View className={`p-2 rounded-full mr-3 ${isUnread ? 'bg-primary/20' : 'bg-surface-alt dark:bg-surface-alt-dark'}`}>
                    <Bell size={18} className={isUnread ? 'text-primary' : 'text-text-muted'} />
                  </View>
                  <Text className={`flex-1 text-base ${isUnread ? 'font-bold text-text dark:text-text-dark' : 'font-medium text-text-muted dark:text-text-muted-dark'}`}>
                    {item.title}
                  </Text>
                  {isUnread && <View className="w-2 h-2 rounded-full bg-primary ml-2" />}
                </View>
                <Text className="text-sm text-text-muted dark:text-text-muted-dark ml-11">
                  {item.body}
                </Text>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
