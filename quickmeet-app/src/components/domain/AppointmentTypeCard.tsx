import React from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Clock, MapPin, ChevronRight } from 'lucide-react-native';
import { AppointmentType } from '../../api/appointmentTypes.api';
import { Badge } from '../ui/Misc';
import { Card } from '../ui/Card';
import { useRouter } from 'expo-router';

export const AppointmentTypeCard = ({ type }: { type: AppointmentType }) => {
  const router = useRouter();
  const [scale] = React.useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable 
        className="mb-5"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push(`/appointment/${type.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`Book ${type.title}`}
        accessibilityHint="Tap to book this service"
      >
        <Card className="p-5 flex-row items-center border-0">
          <View className="flex-1 mr-4">
            <View className="flex-row items-center mb-1.5">
              {type.category && (
                <Badge label={type.category} variant="secondary" className="mr-2" />
              )}
            </View>
            <Text className="text-xl font-bold text-text dark:text-text-dark mb-1">
              {type.title}
            </Text>
            
            <Text className="text-text-muted dark:text-text-muted-dark text-sm mb-4 leading-relaxed" numberOfLines={2}>
              {type.description}
            </Text>

            <View className="flex-row items-center space-x-4">
              <View className="flex-row items-center space-x-1.5 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                <Clock size={14} className="text-gray-500 dark:text-gray-400" />
                <Text className="text-xs font-medium text-text-muted dark:text-text-muted-dark">
                  {type.avgServiceDurationMinutes} min
                </Text>
              </View>

              {type.location && (
                <View className="flex-row items-center space-x-1.5 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  <MapPin size={14} className="text-gray-500 dark:text-gray-400" />
                  <Text className="text-xs font-medium text-text-muted dark:text-text-muted-dark max-w-[120px]" numberOfLines={1}>
                    {type.location}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View className="w-10 h-10 bg-primary/10 dark:bg-primary-dark/20 rounded-full items-center justify-center">
            <ChevronRight size={20} className="text-primary dark:text-primary-light" />
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
};
