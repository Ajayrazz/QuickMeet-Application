import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RefreshCcw, AlertTriangle } from 'lucide-react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-background dark:bg-background-dark items-center justify-center p-6">
          <View className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-6">
            <AlertTriangle size={48} className="text-red-600 dark:text-red-400" />
          </View>
          <Text className="text-2xl font-bold text-text dark:text-text-dark text-center mb-2">
            Something went wrong
          </Text>
          <Text className="text-text-muted dark:text-text-muted-dark text-center mb-8">
            {this.state.error?.message || "An unexpected error occurred. Please try again."}
          </Text>
          
          <TouchableOpacity
            onPress={this.handleReset}
            className="bg-indigo-600 flex-row items-center px-6 py-3 rounded-xl active:opacity-80"
          >
            <RefreshCcw size={20} color="white" className="mr-2" />
            <Text className="text-white font-bold text-base">Reload Application</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
