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
      <View className={cn("w-full mb-4", className)}>
        {label && (
          <Text className="text-sm font-semibold text-text dark:text-text-dark mb-2 ml-1">
            {label}
          </Text>
        )}
        <View
          className={cn(
            "flex-row items-center rounded-2xl bg-gray-100 dark:bg-slate-800 border-2 border-transparent px-4 h-14",
            "focus-within:border-primary dark:focus-within:border-primary",
            error && "border-destructive dark:border-destructive-dark focus-within:border-destructive dark:focus-within:border-destructive-dark"
          )}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className="flex-1 text-base text-text dark:text-text-dark"
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
