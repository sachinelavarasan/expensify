import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useThemeContext } from '@/contexts/ThemedContext';

interface EmptystateIllustrationProps {
  size?: number;
}

const EmptystateIllustration = ({ size = 120 }: EmptystateIllustrationProps) => {
  const { colors } = useThemeContext();

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Circle cx={100} cy={105} r={78} fill={colors.primary} opacity={0.08} />
      <Circle cx={150} cy={55} r={5} fill={colors.accent} />
      <Circle cx={60} cy={45} r={3.5} fill={colors.primary} opacity={0.35} />
      <Circle cx={132} cy={35} r={3} fill={colors.primary} opacity={0.35} />
      <Path d="M40 95 L100 75 L160 95 L160 105 L100 125 L40 105 Z" fill={colors.primary} />
      <Path d="M40 95 L100 75 L160 95 L100 115 Z" fill={colors.secondary} />
      <Rect x={52} y={115} width={96} height={50} rx={6} fill={colors.primary} />
      <Path
        d="M52 121 L100 138 L148 121 L148 165 A6 6 0 0 1 142 171 L58 171 A6 6 0 0 1 52 165 Z"
        fill={colors.categoryFallbackBg}
      />
      <Path
        d="M52 121 L100 138 L148 121"
        fill="none"
        stroke={colors.secondary}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default EmptystateIllustration;
