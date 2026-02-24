import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';

let Purchases: any = null;
type PurchasesOffering = any;

let rcConfigured = false;

function getRCApiKey(): string | undefined {
  if (__DEV__ || Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
  }
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  });
}

async function initRC() {
  if (rcConfigured) return;
  try {
    const mod = await import('react-native-purchases');
    Purchases = mod.default;
    const apiKey = getRCApiKey();
    if (!apiKey) {
      console.log('[RC] No API key found, skipping configuration');
      return;
    }
    console.log('[RC] Configuring with key:', apiKey.substring(0, 8) + '...');
    Purchases.configure({ apiKey });
    rcConfigured = true;
    console.log('[RC] Configured successfully');
  } catch (e) {
    console.log('[RC] Configuration error:', e);
  }
}

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isPro, setIsPro] = useState<boolean>(false);
  const [rcReady, setRcReady] = useState<boolean>(false);

  useEffect(() => {
    initRC().then(() => {
      if (rcConfigured) {
        setRcReady(true);
      }
    });
  }, []);

  const customerInfoQuery = useQuery({
    queryKey: ['rc_customer_info', rcReady],
    queryFn: async () => {
      if (!rcConfigured || !Purchases) return null;
      try {
        const info = await Purchases.getCustomerInfo();
        console.log('[RC] Customer info fetched');
        return info;
      } catch (e) {
        console.log('[RC] Error fetching customer info:', e);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const offeringsQuery = useQuery({
    queryKey: ['rc_offerings', rcReady],
    queryFn: async (): Promise<PurchasesOffering | null> => {
      if (!rcConfigured || !Purchases) return null;
      try {
        const offerings = await Purchases.getOfferings();
        console.log('[RC] Offerings fetched:', offerings.current?.identifier);
        return offerings.current ?? null;
      } catch (e) {
        console.log('[RC] Error fetching offerings:', e);
        return null;
      }
    },
    staleTime: 1000 * 60 * 10,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageId: string) => {
      if (!Purchases) throw new Error('Purchases not available');
      const offering = offeringsQuery.data;
      if (!offering) throw new Error('No offerings available');
      const pkg = offering.availablePackages.find((p: any) => p.identifier === packageId);
      if (!pkg) throw new Error('Package not found');
      console.log('[RC] Purchasing package:', packageId);
      const result = await Purchases.purchasePackage(pkg);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rc_customer_info'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!Purchases) throw new Error('Purchases not available');
      console.log('[RC] Restoring purchases...');
      const info = await Purchases.restorePurchases();
      return info;
    },
    onSuccess: (info) => {
      queryClient.setQueryData(['rc_customer_info'], info);
    },
  });

  useEffect(() => {
    const info = customerInfoQuery.data;
    if (info) {
      const hasPro = typeof info.entitlements?.active?.['pro'] !== 'undefined';
      setIsPro(hasPro);
      console.log('[RC] isPro:', hasPro);
    }
  }, [customerInfoQuery.data]);

  const { mutateAsync: purchaseAsync } = purchaseMutation;
  const { mutateAsync: restoreAsync } = restoreMutation;

  const purchase = useCallback(
    (packageId: string) => purchaseAsync(packageId),
    [purchaseAsync],
  );

  const restore = useCallback(
    () => restoreAsync(),
    [restoreAsync],
  );

  return {
    isPro,
    offering: offeringsQuery.data ?? null,
    isLoadingOfferings: offeringsQuery.isLoading,
    purchase,
    isPurchasing: purchaseMutation.isPending,
    restore,
    isRestoring: restoreMutation.isPending,
    rcConfigured,
  };
});
