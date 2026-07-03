import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/auth.store';
import { useAppointmentTypes } from '../../src/hooks/useAppointmentTypes';
import { useMyBookings } from '../../src/hooks/useBookings';
import { AppointmentTypeCard } from '../../src/components/domain/AppointmentTypeCard';
import { BookingListItem } from '../../src/components/domain/BookingListItem';
import { Skeleton, EmptyState, Avatar } from '../../src/components/ui/Misc';
import { Card } from '../../src/components/ui/Card';

export default function HomeIndexScreen() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: appointmentTypes, isLoading, isRefetching, refetch: refetchTypes } = useAppointmentTypes(debouncedSearch, category);
  const { data: bookings, refetch: refetchBookings } = useMyBookings();

  const handleRefresh = () => {
    refetchTypes();
    refetchBookings();
  };

  const upcomingBookings = Array.isArray(bookings) 
    ? bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'IN_QUEUE') 
    : [];

  const renderHeader = () => (
    <View className="mb-6 mt-4 pt-2">
      <View className="flex-row items-center justify-between mb-8">
        <View className="flex-1 mr-4">
          <Text className="text-sm font-medium text-text-muted dark:text-text-muted-dark uppercase tracking-widest mb-1">
            Welcome back
          </Text>
          <Text className="text-3xl font-extrabold text-text dark:text-text-dark tracking-tight">
            Hi, {user?.name?.split(' ')[0] || 'User'} 👋
          </Text>
        </View>
        <Avatar fallback={user?.name || 'U'} size="lg" />
      </View>

      {upcomingBookings.length > 0 && (
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-text dark:text-text-dark">
              Upcoming Appointments
            </Text>
          </View>
          <FlatList
            data={upcomingBookings}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="w-80 mr-4">
                <BookingListItem booking={item} />
              </View>
            )}
          />
        </View>
      )}

      <Text className="text-xl font-bold text-text dark:text-text-dark mb-4">
        Find a Service
      </Text>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-100 dark:bg-slate-800 border-2 border-transparent focus-within:border-primary dark:focus-within:border-primary rounded-full px-5 py-4 mb-8 h-14">
        <Search size={22} className="text-gray-400 mr-3" />
        <TextInput
          className="flex-1 text-text dark:text-text-dark text-base"
          placeholder="Search appointments..."
          placeholderTextColor="#9ca3af"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      
      <Text className="text-xl font-bold text-text dark:text-text-dark mb-4">
        Available Services
      </Text>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="space-y-4">
          <Card className="h-32 p-4"><Skeleton className="w-2/3 h-6 mb-3" /><Skeleton className="w-full h-4 mb-3" /><Skeleton className="w-1/3 h-4" /></Card>
          <Card className="h-32 p-4"><Skeleton className="w-2/3 h-6 mb-3" /><Skeleton className="w-full h-4 mb-3" /><Skeleton className="w-1/3 h-4" /></Card>
          <Card className="h-32 p-4"><Skeleton className="w-2/3 h-6 mb-3" /><Skeleton className="w-full h-4 mb-3" /><Skeleton className="w-1/3 h-4" /></Card>
        </View>
      );
    }

    return (
      <EmptyState
        title="No services found"
        description="Try adjusting your search terms or filters to find what you're looking for."
      />
    );
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <FlatList
        data={appointmentTypes || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppointmentTypeCard type={item} />}
        contentContainerClassName="px-6 pb-24"
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#4f46e5"
          />
        }
      />
    </View>
  );
}
