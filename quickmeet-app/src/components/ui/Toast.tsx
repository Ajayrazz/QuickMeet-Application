import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { useToastStore } from '../../stores/toast.store';
import { cn } from '../../lib/cn';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react-native';

export const ToastProvider = () => {
  const { toasts, hide } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <View className="absolute top-12 left-4 right-4 z-50 flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <View
          key={toast.id}
          className={cn(
            "flex-row items-center p-4 rounded-xl shadow-lg pointer-events-auto",
            toast.type === 'success' && "bg-green-100 dark:bg-green-900",
            toast.type === 'error' && "bg-red-100 dark:bg-red-900",
            toast.type === 'info' && "bg-blue-100 dark:bg-blue-900"
          )}
        >
          {toast.type === 'success' && <CheckCircle size={20} color="#16a34a" />}
          {toast.type === 'error' && <AlertCircle size={20} color="#dc2626" />}
          {toast.type === 'info' && <Info size={20} color="#2563eb" />}
          
          <Text
            className={cn(
              "flex-1 ml-3 text-sm font-medium",
              toast.type === 'success' && "text-green-800 dark:text-green-100",
              toast.type === 'error' && "text-red-800 dark:text-red-100",
              toast.type === 'info' && "text-blue-800 dark:text-blue-100"
            )}
          >
            {toast.message}
          </Text>
          
          <Pressable onPress={() => hide(toast.id)} className="ml-2">
            <X size={18} className="text-gray-500" />
          </Pressable>
        </View>
      ))}
    </View>
  );
};
