import React from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Clock, MapPin } from 'lucide-react-native';
import { AppointmentType } from '../../api/appointmentTypes.api';
import { Badge } from '../ui/Misc';
import { Card } from '../ui/Card';
import { Link } from 'expo-router';

export const AppointmentTypeCard = ({ type }: { type: AppointmentType }) => {
  const [scale] = React.useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
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
    <Link href={`/appointment/${type.id}`} asChild>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable 
          className="mb-4"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={`Book ${type.title}`}
          accessibilityHint="Tap to book this service"
        >
          <Card className="p-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark">
            <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-bold text-text dark:text-text-dark flex-1 mr-4">
              {type.title}
            </Text>
            {type.category && (
              <Badge label={type.category} variant="secondary" />
            )}
          </View>
          
          <Text className="text-text-muted dark:text-text-muted-dark text-sm mb-4" numberOfLines={2}>
            {type.description}
          </Text>

          <View className="flex-row items-center space-x-4">
            <View className="flex-row items-center space-x-1">
              <Clock size={16} className="text-gray-400" />
              <Text className="text-xs text-text-muted dark:text-text-muted-dark">
                {type.avgServiceDurationMinutes} min
              </Text>
            </View>

            {type.location && (
              <View className="flex-row items-center space-x-1">
                <MapPin size={16} className="text-gray-400" />
                <Text className="text-xs text-text-muted dark:text-text-muted-dark">
                  {type.location}
                </Text>
              </View>
            )}
          </View>
          </Card>
        </Pressable>
      </Animated.View>
    </Link>
  );
};
