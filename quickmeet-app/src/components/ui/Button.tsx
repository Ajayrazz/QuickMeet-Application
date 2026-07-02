import * as React from "react";
import { ActivityIndicator, Pressable, Text, View, Animated } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-xl px-4 py-3 active:opacity-80 disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary dark:bg-primary-dark",
        secondary: "bg-border dark:bg-border-dark",
        ghost: "bg-transparent",
        destructive: "bg-destructive dark:bg-destructive-dark",
      },
      size: {
        default: "h-12",
        sm: "h-10 px-3",
        lg: "h-14 px-6",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

const textVariants = cva("font-semibold text-center", {
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-text dark:text-text-dark",
      ghost: "text-primary dark:text-primary-light",
      destructive: "text-white",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      icon: "text-base",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof buttonVariants> {
  label?: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  (
    { className, variant, size, label, loading, disabled, leftIcon, rightIcon, children, onPressIn, onPressOut, ...props },
    ref
  ) => {
    const [scale] = React.useState(() => new Animated.Value(1));

    const handlePressIn = (e: any) => {
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
      if (onPressIn) onPressIn(e);
    };

    const handlePressOut = (e: any) => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
      if (onPressOut) onPressOut(e);
    };

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          ref={ref}
          disabled={disabled || loading}
          className={cn(buttonVariants({ variant, size, className }))}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityState={{ disabled: disabled || loading, busy: loading }}
          {...props}
        >
        {loading ? (
          <ActivityIndicator color={variant === "secondary" ? "#64748b" : "#ffffff"} />
        ) : (
          <>
            {leftIcon && <View className="mr-2">{leftIcon}</View>}
            {label ? (
              <Text className={cn(textVariants({ variant, size }))}>{label}</Text>
            ) : (
              children
            )}
            {rightIcon && <View className="ml-2">{rightIcon}</View>}
          </>
        )}
        </Pressable>
      </Animated.View>
    );
  }
);
Button.displayName = "Button";
