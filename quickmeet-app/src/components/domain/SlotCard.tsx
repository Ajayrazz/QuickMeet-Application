import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Slot } from '../../api/slots.api';
import { format, parseISO } from 'date-fns';
import { cn } from '../../lib/cn';

interface SlotCardProps {
  slot: Slot;
  isSelected?: boolean;
  onPress: (slot: Slot) => void;
}

export const SlotCard = ({ slot, isSelected, onPress }: SlotCardProps) => {
  const isFull = slot.status === 'FULL' || slot.remainingCapacity <= 0;
  const isAlmostFull = slot.remainingCapacity > 0 && slot.remainingCapacity <= 2;
  const isCancelled = slot.status === 'CANCELLED';
  
  const disabled = isFull || isCancelled;

  const getCapacityColor = () => {
    if (disabled) return 'text-red-500 dark:text-red-400';
    if (isAlmostFull) return 'text-amber-500 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getCapacityText = () => {
    if (isCancelled) return 'Cancelled';
    if (isFull) return 'Full';
    if (isAlmostFull) return `Only ${slot.remainingCapacity} spots left!`;
    return 'Plenty of availability';
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onPress(slot)}
      className={cn(
        "rounded-2xl p-5 mb-3 border-2",
        isSelected 
          ? "border-primary dark:border-primary-light bg-primary/5 dark:bg-primary-dark/10" 
          : "border-transparent bg-surface dark:bg-surface-dark shadow-sm",
        disabled && "opacity-50"
      )}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className={cn("text-lg font-bold text-text dark:text-text-dark", disabled && "line-through text-gray-400")}>
            {format(parseISO(slot.startTime), 'h:mm a')}
          </Text>
          <Text className="text-xs text-text-muted dark:text-text-muted-dark">
            Until {format(parseISO(slot.endTime), 'h:mm a')}
          </Text>
        </View>

        <View className="items-end">
          <Text className={cn("text-xs font-bold", getCapacityColor())}>
            {getCapacityText()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
