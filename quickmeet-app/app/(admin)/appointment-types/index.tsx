import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ChevronRight, Clock, MapPin } from 'lucide-react-native';
import { useMyAppointmentTypes } from '../../../src/hooks/useMyAppointmentTypes';
import { Card } from '../../../src/components/ui/Card';
import { EmptyState } from '../../../src/components/ui/Misc';
import { Button } from '../../../src/components/ui/Button';

export default function AppointmentTypesListScreen() {
  const router = useRouter();
  const { data: services, isLoading } = useMyAppointmentTypes();

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View className="px-6 pt-6 pb-4 flex-row justify-between items-center">
        <Text className="text-3xl font-bold text-text dark:text-text-dark">
          My Services
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/appointment-types/new/edit' as any)}
          className="bg-primary/20 p-2 rounded-full"
        >
          <Plus size={24} className="text-primary" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-6 pb-24"
          ListEmptyComponent={
            <EmptyState
              title="No services"
              description="Create your first appointment type to start accepting bookings."
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => router.push(`/(admin)/appointment-types/${item.id}/slots` as any)}
              className="mb-4"
            >
              <Card className={`p-4 ${!item.isActive ? 'opacity-60' : ''}`}>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-bold text-text dark:text-text-dark flex-1">
                    {item.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push(`/(admin)/appointment-types/${item.id}/edit` as any)}
                    className="ml-2 bg-surface-alt dark:bg-surface-alt-dark px-3 py-1 rounded-full"
                  >
                    <Text className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">Edit</Text>
                  </TouchableOpacity>
                </View>
                
                <Text className="text-sm text-text-muted dark:text-text-muted-dark mb-3" numberOfLines={2}>
                  {item.description}
                </Text>

                <View className="flex-row flex-wrap mt-2">
                  <View className="flex-row items-center mr-4 mb-2">
                    <Clock size={14} className="text-text-muted dark:text-text-muted-dark mr-1" />
                    <Text className="text-xs text-text-muted dark:text-text-muted-dark">{item.avgServiceDurationMinutes} min</Text>
                  </View>
                  <View className="flex-row items-center mr-4 mb-2">
                    <MapPin size={14} className="text-text-muted dark:text-text-muted-dark mr-1" />
                    <Text className="text-xs text-text-muted dark:text-text-muted-dark">{item.location}</Text>
                  </View>
                  {!item.isActive && (
                    <View className="bg-red-500/20 px-2 py-[2px] rounded-sm mb-2">
                      <Text className="text-[10px] font-bold text-red-600 dark:text-red-400">INACTIVE</Text>
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
