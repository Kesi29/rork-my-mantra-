import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Colors from '@/constants/colors';

const TERMS_OF_USE_URL = 'https://mantra-app.my.canva.site/';
const PRIVACY_POLICY_URL = 'https://mantra-app.my.canva.site/';

const FEATURES = [
  '20+ premium mantras across 5 categories',
  'Schedule unique mantras for upcoming days',
  'Custom notification frequency (up to 100/day, user-controlled)',
  'Up to 4 active mantras at once',
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { product, purchase, isPurchasing, restore, isRestoring, isPro } = useSubscription();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handlePurchase = async () => {
    if (!product) {
      Alert.alert('Unavailable', 'Subscription is not available right now. Please try again later.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await purchase();
    } catch (e: unknown) {
      const error = e as { code?: string; message?: string };
      if (error.code === 'E_USER_CANCELLED') {
        return;
      }
      console.log('[Paywall] Purchase error:', e);
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const restored = await restore();
      if (restored) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Restored', 'Your Pro subscription has been restored.');
      } else {
        Alert.alert('No Subscription Found', 'We couldn\'t find an active subscription to restore.');
      }
    } catch (e) {
      console.log('[Paywall] Restore error:', e);
      Alert.alert('Restore Failed', 'Could not restore purchases. Please try again.');
    }
  };

  const rawPrice = (product as any)?.localizedPrice ?? (product as any)?.price ?? null;
  const priceLabel = rawPrice ? String(rawPrice) : 'See App Store';
  const manageSubscriptionUrl = 'https://apps.apple.com/account/subscriptions';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.closeBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          testID="paywall-close"
        >
          <X size={20} color={Colors.text} strokeWidth={1.5} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {isPro ? (
            <>
              <Text style={styles.pageLabel}>MY SUBSCRIPTION</Text>

              <Text style={styles.heroTitle}>Mantra Pro</Text>
              <Text style={styles.heroSubtitle}>Monthly subscription</Text>

              <View style={styles.subscriptionCard}>
                <View style={styles.subscriptionRow}>
                  <Text style={styles.subscriptionLabel}>Plan</Text>
                  <Text style={styles.subscriptionValue}>Mantra Pro</Text>
                </View>
                <View style={styles.subscriptionDivider} />
                <View style={styles.subscriptionRow}>
                  <Text style={styles.subscriptionLabel}>Billing</Text>
                  <Text style={styles.subscriptionValue}>Monthly subscription</Text>
                </View>
                <View style={styles.subscriptionDivider} />
                <View style={styles.subscriptionRow}>
                  <Text style={styles.subscriptionLabel}>Price</Text>
                  <Text style={styles.subscriptionValue}>{priceLabel}</Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [styles.manageBtn, pressed && styles.pressed]}
                onPress={() => Linking.openURL(manageSubscriptionUrl)}
                testID="manage-subscription-btn"
              >
                <Text style={styles.manageBtnText}>MANAGE SUBSCRIPTION</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.pageLabel}>MY MANTRA PRO</Text>

              <Text style={styles.heroTitle}>
                Unlock the{'\n'}full mantra collection.
              </Text>

              <Text style={styles.heroSubtitle}>
                Expand your practice with premium affirmations curated for extended reflection.
              </Text>

              <View style={styles.featuresList}>
                {FEATURES.map((feature, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Check size={14} color={Colors.text} strokeWidth={2.5} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.priceBlock}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Monthly</Text>
                  <View style={styles.priceRight}>
                    <Text style={styles.priceAmount}>{(product as any)?.localizedPrice ?? '$1.99'}</Text>
                    <Text style={styles.pricePeriod}>/mo</Text>
                  </View>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.purchaseBtn,
                  (isPurchasing || isRestoring) && styles.purchaseBtnDisabled,
                  pressed && styles.pressed,
                ]}
                onPress={handlePurchase}
                disabled={isPurchasing || isRestoring}
                testID="purchase-btn"
              >
                {isPurchasing ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.purchaseBtnText}>
                    SUBSCRIBE FOR {(product as any)?.localizedPrice ?? '$1.99'}/MO
                  </Text>
                )}
              </Pressable>

              <Pressable
                style={styles.restoreBtn}
                onPress={handleRestore}
                disabled={isPurchasing || isRestoring}
                testID="restore-btn"
              >
                {isRestoring ? (
                  <ActivityIndicator size="small" color={Colors.textMuted} />
                ) : (
                  <Text style={styles.restoreBtnText}>RESTORE PURCHASES</Text>
                )}
              </Pressable>

              <Text style={styles.legalText}>
                Payment will be charged to your Apple ID account. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. Manage subscriptions in Settings.
              </Text>
            </>
          )}

          <View style={styles.legalLinksRow}>
            <Pressable
              onPress={() => Linking.openURL(TERMS_OF_USE_URL)}
              hitSlop={8}
            >
              <Text style={styles.legalLinkText}>Terms of Use</Text>
            </Pressable>
            <Text style={styles.legalLinkText}> · </Text>
            <Pressable
              onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
              hitSlop={8}
            >
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
  },
  pageLabel: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textMuted,
    letterSpacing: 2.5,
    marginBottom: 20,
    marginTop: 12,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '300' as const,
    color: Colors.text,
    lineHeight: 48,
    letterSpacing: -0.5,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 40,
  },
  featuresList: {
    marginBottom: 40,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
  },
  featureText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  priceBlock: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 20,
    marginBottom: 32,
  },
  priceRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  priceLabel: {
    fontSize: 17,
    fontWeight: '400' as const,
    color: Colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
  },
  priceRight: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '300' as const,
    color: Colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
  },
  pricePeriod: {
    fontSize: 14,
    color: Colors.textMuted,
    marginLeft: 2,
  },
  purchaseBtn: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    width: '100%' as const,
    marginBottom: 16,
  },
  purchaseBtnDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
  purchaseBtnText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.white,
    letterSpacing: 2,
  },
  restoreBtn: {
    alignItems: 'center' as const,
    paddingVertical: 12,
    marginBottom: 20,
  },
  restoreBtnText: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },
  legalText: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 17,
    letterSpacing: 0.1,
  },
  legalLinksRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingBottom: 24,
    marginTop: 16,
  },
  legalLinkText: {
    fontSize: 12,
    color: '#888888',
  },
  subscriptionCard: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
    marginBottom: 24,
  },
  subscriptionRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
  },
  subscriptionDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  subscriptionLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  subscriptionValue: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
  },
  manageBtn: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    width: '100%' as const,
    marginBottom: 10,
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text,
    letterSpacing: 2,
  },
});
