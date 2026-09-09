import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  /** Outer diameter of the ring in px. */
  size: number;
  /** Stroke thickness of both the track and the progress arc. */
  strokeWidth: number;
  /** Progress as a percentage. Values above 100 are clamped for the arc. */
  percentage: number;
  /** Colour of the progress arc. */
  color: string;
  /** Colour of the unfilled track behind the arc. */
  trackColor: string;
  /** Centered content (icon, label, ...). */
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * A single-value circular gauge. Used on the Budget screen as the primary
 * spend indicator: the arc length, its colour and any center label together
 * replace the old horizontal bar + status pill + percentage text.
 */
export default function BudgetRing({
  size,
  strokeWidth,
  percentage,
  color,
  trackColor,
  children,
  style,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const dashOffset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <View style={[{ width: size, height: size }, styles.wrap, style]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
