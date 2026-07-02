import { Tabs } from 'expo-router';
import { Home, Calendar, Bell, User } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { usePushRegistration } from '../../src/hooks/usePushRegistration';
import { useMyNotifications } from '../../src/hooks/useMyNotifications';

export default function TabsLayout() {
  usePushRegistration();
  const { data: notifications } = useMyNotifications();
  const unreadCount = notifications?.filter(n => !n.readAt).length || 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          elevation: 0,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Bell size={size} color={color} />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-2 bg-red-500 rounded-full min-w-[16px] h-[16px] items-center justify-center px-1">
                  <Text className="text-[10px] text-white font-bold">{unreadCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
