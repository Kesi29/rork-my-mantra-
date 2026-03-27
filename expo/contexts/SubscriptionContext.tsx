import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';

let IAP: typeof import('react-native-iap') | null = null;
let iapConnected = false;

// Change this to match the product ID you create in App Store Connect
const SUBSCRIPTION_SKU = 'pro_monthly';

async function connectIAP() {
  if (iapConnected || Platform.OS === 'web') return;
  try {
    const mod = await import('react-native-iap');
    IAP = mod;
    await mod.initConnection();
    iapConnected = true;
    console.log('[IAP] Connected');
  } catch (e) {
    console.log('[IAP] Connection error:', e);
  }
}

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isPro, setIsPro] = useState(false);
  const [ready, setReady] = useState(false);
  const listenerCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    connectIAP().then(() => {
      if (iapConnected) setReady(true);
    });

    return () => {
      listenerCleanup.current?.();
      if (IAP && iapConnected) {
        IAP.endConnection();
      }
    };
  }, []);

  useEffect(() => {
    if (!IAP || !ready) return;

    const purchaseSub = IAP.purchaseUpdatedListener(async (purchase: any) => {
      if (purchase.transactionReceipt || purchase.id) {
        try {
          await IAP!.finishTransaction({ purchase, isConsumable: false });
          setIsPro(true);
          queryClient.invalidateQueries({ queryKey: ['iap_purchases'] });
          console.log('[IAP] Transaction finished, isPro = true');
        } catch (e) {
          console.log('[IAP] Finish transaction error:', e);
        }
      }
    });

    const errorSub = IAP.purchaseErrorListener((error: any) => {
      if (error.code !== 'E_USER_CANCELLED') {
        console.log('[IAP] Purchase error:', error);
      }
    });

    listenerCleanup.current = () => {
      purchaseSub.remove();
      errorSub.remove();
    };

    return () => {
      purchaseSub.remove();
      errorSub.remove();
    };
  }, [ready, queryClient]);

  const productQuery = useQuery({
    queryKey: ['iap_product', ready],
    queryFn: async () => {
      if (!IAP || !iapConnected) return null;
      try {
        const products = await IAP.fetchProducts({ skus: [SUBSCRIPTION_SKU], type: 'subs' });
        console.log('[IAP] Product fetched:', products[0]?.id, products);
        return products[0] ?? null;
      } catch (e) {
        console.log('[IAP] Error fetching product:', e);
        return null;
      }
    },
    staleTime: 1000 * 60 * 10,
  });

  useQuery({
    queryKey: ['iap_purchases', ready],
    queryFn: async () => {
      if (!IAP || !iapConnected) return false;
      try {
        const purchases = await IAP.getAvailablePurchases();
        const hasPro = purchases.some((p: any) => p.productId === SUBSCRIPTION_SKU);
        setIsPro(hasPro);
        console.log('[IAP] Existing subscription check, isPro:', hasPro);
        return hasPro;
      } catch (e) {
        console.log('[IAP] Error checking purchases:', e);
        return false;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!IAP) throw new Error('In-app purchases not available');
      await IAP.requestPurchase({
        request: {
          apple: { sku: SUBSCRIPTION_SKU },
        },
        type: 'subs',
      });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!IAP) throw new Error('In-app purchases not available');
      const purchases = await IAP.getAvailablePurchases();
      const hasPro = purchases.some((p: any) => p.productId === SUBSCRIPTION_SKU);
      setIsPro(hasPro);
      return hasPro;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['iap_purchases'] });
    },
  });

  const { mutateAsync: purchaseAsync } = purchaseMutation;
  const { mutateAsync: restoreAsync } = restoreMutation;

  const purchase = useCallback(() => purchaseAsync(), [purchaseAsync]);
  const restore = useCallback(() => restoreAsync(), [restoreAsync]);

  return {
    isPro,
    product: productQuery.data ?? null,
    isLoadingProduct: productQuery.isLoading,
    purchase,
    isPurchasing: purchaseMutation.isPending,
    restore,
    isRestoring: restoreMutation.isPending,
    iapConnected,
  };
});
