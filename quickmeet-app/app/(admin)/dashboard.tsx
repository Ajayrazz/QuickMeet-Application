import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueries } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Users, Clock } from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/auth.store';
import { useAnalytics } from '../../src/api/analytics.api';
import { useMyAppointmentTypes } from '../../src/hooks/useMyAppointmentTypes';
import { fetchSlots, Slot } from '../../src/api/slots.api';
import { Card } from '../../src/components/ui/Card';
import { EmptyState, Badge } from '../../src/components/ui/Misc';

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
      <ScrollView contentContainerClassName="p-6 pb-24">
        <View className="mb-8 mt-4">
          <Text className="text-3xl font-bold text-text dark:text-text-dark mb-2">
            Welcome back,
          </Text>
          <Text className="text-xl text-primary font-medium">
            {user?.name}
          </Text>
        </View>

        <View className="flex-row justify-between mb-8">
          <Card className="flex-1 p-4 mr-2 items-center">
            <Text className="text-3xl font-bold text-text dark:text-text-dark mb-1">{todaySlots.length}</Text>
            <Text className="text-sm text-text-muted dark:text-text-muted-dark text-center">Today&apos;s Slots</Text>
          </Card>
          <Card className="flex-1 p-4 ml-2 items-center">
            <Text className="text-3xl font-bold text-text dark:text-text-dark mb-1">{analytics?.totalBookings || 0}</Text>
            <Text className="text-sm text-text-muted dark:text-text-muted-dark text-center">Total Bookings</Text>
          </Card>
        </View>

        <Text className="text-xl font-bold text-text dark:text-text-dark mb-4">
          Today&apos;s Schedule
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#6366f1" className="mt-8" />
        ) : todaySlots.length === 0 ? (
          <EmptyState
            title="No slots today"
            description="You don&apos;t have any slots scheduled for today."
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
                <Card className={`p-4 flex-row justify-between items-center ${isNearCapacity ? 'border-l-4 border-l-red-500' : ''}`}>
                  <View>
                    <View className="flex-row items-center mb-1">
                      <Clock size={16} className="text-text dark:text-text-dark mr-2" />
                      <Text className="text-lg font-bold text-text dark:text-text-dark">
                        {format(new Date(slot.startTime), 'h:mm a')}
                      </Text>
                    </View>
                    <View className="flex-row items-center mt-2">
                      <Users size={14} className="text-text-muted dark:text-text-muted-dark mr-1" />
                      <Text className={`text-sm ${isNearCapacity ? 'text-red-500 font-bold' : 'text-text-muted dark:text-text-muted-dark'}`}>
                        {booked} / {slot.capacity} Booked
                      </Text>
                    </View>
                  </View>
                  <Badge 
                    label={slot.status} 
                    className={slot.status === 'OPEN' ? 'bg-green-500/20' : 'bg-red-500/20'} 
                  />
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
