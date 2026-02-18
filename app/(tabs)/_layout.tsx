import { Tabs } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500' as const,
          letterSpacing: 2,
          textTransform: 'uppercase' as const,
        },
        tabBarIconStyle: {
          display: 'none',
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'TODAY',
        }}
      />
      <Tabs.Screen
        name="mantras"
        options={{
          title: 'MANTRAS',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
        }}
      />
    </Tabs>
  );
}
