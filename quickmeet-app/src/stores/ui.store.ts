import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

export type ColorScheme = 'system' | 'light' | 'dark';

interface UIState {
  colorScheme: ColorScheme;
  hasSeenOnboarding: boolean;
  setColorScheme: (scheme: ColorScheme) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
}

const secureStorage = {
  getItem: (name: string) => {
    return SecureStore.getItemAsync(name);
  },
  setItem: (name: string, value: string) => {
    return SecureStore.setItemAsync(name, value);
  },
  removeItem: (name: string) => {
    return SecureStore.deleteItemAsync(name);
  },
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      colorScheme: 'system',
      hasSeenOnboarding: false,
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
    }),
    {
      name: 'quickmeet-ui-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
