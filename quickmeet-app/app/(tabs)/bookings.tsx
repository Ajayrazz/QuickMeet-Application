import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useMyBookings } from '../../src/hooks/useBookings';
import { BookingListItem } from '../../src/components/domain/BookingListItem';
import { EmptyState, Skeleton } from '../../src/components/ui/Misc';
import { Card } from '../../src/components/ui/Card';
import { cn } from '../../src/lib/cn';
import { Booking } from '../../src/api/bookings.api';

type TabType = 'UPCOMING' | 'PAST' | 'CANCELLED';

export default function BookingsHistoryScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('UPCOMING');

  const { data: bookings, isLoading, isRefetching, refetch } = useMyBookings();

  // Filter local data based on tabs to avoid over-fetching
  const getFilteredBookings = (): Booking[] => {
    if (!bookings) return [];
    
    switch (activeTab) {
      case 'UPCOMING':
        return bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'IN_QUEUE');
      case 'PAST':
        return bookings.filter(b => b.status === 'SERVED' || b.status === 'NO_SHOW');
      case 'CANCELLED':
        return bookings.filter(b => b.status === 'CANCELLED');
      default:
        return bookings;
    }
  };

  const filteredBookings = getFilteredBookings();

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="px-4">
          <Card className="h-24 mb-3 p-4"><Skeleton className="w-16 h-16 rounded-xl absolute left-4 top-4" /><Skeleton className="w-1/2 h-5 ml-20 mb-2" /><Skeleton className="w-1/3 h-4 ml-20" /></Card>
          <Card className="h-24 mb-3 p-4"><Skeleton className="w-16 h-16 rounded-xl absolute left-4 top-4" /><Skeleton className="w-1/2 h-5 ml-20 mb-2" /><Skeleton className="w-1/3 h-4 ml-20" /></Card>
        </View>
      );
    }

    const messages = {
      UPCOMING: { title: "No upcoming bookings", desc: "You don't have any appointments scheduled right now. Head over to the explore tab to find a service." },
      PAST: { title: "No past bookings", desc: "Your history is clean!" },
      CANCELLED: { title: "No cancellations", desc: "You haven't cancelled any appointments." }
    };

    return (
      <EmptyState
        title={messages[activeTab].title}
        description={messages[activeTab].desc}
      />
    );
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* Header & Tabs */}
      <View className="px-4 pt-6 pb-4">
        <Text className="text-3xl font-bold text-text dark:text-text-dark mb-6">
          My Bookings
        </Text>
        
        <View className="flex-row bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['UPCOMING', 'PAST', 'CANCELLED'] as TabType[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 items-center justify-center rounded-lg",
                activeTab === tab ? "bg-white dark:bg-slate-600 shadow-sm" : ""
              )}
            >
              <Text className={cn(
                "text-sm font-semibold capitalize",
                activeTab === tab 
                  ? "text-text dark:text-text-dark" 
                  : "text-text-muted dark:text-text-muted-dark"
              )}>
                {tab.toLowerCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookingListItem booking={item} />}
        contentContainerClassName="px-4 pb-20"
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#6366f1"
          />
        }
      />
    </View>
  );
}
