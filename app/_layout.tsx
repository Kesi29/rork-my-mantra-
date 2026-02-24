import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MantraProvider } from '@/contexts/MantraContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

SplashScreen.preventAutoHideAsync().catch(() => { /* noop */ });

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SubscriptionProvider>
      <MantraProvider>
        {children}
      </MantraProvider>
    </SubscriptionProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Providers>
          <RootLayoutNav />
        </Providers>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
