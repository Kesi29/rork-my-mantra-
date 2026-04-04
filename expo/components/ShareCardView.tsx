import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { GradientMesh } from '@/components/GradientMesh';
import type { CardStyle } from '@/utils/cardStyles';

interface Props {
  cardStyle: CardStyle;
  mantraText: string;
  width: number;
  height: number;
}

/**
 * The share card layout: gradient mesh background + centered italic mantra
 * text + bottom watermark. Used for both the live preview and the off-screen
 * capture (at logical 360×640, which produces 1080×1920 at 3× DPI).
 */
export function ShareCardView({ cardStyle, mantraText, width, height }: Props) {
  const fontSize = Math.max(16, Math.min(width * 0.095, 52));
  const watermarkSize = Math.max(10, width * 0.026);
  const paddingH = width * 0.09;
  const watermarkBottom = height * 0.04;

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <GradientMesh
        cardStyle={cardStyle}
        width={width}
        height={height}
        style={StyleSheet.absoluteFill}
      />

      {/* Centered mantra text */}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.centered,
          { paddingHorizontal: paddingH },
        ]}
      >
        <Text
          style={[
            styles.mantraText,
            {
              fontSize,
              color: cardStyle.textColor,
              lineHeight: fontSize * 1.42,
            },
          ]}
        >
          {mantraText}
        </Text>
      </View>

      {/* Bottom watermark */}
      <View
        style={[
          styles.watermarkContainer,
          { bottom: watermarkBottom, paddingHorizontal: paddingH },
        ]}
      >
        <Text
          style={[
            styles.watermarkText,
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mantraText: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: 'Georgia, serif',
    }),
    fontStyle: 'italic' as const,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  watermarkContainer: {
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
    fontWeight: '300' as const,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
