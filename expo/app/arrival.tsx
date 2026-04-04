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
import { Share2 } from 'lucide-react-native';
import { GradientMesh } from '@/components/GradientMesh';
import { getStyleById } from '@/utils/cardStyles';
import {
  getPreferredStyle,
  recordArrivalAndCheckShare,
} from '@/utils/arrivalTracker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ArrivalScreen() {
  const insets = useSafeAreaInsets();
  const { mantraText = '', arrivedAt = '' } = useLocalSearchParams<{
    mantraText: string;
    arrivedAt: string;
  }>();

  const [showShareButton, setShowShareButton] = useState(false);
  const [cardStyle, setCardStyle] = useState(() => getStyleById('ember'));

  // Animated values: 0 = hidden (fade + translateY), 1 = visible
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
      Animated.sequence([Animated.delay(100), spring(labelAnim)]),
      Animated.sequence([Animated.delay(300), spring(mantraAnim)]),
      Animated.sequence([Animated.delay(700), spring(buttonAnim)]),
    ]).start();
  }, [labelAnim, mantraAnim, buttonAnim]);

  const labelAnimStyle = {
    opacity: labelAnim,
    transform: [
      {
        translateY: labelAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  };

  const mantraAnimStyle = {
    opacity: mantraAnim,
    transform: [
      {
        translateY: mantraAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const buttonAnimStyle = {
    opacity: buttonAnim,
    transform: [
      {
        translateY: buttonAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  };

  const handleSharePress = () => {
    router.push({ pathname: '/share-card', params: { mantraText } });
  };

  return (
    <View style={styles.container}>
      {/* Full-bleed gradient mesh background */}
      <GradientMesh
        cardStyle={cardStyle}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        style={StyleSheet.absoluteFill}
      />

      {/* Top — "Arrived at HH:MM" */}
      <Animated.View
        style={[
          styles.topLabel,
          { paddingTop: insets.top + 20 },
          labelAnimStyle,
        ]}
      >
        <Text style={styles.arrivedText}>
          {arrivedAt ? `Arrived at ${arrivedAt}` : 'Your mantra arrived'}
        </Text>
      </Animated.View>

      {/* Center — mantra + share button */}
      <View style={styles.centerContent}>
        <Animated.Text style={[styles.mantraText, mantraAnimStyle]}>
          {mantraText}
        </Animated.Text>

        {showShareButton && (
          <Animated.View style={[styles.shareButtonWrapper, buttonAnimStyle]}>
            <Pressable
              style={({ pressed }) => [
                styles.shareBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={handleSharePress}
            >
              <Share2 size={16} color="rgba(255,255,255,0.70)" />
              <Text style={styles.shareBtnText}>Share this moment</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>

      {/* Bottom watermark */}
      <View style={[styles.watermark, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.watermarkText}>Mantra — On Time</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  arrivedText: {
    fontSize: 12,
    fontFamily: Platform.select({
      ios: 'Courier New',
      android: 'monospace',
      web: 'monospace',
    }),
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.5,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    gap: 40,
  },
  mantraText: {
    fontSize: 32,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: 'Georgia, serif',
    }),
    fontStyle: 'italic' as const,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: 0.2,
  },
  shareButtonWrapper: {
    alignItems: 'center',
  },
  shareBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  btnPressed: {
    opacity: 0.65,
  },
  shareBtnText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.70)',
    letterSpacing: 0.4,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif',
      web: 'sans-serif',
    }),
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
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 2,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif',
      web: 'sans-serif',
    }),
  },
});
