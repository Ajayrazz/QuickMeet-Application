import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Clock, MapPin } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { Link } from 'expo-router';
import { Booking } from '../../api/bookings.api';
import { Badge } from '../ui/Misc';
import { Card } from '../ui/Card';

export const BookingListItem = ({ booking }: { booking: Booking }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'destructive';
      case 'SERVED':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const startTime = booking.slot?.startTime ? parseISO(booking.slot.startTime) : null;
  const title = booking.slot?.appointmentType?.title || 'Appointment';
  const location = booking.slot?.appointmentType?.location;

  return (
    <Link href={`/booking/${booking.id}`} asChild>
      <Pressable className="mb-3">
        <Card className="p-4 active:bg-gray-50 dark:active:bg-slate-800 flex-row">
          {/* Date Block */}
          <View className="bg-primary/10 dark:bg-primary-dark/20 rounded-xl p-3 items-center justify-center min-w-[70px] mr-4">
            <Text className="text-xs font-bold text-primary dark:text-primary-light uppercase">
              {startTime ? format(startTime, 'MMM') : '-'}
            </Text>
            <Text className="text-2xl font-black text-primary dark:text-primary-light">
              {startTime ? format(startTime, 'd') : '-'}
            </Text>
          </View>

          {/* Details Block */}
          <View className="flex-1 justify-center">
            <View className="flex-row justify-between items-start mb-1">
              <Text className="text-base font-bold text-text dark:text-text-dark flex-1 mr-2" numberOfLines={1}>
                {title}
              </Text>
              <Badge label={booking.status} variant={getStatusVariant(booking.status)} />
            </View>
            
            <View className="flex-row items-center space-x-3 mt-2">
              <View className="flex-row items-center space-x-1">
                <Clock size={14} className="text-gray-400" />
                <Text className="text-xs text-text-muted dark:text-text-muted-dark">
                  {startTime ? format(startTime, 'h:mm a') : '-'}
                </Text>
              </View>

              {location && (
                <View className="flex-row items-center space-x-1 flex-1">
                  <MapPin size={14} className="text-gray-400" />
                  <Text className="text-xs text-text-muted dark:text-text-muted-dark" numberOfLines={1}>
                    {location}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
};
