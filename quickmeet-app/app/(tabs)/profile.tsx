import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { LogOut, User, Moon, Bell, Trash2, Edit2 } from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/auth.store';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Avatar } from '../../src/components/ui/Misc';
import { useColorScheme } from 'nativewind';
import { Input } from '../../src/components/ui/Input';

export default function ProfileScreen() {
  const { user, clearSession } = useAuthStore();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSaveProfile = () => {
    // In a real app, this would dispatch an API call to update the user
    // For now we'll just toggle editing state back off
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: () => clearSession()
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? Please contact support to proceed with account deletion.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Contact Support", 
          style: "destructive",
          onPress: () => {
            // Stub for contacting support
            Alert.alert("Support", "An email draft to support@quickmeet.com has been simulated.");
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView contentContainerClassName="p-6 pb-24 pt-12">
        <Text className="text-3xl font-bold text-text dark:text-text-dark mb-6">Profile</Text>
        
        {/* User Info Card */}
        <Card className="p-6 items-center mb-6">
          <Avatar fallback={user?.name || 'User'} size="lg" className="mb-4" />
          
          {isEditing ? (
            <View className="w-full">
              <Input 
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                className="mb-4"
              />
              <Button label="Save Changes" onPress={handleSaveProfile} />
            </View>
          ) : (
            <>
              <Text className="text-2xl font-bold text-text dark:text-text-dark mb-1">
                {user?.name || 'User'}
              </Text>
              <Text className="text-text-muted dark:text-text-muted-dark mb-4">
                {user?.email || 'user@example.com'}
              </Text>
              <Button 
                variant="secondary" 
                label="Edit Profile" 
                leftIcon={<Edit2 size={16} color="#64748b" />}
                onPress={() => setIsEditing(true)}
              />
            </>
          )}
        </Card>

        {/* Settings */}
        <Text className="text-xl font-bold text-text dark:text-text-dark mb-4 mt-2">Settings</Text>
        
        <Card className="mb-6">
          <View className="flex-row justify-between items-center p-4 border-b border-border dark:border-border-dark">
            <View className="flex-row items-center">
              <Moon size={20} className="text-text-muted dark:text-text-muted-dark mr-3" />
              <Text className="text-base font-medium text-text dark:text-text-dark">Dark Mode</Text>
            </View>
            <Switch
              value={colorScheme === 'dark'}
              onValueChange={toggleColorScheme}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={colorScheme === 'dark' ? '#6366f1' : '#f4f3f4'}
            />
          </View>
          
          <View className="flex-row justify-between items-center p-4">
            <View className="flex-row items-center">
              <Bell size={20} className="text-text-muted dark:text-text-muted-dark mr-3" />
              <Text className="text-base font-medium text-text dark:text-text-dark">Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notificationsEnabled ? '#6366f1' : '#f4f3f4'}
            />
          </View>
        </Card>

        {/* Danger Zone */}
        <Text className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 mt-2">Danger Zone</Text>
        
        <TouchableOpacity 
          onPress={handleLogout}
          className="flex-row items-center p-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl mb-3 active:opacity-70"
        >
          <LogOut size={20} className="text-text-muted dark:text-text-muted-dark mr-3" />
          <Text className="text-base font-medium text-text dark:text-text-dark flex-1">Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleDeleteAccount}
          className="flex-row items-center p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-xl active:opacity-70"
        >
          <Trash2 size={20} className="text-red-600 dark:text-red-400 mr-3" />
          <Text className="text-base font-medium text-red-600 dark:text-red-400 flex-1">Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
