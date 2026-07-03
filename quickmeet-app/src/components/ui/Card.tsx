import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "../../lib/cn";

export type CardProps = ViewProps;

export const Card = React.forwardRef<React.ElementRef<typeof View>, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(
          "rounded-3xl bg-surface dark:bg-surface-dark p-6 shadow-md dark:border dark:border-border-dark",
          className
        )}
        {...props}
      >
        {children}
      </View>
    );
  }
);
Card.displayName = "Card";
