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
                "items-center justify-center rounded-full p-2 w-[72px] h-24",
                isSelected
                  ? "bg-primary dark:bg-primary-light shadow-md shadow-primary/30"
                  : "bg-surface dark:bg-surface-dark border-transparent shadow-sm"
              )}
            >
              <Text className={cn(
                "text-xs font-semibold mb-1 uppercase tracking-widest",
                isSelected ? "text-indigo-100" : "text-text-muted dark:text-text-muted-dark"
              )}>
                {format(date, 'EEE')}
              </Text>
              <Text className={cn(
                "text-2xl font-bold",
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
