import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Clock, MapPin } from 'lucide-react-native';
import { AppointmentType } from '../../api/appointmentTypes.api';
import { Badge } from '../ui/Misc';
import { Card } from '../ui/Card';
import { Link } from 'expo-router';

export const AppointmentTypeCard = ({ type }: { type: AppointmentType }) => {
  return (
    <Link href={`/appointment/${type.id}`} asChild>
      <Pressable className="mb-4">
        <Card className="p-4 active:bg-gray-50 dark:active:bg-slate-800">
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
    </Link>
  );
};
