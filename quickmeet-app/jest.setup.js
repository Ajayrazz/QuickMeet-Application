// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }: any) => children,
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const View = require('react-native').View;
  const SafeAreaView = ({ children }: any) => <View>{children}</View>;
  SafeAreaView.displayName = 'SafeAreaView';
  return {
    SafeAreaProvider: ({ children }: any) => <View>{children}</View>,
    SafeAreaConsumer: ({ children }: any) => children(inset),
    SafeAreaView,
    useSafeAreaInsets: jest.fn().mockReturnValue(inset),
  };
});


