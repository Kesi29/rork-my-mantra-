import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientMesh } from '@/components/GradientMesh';
import type { CardStyle } from '@/utils/cardStyles';

interface Props {
  cardStyle: CardStyle;
  mantraText: string;
  width: number;
  height: number;
}

/**
 * The share card layout rendered at both preview size and full-res capture
 * size (360 x 640 logical → 1080 x 1920 at 3× DPI).
 *
 * Layers:
 *   1. Gradient mesh background
 *   2. Dark vignette overlays (top + bottom + centre tint)
 *   3. Centred mantra text with drop shadow
 *   4. Bottom watermark
 */
export function ShareCardView({ cardStyle, mantraText, width, height }: Props) {
  const fontSize = Math.max(16, Math.min(width * 0.09, 48));
  const watermarkSize = Math.max(9, width * 0.028);
  const paddingH = width * 0.10;
  const watermarkBottom = height * 0.04;

  const shadow = {
    textShadowColor: cardStyle.textShadowColor,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: Math.max(6, width * 0.025),
  };

  return (
    <View style={{ width, height, overflow: 'hidden', backgroundColor: '#000' }}>
      {/* 1 — Mesh */}
      <GradientMesh
        cardStyle={cardStyle}
        width={width}
        height={height}
        style={StyleSheet.absoluteFill}
      />

      {/* 2a — Top vignette */}
      <LinearGradient
        colors={[
          `rgba(0,0,0,${cardStyle.overlayStrength + 0.12})`,
          'transparent',
        ]}
        locations={[0, 0.4]}
        style={[StyleSheet.absoluteFill, { height: height * 0.4 }]}
        pointerEvents="none"
      />

      {/* 2b — Bottom vignette */}
      <LinearGradient
        colors={[
          'transparent',
          `rgba(0,0,0,${cardStyle.overlayStrength + 0.18})`,
        ]}
        locations={[0.5, 1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: height * 0.4,
        }}
        pointerEvents="none"
      />

      {/* 2c — Subtle centre darkening */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: `rgba(0,0,0,${cardStyle.overlayStrength * 0.35})`,
          },
        ]}
        pointerEvents="none"
      />

      {/* 3 — Centred mantra text (nudged slightly above true centre) */}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.centred,
          { paddingHorizontal: paddingH, paddingBottom: height * 0.05 },
        ]}
      >
        <Text
          style={[
            styles.mantraText,
            shadow,
            {
              fontSize,
              color: cardStyle.textColor,
              lineHeight: fontSize * 1.48,
            },
          ]}
        >
          {mantraText}
        </Text>
      </View>

      {/* 4 — Bottom watermark */}
      <View
        style={[
          styles.watermarkWrap,
          { bottom: watermarkBottom, paddingHorizontal: paddingH },
        ]}
      >
        <Text
          style={[
            styles.watermarkText,
            shadow,
            { fontSize: watermarkSize, color: cardStyle.watermarkColor },
          ]}
        >
          Mantra — On Time
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centred: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mantraText: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: 'Georgia, serif',
    }),
    fontWeight: '300' as const,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  watermarkWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  watermarkText: {
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif',
      web: 'sans-serif',
    }),
    fontWeight: '400' as const,
    letterSpacing: 2,
    textAlign: 'center',
  },
});
