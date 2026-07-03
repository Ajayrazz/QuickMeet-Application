import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ChevronRight, Clock, MapPin, Edit3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMyAppointmentTypes } from '../../../src/hooks/useMyAppointmentTypes';
import { Card } from '../../../src/components/ui/Card';
import { EmptyState, Skeleton, Badge } from '../../../src/components/ui/Misc';
import { Button } from '../../../src/components/ui/Button';

export default function AppointmentTypesListScreen() {
  const router = useRouter();
  const { data: services, isLoading } = useMyAppointmentTypes();

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <LinearGradient
        colors={['#1e1b4b', '#4338ca']}
        className="px-6 pt-16 pb-12 rounded-b-[40px] shadow-md mb-6"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-4xl font-extrabold text-white tracking-tight mb-2">
              My Services
            </Text>
            <Text className="text-indigo-200 text-sm font-medium">
              Manage what you offer to clients.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/appointment-types/new/edit' as any)}
            className="bg-white/20 p-3 rounded-full shadow-lg"
          >
            <Plus size={24} className="text-white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View className="px-6">
          <Card className="h-36 mb-4 p-5 rounded-3xl"><Skeleton className="w-1/2 h-6 mb-3" /><Skeleton className="w-full h-4 mb-2" /><Skeleton className="w-3/4 h-4 mb-4" /><Skeleton className="w-1/4 h-3" /></Card>
          <Card className="h-36 mb-4 p-5 rounded-3xl"><Skeleton className="w-1/2 h-6 mb-3" /><Skeleton className="w-full h-4 mb-2" /><Skeleton className="w-3/4 h-4 mb-4" /><Skeleton className="w-1/4 h-3" /></Card>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pb-24"
          showsVerticalScrollIndicator={false}
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
              className="mb-5"
            >
              <Card className={`p-5 border-0 shadow-sm ${!item.isActive ? 'opacity-60 bg-gray-50 dark:bg-gray-900/20' : ''}`}>
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-4">
                    {item.category && (
                      <View className="self-start mb-1.5 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        <Text className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{item.category}</Text>
                      </View>
                    )}
                    <Text className="text-xl font-bold text-text dark:text-text-dark">
                      {item.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push(`/(admin)/appointment-types/${item.id}/edit` as any)}
                    className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-full"
                  >
                    <Edit3 size={18} className="text-indigo-600 dark:text-indigo-400" />
                  </TouchableOpacity>
                </View>
                
                <Text className="text-sm text-text-muted dark:text-text-muted-dark mb-4 leading-relaxed" numberOfLines={2}>
                  {item.description}
                </Text>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row flex-wrap flex-1">
                    <View className="flex-row items-center bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-md mr-3 mb-2">
                      <Clock size={14} className="text-gray-500 dark:text-gray-400 mr-1.5" />
                      <Text className="text-xs font-medium text-text-muted dark:text-text-muted-dark">{item.avgServiceDurationMinutes} min</Text>
                    </View>
                    {item.location && (
                      <View className="flex-row items-center bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-md mr-3 mb-2">
                        <MapPin size={14} className="text-gray-500 dark:text-gray-400 mr-1.5" />
                        <Text className="text-xs font-medium text-text-muted dark:text-text-muted-dark max-w-[100px]" numberOfLines={1}>{item.location}</Text>
                      </View>
                    )}
                  </View>
                  {!item.isActive && (
                    <View className="bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-900/30">
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
