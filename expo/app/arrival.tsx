import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2, ChevronLeft } from 'lucide-react-native';
import { GradientMesh } from '@/components/GradientMesh';
import { getStyleById } from '@/utils/cardStyles';
import {
  getPreferredStyle,
  recordArrivalAndCheckShare,
} from '@/utils/arrivalTracker';

const { width: SW, height: SH } = Dimensions.get('window');

const SERIF = Platform.select({
  ios: 'Didot',
  android: 'serif',
  web: 'Didot, "Playfair Display", "Cormorant Garamond", Georgia, serif',
});

const SANS = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif',
  web: '"Avenir Next", Avenir, Montserrat, sans-serif',
});

export default function ArrivalScreen() {
  const insets = useSafeAreaInsets();
  const { mantraText = '', arrivedAt = '' } = useLocalSearchParams<{
    mantraText: string;
    arrivedAt: string;
  }>();

  const [showShareButton, setShowShareButton] = useState(false);
  const [cardStyle, setCardStyle] = useState(() => getStyleById('ember'));

  const labelAnim = useRef(new Animated.Value(0)).current;
  const mantraAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const [shouldShow, styleId] = await Promise.all([
        recordArrivalAndCheckShare(),
        getPreferredStyle(),
      ]);
      setShowShareButton(shouldShow);
      setCardStyle(getStyleById(styleId));
    })();
  }, []);

  useEffect(() => {
    const spring = (anim: Animated.Value) =>
      Animated.spring(anim, {
        toValue: 1,
        stiffness: 80,
        damping: 14,
        mass: 1,
        useNativeDriver: true,
      });

    Animated.parallel([
      Animated.sequence([Animated.delay(200), spring(labelAnim)]),
      Animated.sequence([Animated.delay(500), spring(mantraAnim)]),
      Animated.sequence([Animated.delay(900), spring(buttonAnim)]),
    ]).start();
  }, [labelAnim, mantraAnim, buttonAnim]);

  const mkAnim = (anim: Animated.Value, ty: number) => ({
    opacity: anim,
    transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [ty, 0] }) },
    ],
  });

  const shadow = {
    textShadowColor: cardStyle.textShadowColor,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  };

  return (
    <View style={styles.container}>
      {/* 1 — Gradient mesh */}
      <GradientMesh
        cardStyle={cardStyle}
        width={SW}
        height={SH}
        style={StyleSheet.absoluteFill}
      />

      {/* 2 — Vignettes */}
      <LinearGradient
        colors={[`rgba(0,0,0,${cardStyle.overlayStrength + 0.15})`, 'transparent']}
        locations={[0, 0.45]}
        style={styles.vignetteTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', `rgba(0,0,0,${cardStyle.overlayStrength + 0.2})`]}
        locations={[0.5, 1]}
        style={styles.vignetteBottom}
        pointerEvents="none"
      />
      <View
        style={[
          styles.centreDarken,
          { backgroundColor: `rgba(0,0,0,${cardStyle.overlayStrength * 0.4})` },
        ]}
        pointerEvents="none"
      />

      {/* 3 — Back chevron */}
      <Animated.View
        style={[styles.backRow, { paddingTop: insets.top + 8 }, mkAnim(labelAnim, 8)]}
      >
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => router.back()}
          hitSlop={16}
        >
          <ChevronLeft size={22} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </Animated.View>

      {/* 4 — Timestamp */}
      <Animated.View
        style={[styles.topLabel, { top: insets.top + 56 }, mkAnim(labelAnim, 10)]}
      >
        <Text style={[styles.arrivedText, shadow]}>
          {arrivedAt
            ? `ARRIVED AT ${arrivedAt.toUpperCase()}`
            : 'YOUR MANTRA ARRIVED'}
        </Text>
      </Animated.View>

      {/* 5 — Mantra + share button (golden-ratio offset) */}
      <View style={styles.mantraArea} pointerEvents="box-none">
        <Animated.View style={[styles.mantraWrap, mkAnim(mantraAnim, 24)]}>
          <Text style={[styles.mantraText, shadow]}>{mantraText}</Text>
        </Animated.View>

        {showShareButton && (
          <Animated.View style={[styles.shareBtnWrap, mkAnim(buttonAnim, 12)]}>
            <Pressable
              style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}
              onPress={() =>
                router.push({
                  pathname: '/share-card',
                  params: { mantraText, arrivedAt },
                })
              }
            >
              <Share2 size={15} color="rgba(255,255,255,0.85)" />
              <Text style={[styles.shareBtnText]}>Share this moment</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>

      {/* 6 — Watermark */}
      <View style={[styles.watermark, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={[styles.watermarkText, shadow]}>Mantra — On Time</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  vignetteTop: { ...StyleSheet.absoluteFillObject, height: SH * 0.45 },
  vignetteBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SH * 0.45,
  },
  centreDarken: { ...StyleSheet.absoluteFillObject },

  backRow: { position: 'absolute', top: 0, left: 12, zIndex: 10 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  topLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  arrivedText: {
    fontSize: 11,
    fontWeight: '500' as const,
    fontFamily: SANS,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 4,
  },

  mantraArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SH * 0.06,
  },
  mantraWrap: { paddingHorizontal: 40, maxWidth: 420 },
  mantraText: {
    fontSize: 36,
    fontWeight: '400' as const,
    fontFamily: SERIF,
    fontStyle: 'italic' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 56,
    letterSpacing: 0.5,
  },

  shareBtnWrap: { marginTop: 40 },
  shareBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '500' as const,
    fontFamily: SANS,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.8,
  },

  watermark: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  watermarkText: {
    fontSize: 11,
    fontWeight: '400' as const,
    fontFamily: SANS,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 3,
  },

  pressed: { opacity: 0.6 },
});
