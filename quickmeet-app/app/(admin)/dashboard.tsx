import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueries } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Users, Clock, ChevronRight, Activity, CalendarDays } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/stores/auth.store';
import { useAnalytics } from '../../src/api/analytics.api';
import { useMyAppointmentTypes } from '../../src/hooks/useMyAppointmentTypes';
import { fetchSlots, Slot } from '../../src/api/slots.api';
import { Card } from '../../src/components/ui/Card';
import { EmptyState, Badge, Skeleton, Avatar } from '../../src/components/ui/Misc';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { data: analytics } = useAnalytics(undefined, todayStr, todayStr);
  
  const { data: appointmentTypes } = useMyAppointmentTypes();
  
  const slotQueries = useQueries({
    queries: (appointmentTypes || []).map(at => ({
      queryKey: ['slots', at.id, todayStr],
      queryFn: () => fetchSlots(at.id, todayStr),
      staleTime: 60000,
    }))
  });
  
  const isLoading = slotQueries.some(q => q.isLoading);
  
  // Flatten all slots
  const todaySlots = slotQueries
    .filter(q => q.data)
    .flatMap(q => q.data || [])
    .sort((a, b) => new Date((a as Slot).startTime).getTime() - new Date((b as Slot).startTime).getTime()) as Slot[];


  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView contentContainerClassName="pb-24">
        {/* Header Section */}
        <LinearGradient
          colors={['#1e1b4b', '#4338ca']}
          className="px-6 pt-16 pb-12 rounded-b-[40px] mb-6 shadow-md"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 mr-4">
              <Text className="text-indigo-200 text-sm font-semibold tracking-widest uppercase mb-1">
                Admin Dashboard
              </Text>
              <Text className="text-3xl font-extrabold text-white tracking-tight">
                Welcome, {user?.name?.split(' ')[0]}
              </Text>
            </View>
            <Avatar fallback={user?.name || 'A'} size="lg" className="border-2 border-indigo-300" />
          </View>
        </LinearGradient>

        <View className="px-6">
          <View className="flex-row justify-between mb-8 -mt-14">
            <Card className="flex-1 p-5 mr-2 items-center bg-white dark:bg-surface-dark shadow-xl shadow-black/10 border-0">
              <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 items-center justify-center mb-3">
                <CalendarDays size={20} className="text-indigo-600 dark:text-indigo-400" />
              </View>
              <Text className="text-3xl font-extrabold text-text dark:text-text-dark mb-1">{todaySlots.length}</Text>
              <Text className="text-xs text-text-muted dark:text-text-muted-dark font-medium uppercase tracking-wider text-center">Today's Slots</Text>
            </Card>
            
            <Card className="flex-1 p-5 ml-2 items-center bg-white dark:bg-surface-dark shadow-xl shadow-black/10 border-0">
              <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 items-center justify-center mb-3">
                <Activity size={20} className="text-green-600 dark:text-green-400" />
              </View>
              <Text className="text-3xl font-extrabold text-text dark:text-text-dark mb-1">{analytics?.totalBookings || 0}</Text>
              <Text className="text-xs text-text-muted dark:text-text-muted-dark font-medium uppercase tracking-wider text-center">Total Bookings</Text>
            </Card>
          </View>

          <Text className="text-xl font-bold text-text dark:text-text-dark mb-4">
            Today's Schedule
          </Text>

          {isLoading ? (
            <View className="mt-2">
              <Card className="h-28 mb-4 p-5 rounded-2xl"><Skeleton className="w-1/3 h-6 mb-3" /><Skeleton className="w-1/4 h-4" /></Card>
              <Card className="h-28 mb-4 p-5 rounded-2xl"><Skeleton className="w-1/3 h-6 mb-3" /><Skeleton className="w-1/4 h-4" /></Card>
            </View>
          ) : todaySlots.length === 0 ? (
            <EmptyState
              title="No slots today"
              description="You don't have any slots scheduled for today."
            />
          ) : (
            todaySlots.map((slot) => {
              const booked = slot.capacity - slot.remainingCapacity;
              const isNearCapacity = booked >= slot.capacity * 0.8;
              
              return (
                <TouchableOpacity
                  key={slot.id}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/(admin)/queue/${slot.id}` as any)}
                  className="mb-4"
                >
                  <Card className={`p-5 flex-row justify-between items-center border-0 shadow-sm ${isNearCapacity ? 'border-l-4 border-l-red-500' : ''}`}>
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <Clock size={16} className="text-text dark:text-text-dark mr-2" />
                        <Text className="text-lg font-extrabold text-text dark:text-text-dark">
                          {format(new Date(slot.startTime), 'h:mm a')}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="flex-row items-center bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md mr-3">
                          <Users size={14} className="text-gray-500 dark:text-gray-400 mr-1" />
                          <Text className={`text-xs font-medium ${isNearCapacity ? 'text-red-500' : 'text-text-muted dark:text-text-muted-dark'}`}>
                            {booked} / {slot.capacity} Booked
                          </Text>
                        </View>
                        <Badge 
                          label={slot.status} 
                          className={slot.status === 'OPEN' ? 'bg-green-500/20' : 'bg-red-500/20'} 
                        />
                      </View>
                    </View>
                    
                    <View className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full items-center justify-center">
                      <ChevronRight size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
