import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientMesh } from '@/components/GradientMesh';
import type { CardStyle } from '@/utils/cardStyles';

interface Props {
  cardStyle: CardStyle;
  mantraText: string;
  arrivedAt?: string;
  width: number;
  height: number;
}

/**
 * The share card — editorial luxury aesthetic (think Aman Resorts).
 *
 * Layers: mesh → vignettes → timestamp → mantra → watermark
 */
export function ShareCardView({
  cardStyle,
  mantraText,
  arrivedAt,
  width,
  height,
}: Props) {
  const scale = width / 390; // normalise against iPhone 14 width
  const mantraSize = Math.max(18, Math.min(width * 0.085, 44));
  const timestampSize = Math.max(8, width * 0.024);
  const watermarkSize = Math.max(8, width * 0.026);
  const paddingH = width * 0.11;
  const watermarkBottom = height * 0.04;
  const timestampTop = height * 0.12;

  const shadow = {
    textShadowColor: cardStyle.textShadowColor,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: Math.max(8, width * 0.02),
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
      {/* 2c — Centre darkening */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: `rgba(0,0,0,${cardStyle.overlayStrength * 0.35})` },
        ]}
        pointerEvents="none"
      />

      {/* 3 — Timestamp (top centre) */}
      {arrivedAt ? (
        <View style={[styles.timestampWrap, { top: timestampTop }]}>
          <Text
            style={[
              styles.timestampText,
              shadow,
              { fontSize: timestampSize, color: cardStyle.watermarkColor },
            ]}
          >
            {arrivedAt.toUpperCase()}
          </Text>
        </View>
      ) : null}

      {/* 4 — Centred mantra text */}
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
              fontSize: mantraSize,
              color: cardStyle.textColor,
              lineHeight: mantraSize * 1.55,
            },
          ]}
        >
          {mantraText}
        </Text>
      </View>

      {/* 5 — Bottom watermark */}
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

const styles = StyleSheet.create({
  centred: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timestampWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  timestampText: {
    fontFamily: SANS,
    fontWeight: '500' as const,
    letterSpacing: 4,
  },
  mantraText: {
    fontFamily: SERIF,
    fontWeight: '400' as const,
    fontStyle: 'italic' as const,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  watermarkWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  watermarkText: {
    fontFamily: SANS,
    fontWeight: '400' as const,
    letterSpacing: 3,
    textAlign: 'center',
  },
});
