import { Tabs, router } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/hooks/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();
  const isExpert = user?.role === 'expert';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.muted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.main,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: isExpert ? 'Tasks' : 'Patients',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={isExpert ? (focused ? 'checkmark-done' : 'checkmark-done-outline') : (focused ? 'people' : 'people-outline')} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="visits"
        options={{
          title: 'Visits',
          href: user?.role === 'admin' ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
