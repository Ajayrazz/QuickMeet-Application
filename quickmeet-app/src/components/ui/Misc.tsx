import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Image } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

// --- Badge ---
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-1",
  {
    variants: {
      variant: {
        default: "bg-primary/10 dark:bg-primary-dark/20",
        secondary: "bg-surface dark:bg-surface-dark border border-border dark:border-border-dark",
        destructive: "bg-destructive/10 dark:bg-destructive-dark/20",
        success: "bg-green-500/10 dark:bg-green-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const badgeTextVariants = cva("text-xs font-bold tracking-wide", {
  variants: {
    variant: {
      default: "text-primary dark:text-primary-light",
      secondary: "text-text-muted dark:text-text-muted-dark",
      destructive: "text-destructive dark:text-destructive-dark",
      success: "text-green-700 dark:text-green-400",
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
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar = ({ url, fallback, size = 'md', className }: AvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 rounded-full",
    md: "w-12 h-12 rounded-full",
    lg: "w-16 h-16 rounded-full",
    xl: "w-24 h-24 rounded-full",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
  }

  return (
    <View className={cn("bg-primary/10 dark:bg-primary-dark/20 items-center justify-center overflow-hidden", sizeClasses[size], className)}>
      {url ? (
        <Image source={{ uri: url }} className="w-full h-full" />
      ) : (
        <Text className={cn("text-primary dark:text-primary-light font-bold", textClasses[size])}>
          {fallback.charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  );
};

// --- Skeleton ---
export const Skeleton = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) => {
  const [fadeAnim] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={cn("bg-border dark:bg-border-dark rounded-xl", className)}
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
    <View className={cn("flex-1 items-center justify-center p-8", className)}>
      {icon && <View className="mb-6 opacity-80">{icon}</View>}
      <Text className="text-2xl font-bold text-text dark:text-text-dark text-center mb-3">
        {title}
      </Text>
      <Text className="text-base text-text-muted dark:text-text-muted-dark text-center mb-8 max-w-sm leading-relaxed">
        {description}
      </Text>
      {action && <View className="w-full max-w-xs">{action}</View>}
    </View>
  );
};
