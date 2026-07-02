import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useUIStore } from '../../src/stores/ui.store';
import { Button } from '../../src/components/ui/Button';
import { Clock, CalendarCheck, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Book Instantly',
    description: 'Schedule appointments with your favorite professionals effortlessly.',
    icon: <CalendarCheck size={80} color="#6366f1" />,
  },
  {
    id: 2,
    title: 'Live Queue Updates',
    description: 'No more waiting rooms. Track your exact queue position and ETA in real-time.',
    icon: <Clock size={80} color="#6366f1" />,
  },
  {
    id: 3,
    title: 'Never Miss a Turn',
    description: 'Get notified automatically when it\'s almost your turn to be served.',
    icon: <Zap size={80} color="#6366f1" />,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const setHasSeenOnboarding = useUIStore((state) => state.setHasSeenOnboarding);
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = e.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  const handleFinish = () => {
    setHasSeenOnboarding(true);
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={{ width }} className="items-center justify-center px-8">
            <View className="mb-12 bg-indigo-50 dark:bg-slate-800 p-8 rounded-full">
              {slide.icon}
            </View>
            <Text className="text-3xl font-bold text-center text-text dark:text-text-dark mb-4">
              {slide.title}
            </Text>
            <Text className="text-center text-text-muted dark:text-text-muted-dark text-lg px-4">
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className="px-6 pb-12 pt-6">
        <View className="flex-row justify-center mb-8 space-x-2">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                activeIndex === index
                  ? 'w-8 bg-primary dark:bg-primary-light'
                  : 'w-2 bg-gray-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </View>

        <Button
          label={activeIndex === slides.length - 1 ? 'Get Started' : 'Swipe to continue'}
          onPress={activeIndex === slides.length - 1 ? handleFinish : undefined}
          disabled={activeIndex !== slides.length - 1}
        />
      </View>
    </View>
  );
}
