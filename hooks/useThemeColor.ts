/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useThemeContext } from '@/contexts/ThemedContext';
import type { ThemeColors } from '@/utils/Colors';

type StringColorKey = { [K in keyof ThemeColors]: ThemeColors[K] extends string ? K : never }[keyof ThemeColors];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: StringColorKey,
) {
  const { theme, colors } = useThemeContext();
  return props[theme] ?? colors[colorName];
}
