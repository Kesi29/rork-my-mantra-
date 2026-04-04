import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Filter, FeGaussianBlur, Rect, Circle } from 'react-native-svg';
import type { CardStyle } from '@/utils/cardStyles';

interface Props {
  cardStyle: CardStyle;
  width: number;
  height: number;
  style?: ViewStyle;
}

/**
 * Renders a gradient mesh background using SVG blurred circles layered over a
 * base fill — creating an aurora/lava-lamp organic effect.
 *
 * Each blob is a large circle with heavy Gaussian blur applied via an SVG filter.
 * The filter region is extended (300%×300%) so blur doesn't clip at edges.
 */
export function GradientMesh({ cardStyle, width, height, style }: Props) {
  const stdDev = Math.min(width, height) * 0.18;

  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <Filter
            id="meshBlur"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <FeGaussianBlur stdDeviation={stdDev} />
          </Filter>
        </Defs>

        {/* Base fill */}
        <Rect x={0} y={0} width={width} height={height} fill={cardStyle.baseFill} />

        {/* Blurred color blobs */}
        {cardStyle.blobs.map((blob, i) => (
          <Circle
            key={i}
            cx={blob.x * width}
            cy={blob.y * height}
            r={blob.radius * Math.min(width, height)}
            fill={blob.color}
            filter="url(#meshBlur)"
            opacity={i === 0 ? 0.9 : 0.75}
          />
        ))}
      </Svg>
    </View>
  );
}
