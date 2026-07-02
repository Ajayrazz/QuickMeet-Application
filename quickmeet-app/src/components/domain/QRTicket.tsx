import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { format, parseISO } from 'date-fns';
import { Booking } from '../../api/bookings.api';
import { Badge } from '../ui/Misc';

interface QRTicketProps {
  booking: Booking;
}

export const QRTicket = ({ booking }: QRTicketProps) => {
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

  return (
    <View className="bg-surface dark:bg-surface-dark rounded-3xl overflow-hidden shadow-lg border border-border dark:border-border-dark mt-6 mb-6">
      {/* Top Section */}
      <View className="p-6 items-center">
        <Badge label={booking.status} variant={getStatusVariant(booking.status)} className="mb-4" />
        <Text className="text-2xl font-bold text-text dark:text-text-dark text-center mb-1">
          {booking.slot?.appointmentType?.title || 'Appointment'}
        </Text>
        <Text className="text-sm text-text-muted dark:text-text-muted-dark text-center mb-6">
          {booking.slot?.appointmentType?.location || 'No location provided'}
        </Text>

        <View className="bg-white p-4 rounded-xl shadow-sm">
          {booking.qrCode ? (
            <QRCode 
              value={booking.qrCode} 
              size={200} 
              color="#000"
              backgroundColor="#fff" 
            />
          ) : (
            <View className="w-[200px] h-[200px] bg-gray-100 items-center justify-center">
              <Text className="text-gray-400">QR Unavailable</Text>
            </View>
          )}
        </View>
        <Text className="text-xs text-text-muted dark:text-text-muted-dark mt-4">
          Scan this at the reception
        </Text>
      </View>

      {/* Perforated Divider */}
      <View className="flex-row items-center relative overflow-hidden" style={{ height: 30 }}>
        {/* Left Cutout */}
        <View className="w-8 h-8 rounded-full bg-background dark:bg-background-dark absolute -left-4 z-10" />
        {/* Dashed line */}
        <View className="flex-1 border-t-2 border-dashed border-border dark:border-border-dark mx-6 mt-1" />
        {/* Right Cutout */}
        <View className="w-8 h-8 rounded-full bg-background dark:bg-background-dark absolute -right-4 z-10" />
      </View>

      {/* Bottom Section */}
      <View className="p-6 bg-gray-50 dark:bg-slate-800">
        <View className="flex-row justify-between mb-4">
          <View>
            <Text className="text-xs text-text-muted dark:text-text-muted-dark uppercase font-semibold tracking-wider">Date</Text>
            <Text className="text-base font-bold text-text dark:text-text-dark">
              {booking.slot?.startTime ? format(parseISO(booking.slot.startTime), 'MMM d, yyyy') : 'N/A'}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-text-muted dark:text-text-muted-dark uppercase font-semibold tracking-wider">Time</Text>
            <Text className="text-base font-bold text-text dark:text-text-dark">
              {booking.slot?.startTime ? format(parseISO(booking.slot.startTime), 'h:mm a') : 'N/A'}
            </Text>
          </View>
        </View>
        
        <View>
          <Text className="text-xs text-text-muted dark:text-text-muted-dark uppercase font-semibold tracking-wider">Ticket ID</Text>
          <Text className="text-sm font-medium text-text dark:text-text-dark font-mono">
            {booking.id.toUpperCase().substring(0, 8)}
          </Text>
        </View>
      </View>
    </View>
  );
};
