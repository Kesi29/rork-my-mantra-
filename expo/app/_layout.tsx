import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
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
      <Stack.Screen
        name="arrival"
        options={{
          presentation: 'modal',
          headerShown: false,
          // Swipe-down to dismiss
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen
        name="share-card"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Handle notification taps — route to the Arrival screen
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const mantraText =
          response.notification.request.content.body ?? '';
        const arrivedAt = new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });

        try {
          router.push({
            pathname: '/arrival',
            params: { mantraText, arrivedAt },
          });
        } catch (e) {
          console.warn('[Notifications] Could not navigate to arrival screen', e);
        }
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SubscriptionProvider>
          <MantraProvider>
            <RootLayoutNav />
          </MantraProvider>
        </SubscriptionProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
