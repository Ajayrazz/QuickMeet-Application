import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Image } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

// --- Badge ---
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-0.5",
  {
    variants: {
      variant: {
        default: "bg-primary/10 dark:bg-primary-dark/20",
        secondary: "bg-gray-100 dark:bg-slate-800",
        destructive: "bg-red-100 dark:bg-red-900/30",
        success: "bg-green-100 dark:bg-green-900/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const badgeTextVariants = cva("text-xs font-semibold", {
  variants: {
    variant: {
      default: "text-primary dark:text-primary-light",
      secondary: "text-gray-700 dark:text-gray-300",
      destructive: "text-red-700 dark:text-red-300",
      success: "text-green-700 dark:text-green-300",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends React.ComponentPropsWithoutRef<typeof View>, VariantProps<typeof badgeVariants> {
  label: string;
}

export const Badge = ({ className, variant, label, ...props }: BadgeProps) => {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      <Text className={cn(badgeTextVariants({ variant }))}>{label}</Text>
    </View>
  );
};

// --- Avatar ---
export interface AvatarProps {
  url?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar = ({ url, fallback, size = 'md', className }: AvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 rounded-full",
    md: "w-12 h-12 rounded-full",
    lg: "w-16 h-16 rounded-full",
  };

  return (
    <View className={cn("bg-indigo-100 dark:bg-indigo-900 items-center justify-center overflow-hidden", sizeClasses[size], className)}>
      {url ? (
        <Image source={{ uri: url }} className="w-full h-full" />
      ) : (
        <Text className="text-primary dark:text-primary-light font-bold text-lg">
          {fallback.charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  );
};

// --- Skeleton ---
export const Skeleton = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) => {
  const [fadeAnim] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={cn("bg-gray-200 dark:bg-slate-700 rounded-md", className)}
      {...props}
    />
  );
};

// --- EmptyState ---
export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({ title, description, icon, action, className }: EmptyStateProps) => {
  return (
    <View className={cn("flex-1 items-center justify-center p-6", className)}>
      {icon && <View className="mb-6 opacity-80">{icon}</View>}
      <Text className="text-2xl font-bold text-text dark:text-text-dark text-center mb-2">
        {title}
      </Text>
      <Text className="text-text-muted dark:text-text-muted-dark text-center mb-6 max-w-xs">
        {description}
      </Text>
      {action && <View>{action}</View>}
    </View>
  );
};
