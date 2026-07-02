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
          "rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-4 shadow-sm",
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
