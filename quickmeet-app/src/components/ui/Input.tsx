import * as React from "react";
import { Text, TextInput, View } from "react-native";
import { cn } from "../../lib/cn";

export interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <View className="w-full mb-4">
        {label && (
          <Text className="mb-1.5 text-sm font-medium text-text dark:text-text-dark">
            {label}
          </Text>
        )}
        <View
          className={cn(
            "flex-row items-center rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark px-3 h-12",
            error && "border-destructive dark:border-destructive-dark"
          )}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className={cn(
              "flex-1 text-base text-text dark:text-text-dark",
              className
            )}
            placeholderTextColor="#94a3b8"
            {...props}
          />
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
        {(error || helperText) && (
          <Text
            className={cn(
              "mt-1.5 text-sm",
              error ? "text-destructive dark:text-destructive-dark" : "text-text-muted dark:text-text-muted-dark"
            )}
          >
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);
Input.displayName = "Input";
