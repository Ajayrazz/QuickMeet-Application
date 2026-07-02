import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
// Force Metro to bundle the linear-gradient package so gifted-charts can find it dynamically
import 'expo-linear-gradient';
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
      <View className="flex-1 bg-background dark:bg-background-dark p-6 pt-12">
        <Skeleton className="w-1/3 h-8 mb-2" />
        <Skeleton className="w-1/2 h-4 mb-8" />
        
        <View className="flex-row justify-between mb-4">
          <Card className="flex-1 h-24 mr-2 p-4"><Skeleton className="w-full h-full" /></Card>
          <Card className="flex-1 h-24 mx-2 p-4"><Skeleton className="w-full h-full" /></Card>
          <Card className="flex-1 h-24 ml-2 p-4"><Skeleton className="w-full h-full" /></Card>
        </View>
        
        <Card className="h-16 mb-8 p-4"><Skeleton className="w-full h-full" /></Card>
        <Card className="h-64 p-4"><Skeleton className="w-full h-full" /></Card>
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
      <ScrollView contentContainerClassName="p-6 pb-32">
        <Text className="text-3xl font-bold text-text dark:text-text-dark mt-4 mb-2">
          Analytics
        </Text>
        <Text className="text-sm text-text-muted dark:text-text-muted-dark mb-6">
          Last 7 Days ({format(startDate, 'MMM d')} - {format(endDate, 'MMM d')})
        </Text>

        {/* Summary Cards */}
        <View className="flex-row justify-between mb-4">
          <Card className="flex-1 p-4 mr-2 items-center justify-center">
            <Text className="text-3xl font-bold text-text dark:text-text-dark mb-1">{analytics?.totalBookings || 0}</Text>
            <Text className="text-xs text-text-muted dark:text-text-muted-dark text-center">Total Bookings</Text>
          </Card>
          <Card className="flex-1 p-4 mx-2 items-center justify-center">
            <Text className="text-3xl font-bold text-text dark:text-text-dark mb-1">{analytics?.avgWaitTimeMinutes || 0}m</Text>
            <Text className="text-xs text-text-muted dark:text-text-muted-dark text-center">Avg Wait Time</Text>
          </Card>
          <Card className="flex-1 p-4 ml-2 items-center justify-center">
            <Text className="text-3xl font-bold text-text dark:text-text-dark mb-1">{noShowRate}%</Text>
            <Text className="text-xs text-text-muted dark:text-text-muted-dark text-center">No-Show Rate</Text>
          </Card>
        </View>

        <Card className="p-4 flex-row justify-between items-center mb-8">
          <Text className="text-base font-bold text-text dark:text-text-dark">Completion Rate</Text>
          <View className="bg-green-500/20 px-3 py-1 rounded-full">
            <Text className="text-green-600 dark:text-green-400 font-bold">{completionRate}%</Text>
          </View>
        </Card>

        {/* Chart */}
        <Text className="text-xl font-bold text-text dark:text-text-dark mb-4">
          Bookings Per Day
        </Text>
        <Card className="p-4 items-center pt-8">
          {chartData.length > 0 ? (
            <BarChart
              data={chartData}
              barWidth={22}
              noOfSections={4}
              barBorderRadius={4}
              frontColor="#6366f1"
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor={'#d1d5db'}
              rulesColor={'#e5e7eb'}
              hideRules={false}
              yAxisTextStyle={{ color: '#6b7280' }}
              xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10 }}
              spacing={20}
              initialSpacing={10}
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
