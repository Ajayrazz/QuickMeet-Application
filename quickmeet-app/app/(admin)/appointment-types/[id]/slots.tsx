import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, parse } from 'date-fns';
import { Plus, Users } from 'lucide-react-native';
import { useSlots } from '../../../../src/hooks/useSlots';
import { useCreateSlot, useUpdateSlot } from '../../../../src/hooks/useAdminSlots';
import { DateStrip } from '../../../../src/components/domain/DateStrip';
import { SlotEditorForm, SlotFormData } from '../../../../src/components/domain/SlotEditorForm';
import { Card } from '../../../../src/components/ui/Card';
import { EmptyState, Badge } from '../../../../src/components/ui/Misc';

export default function AdminSlotsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalVisible, setModalVisible] = useState(false);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { data: slots, isLoading: isSlotsLoading } = useSlots(id as string, dateStr);

  const createMutation = useCreateSlot(id as string, selectedDate);
  const updateMutation = useUpdateSlot(id as string, selectedDate);

  const handleCreateSlot = (data: SlotFormData) => {
    // Combine selectedDate with time
    const startObj = parse(data.startTime, 'HH:mm', selectedDate);
    const endObj = parse(data.endTime, 'HH:mm', selectedDate);
    
    createMutation.mutate({
      startTime: startObj.toISOString(),
      endTime: endObj.toISOString(),
      capacity: data.capacity,
    }, {
      onSuccess: () => setModalVisible(false)
    });
  };

  const toggleSlotStatus = (slotId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'CLOSED' ? 'OPEN' : 'CLOSED';
    updateMutation.mutate({ id: slotId, dto: { status: newStatus } });
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
        <Text className="text-3xl font-bold text-text dark:text-text-dark">Manage Slots</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-primary/20 p-2 rounded-full"
        >
          <Plus size={24} className="text-primary" />
        </TouchableOpacity>
      </View>

      <Text className="text-lg font-bold text-text dark:text-text-dark px-6 mb-2 mt-4">Select Date</Text>
      <DateStrip 
        selectedDate={selectedDate} 
        onSelectDate={setSelectedDate} 
      />

      <ScrollView contentContainerClassName="p-6 pb-32 mt-2">
        {isSlotsLoading ? (
          <ActivityIndicator size="large" color="#6366f1" />
        ) : slots && slots.length > 0 ? (
          slots.map((slot) => (
            <Card key={slot.id} className="p-4 mb-4 flex-row justify-between items-center">
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => router.push(`/(admin)/queue/${slot.id}` as any)}
                className="flex-1"
              >
                <View className="flex-row items-center mb-2">
                  <Text className="text-lg font-bold text-text dark:text-text-dark mr-2">
                    {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                  </Text>
                  <Badge 
                    label={slot.status} 
                    className={slot.status === 'OPEN' ? 'bg-green-500/20' : 'bg-red-500/20'} 
                  />
                </View>
                
                <View className="flex-row items-center">
                  <Users size={14} className="text-text-muted dark:text-text-muted-dark mr-1" />
                  <Text className="text-sm text-text-muted dark:text-text-muted-dark">
                    {slot.capacity - slot.remainingCapacity} / {slot.capacity} Booked
                  </Text>
                </View>
              </TouchableOpacity>

              <View className="ml-4 items-center">
                <Text className="text-[10px] font-bold text-text-muted dark:text-text-muted-dark mb-1">
                  {slot.status === 'OPEN' ? 'OPEN' : 'CLOSED'}
                </Text>
                <Switch
                  value={slot.status === 'OPEN'}
                  onValueChange={() => toggleSlotStatus(slot.id, slot.status)}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={slot.status === 'OPEN' ? '#6366f1' : '#f4f3f4'}
                  disabled={updateMutation.isPending && updateMutation.variables?.id === slot.id}
                />
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            title="No slots"
            description="Tap the + button to create the first slot for this date."
          />
        )}
      </ScrollView>

      <SlotEditorForm
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateSlot}
        isLoading={createMutation.isPending}
      />
    </View>
  );
}
