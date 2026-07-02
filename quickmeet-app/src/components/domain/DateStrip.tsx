import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { format, addDays } from 'date-fns';
import { cn } from '../../lib/cn';

interface DateStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const DateStrip = ({ selectedDate, onSelectDate }: DateStripProps) => {
  const today = new Date();
  
  // Generate next 14 days
  const dates = Array.from({ length: 14 }).map((_, i) => addDays(today, i));

  return (
    <View className="py-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 space-x-3">
        {dates.map((date) => {
          const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          
          return (
            <Pressable
              key={date.toISOString()}
              onPress={() => onSelectDate(date)}
              className={cn(
                "items-center justify-center rounded-2xl p-3 w-16 h-20 border",
                isSelected
                  ? "bg-primary dark:bg-primary-light border-primary dark:border-primary-light"
                  : "bg-surface dark:bg-surface-dark border-border dark:border-border-dark"
              )}
            >
              <Text className={cn(
                "text-xs font-medium mb-1",
                isSelected ? "text-white" : "text-text-muted dark:text-text-muted-dark"
              )}>
                {format(date, 'EEE')}
              </Text>
              <Text className={cn(
                "text-lg font-bold",
                isSelected ? "text-white" : "text-text dark:text-text-dark"
              )}>
                {format(date, 'd')}
              </Text>
            </Pressable>
          );
        })}
        {/* Spacer for right padding in ScrollView */}
        <View className="w-4" />
      </ScrollView>
    </View>
  );
};
