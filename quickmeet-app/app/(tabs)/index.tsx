import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/auth.store';
import { useAppointmentTypes } from '../../src/hooks/useAppointmentTypes';
import { AppointmentTypeCard } from '../../src/components/domain/AppointmentTypeCard';
import { Skeleton, EmptyState } from '../../src/components/ui/Misc';
import { Card } from '../../src/components/ui/Card';

export default function HomeIndexScreen() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: appointmentTypes, isLoading, isRefetching, refetch } = useAppointmentTypes(debouncedSearch, category);

  const renderHeader = () => (
    <View className="mb-6 mt-4">
      <Text className="text-3xl font-bold text-text dark:text-text-dark mb-1">
        Hello, {user?.name?.split(' ')[0] || 'User'}! 👋
      </Text>
      <Text className="text-text-muted dark:text-text-muted-dark text-base mb-6">
        What service do you need today?
      </Text>

      {/* Search Bar */}
      <View className="flex-row items-center bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl px-4 py-3 mb-6">
        <Search size={20} className="text-gray-400 mr-2" />
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
        <View>
          <Card className="h-32 mb-4 p-4"><Skeleton className="w-2/3 h-6 mb-2" /><Skeleton className="w-full h-4 mb-4" /><Skeleton className="w-1/3 h-4" /></Card>
          <Card className="h-32 mb-4 p-4"><Skeleton className="w-2/3 h-6 mb-2" /><Skeleton className="w-full h-4 mb-4" /><Skeleton className="w-1/3 h-4" /></Card>
          <Card className="h-32 mb-4 p-4"><Skeleton className="w-2/3 h-6 mb-2" /><Skeleton className="w-full h-4 mb-4" /><Skeleton className="w-1/3 h-4" /></Card>
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
        contentContainerClassName="px-4 pb-20"
        ListHeaderComponent={renderHeader}
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
