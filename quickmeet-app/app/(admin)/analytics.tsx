import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
// Force Metro to bundle the linear-gradient package so gifted-charts can find it dynamically
import { LinearGradient } from 'expo-linear-gradient';
import { format, subDays } from 'date-fns';
import { useAnalytics } from '../../src/api/analytics.api';
import { Card } from '../../src/components/ui/Card';
import { Skeleton, EmptyState } from '../../src/components/ui/Misc';

export default function AnalyticsScreen() {
  // By default, let's fetch the last 7 days
  const [endDate] = useState(new Date());
  const [startDate] = useState(subDays(endDate, 7));

  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  const { data: analytics, isLoading } = useAnalytics(undefined, startDateStr, endDateStr);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark">
        <View className="px-6 pt-16 pb-12 rounded-b-[40px] mb-6 bg-indigo-900/10 h-40">
          <Skeleton className="w-1/3 h-8 mb-2 mt-4" />
          <Skeleton className="w-1/2 h-4" />
        </View>
        <View className="px-6">
          <View className="flex-row justify-between mb-4">
            <Card className="flex-1 h-28 mr-2 p-4 rounded-2xl"><Skeleton className="w-full h-full" /></Card>
            <Card className="flex-1 h-28 mx-2 p-4 rounded-2xl"><Skeleton className="w-full h-full" /></Card>
            <Card className="flex-1 h-28 ml-2 p-4 rounded-2xl"><Skeleton className="w-full h-full" /></Card>
          </View>
          
          <Card className="h-16 mb-8 p-4 rounded-2xl"><Skeleton className="w-full h-full" /></Card>
          <Card className="h-64 p-4 rounded-3xl"><Skeleton className="w-full h-full" /></Card>
        </View>
      </View>
    );
  }

  const noShowRate = analytics?.totalBookings 
    ? Math.round((analytics.noShowCount / analytics.totalBookings) * 100) 
    : 0;

  const completionRate = analytics?.totalBookings
    ? Math.round((analytics.servedCount / analytics.totalBookings) * 100)
    : 0;

  // Format chart data
  const chartData = analytics?.bookingsPerDay.map(d => ({
    value: d.count,
    label: format(new Date(d.date), 'dd MMM'),
    frontColor: '#6366f1',
  })) || [];

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <LinearGradient
        colors={['#1e1b4b', '#4338ca']}
        className="px-6 pt-16 pb-10 rounded-b-[40px] shadow-md mb-6"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text className="text-4xl font-extrabold text-white tracking-tight mb-2">Analytics</Text>
        <View className="bg-white/10 self-start px-4 py-1.5 rounded-full">
          <Text className="text-sm font-semibold text-indigo-100">
            Last 7 Days ({format(startDate, 'MMM d')} - {format(endDate, 'MMM d')})
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerClassName="px-6 pb-32">
        {/* Summary Cards */}
        <View className="flex-row justify-between mb-4">
          <Card className="flex-1 p-5 mr-2 items-center justify-center border-0 shadow-sm bg-indigo-50/50 dark:bg-indigo-900/10">
            <Text className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{analytics?.totalBookings || 0}</Text>
            <Text className="text-[10px] uppercase tracking-wider text-text-muted dark:text-text-muted-dark text-center font-bold">Total Bookings</Text>
          </Card>
          <Card className="flex-1 p-5 mx-2 items-center justify-center border-0 shadow-sm bg-orange-50/50 dark:bg-orange-900/10">
            <Text className="text-3xl font-black text-orange-600 dark:text-orange-400 mb-1">{analytics?.avgWaitTimeMinutes || 0}m</Text>
            <Text className="text-[10px] uppercase tracking-wider text-text-muted dark:text-text-muted-dark text-center font-bold">Avg Wait Time</Text>
          </Card>
          <Card className="flex-1 p-5 ml-2 items-center justify-center border-0 shadow-sm bg-red-50/50 dark:bg-red-900/10">
            <Text className="text-3xl font-black text-red-600 dark:text-red-400 mb-1">{noShowRate}%</Text>
            <Text className="text-[10px] uppercase tracking-wider text-text-muted dark:text-text-muted-dark text-center font-bold">No-Show Rate</Text>
          </Card>
        </View>

        <Card className="p-5 flex-row justify-between items-center mb-8 border-0 shadow-sm">
          <Text className="text-lg font-bold text-text dark:text-text-dark">Completion Rate</Text>
          <View className="bg-green-100 dark:bg-green-900/30 px-4 py-1.5 rounded-full">
            <Text className="text-green-700 dark:text-green-400 font-bold">{completionRate}%</Text>
          </View>
        </Card>

        {/* Chart */}
        <Text className="text-2xl font-bold text-text dark:text-text-dark mb-4 tracking-tight">
          Bookings Per Day
        </Text>
        <Card className="p-6 items-center pt-8 border-0 shadow-md">
          {chartData.length > 0 ? (
            <BarChart
              data={chartData}
              barWidth={24}
              noOfSections={4}
              barBorderRadius={6}
              frontColor="#6366f1"
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor={'#d1d5db'}
              rulesColor={'#e5e7eb'}
              hideRules={false}
              yAxisTextStyle={{ color: '#6b7280', fontWeight: 'bold' }}
              xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 11, fontWeight: '600' }}
              spacing={24}
              initialSpacing={12}
            />
          ) : (
            <EmptyState 
              title="No chart data" 
              description="There is no booking data available for the selected period."
              className="py-8"
            />
          )}
        </Card>
      </ScrollView>
    </View>
  );
}
