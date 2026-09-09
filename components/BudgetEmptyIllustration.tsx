import React from 'react';
import Svg, { Circle } from 'react-native-svg';

import { useThemeContext } from '@/contexts/ThemedContext';

/**
 * Budget-specific empty-state graphic: an unfilled, dashed budget ring with a
 * target at its center - the same ring motif used on every budgeted row, shown
 * here with nothing tracked against it yet.
 */
const BudgetEmptyIllustration = ({ size = 120 }: { size?: number }) => {
  const { colors } = useThemeContext();

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Circle cx={100} cy={100} r={78} fill={colors.primary} opacity={0.08} />
      <Circle cx={152} cy={54} r={5} fill={colors.accent} />
      <Circle cx={54} cy={58} r={3.5} fill={colors.primary} opacity={0.35} />
      <Circle cx={142} cy={140} r={3} fill={colors.primary} opacity={0.35} />

      <Circle
        cx={100}
        cy={100}
        r={46}
        fill="none"
        stroke={colors.primary}
        strokeOpacity={0.4}
        strokeWidth={10}
        strokeDasharray="2 13"
        strokeLinecap="round"
      />

      <Circle
        cx={100}
        cy={100}
        r={17}
        fill="none"
        stroke={colors.primary}
        strokeWidth={3}
        opacity={0.5}
      />
      <Circle cx={100} cy={100} r={5.5} fill={colors.primary} />
    </Svg>
  );
};

export default BudgetEmptyIllustration;
