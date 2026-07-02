import React, { useEffect, useState } from 'react';
import { Text, Animated } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react-native';

export function OfflineBanner() {
  const isConnected = useNetworkStatus();
  const [slideAnim] = useState(() => new Animated.Value(-100));

  useEffect(() => {
    if (isConnected === false) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, slideAnim]);

  // Don't render anything if we're connected and the animation is finished (hidden)
  // @ts-ignore
  if (isConnected !== false && slideAnim._value === -100) return null;

  return (
    <Animated.View
      style={{ transform: [{ translateY: slideAnim }] }}
      className="absolute top-12 left-4 right-4 z-50 bg-red-500 rounded-xl p-3 flex-row items-center shadow-lg"
    >
      <WifiOff size={20} color="white" />
      <Text className="ml-3 text-white font-semibold text-sm">
        No internet connection. Retrying...
      </Text>
    </Animated.View>
  );
}
