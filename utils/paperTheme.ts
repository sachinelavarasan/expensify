import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';
import { ThemeColors } from './Colors';

// Maps the app's own ThemeColors onto react-native-paper's MD3 theme tokens,
// so paper-dates' TimePickerModal (which reads colors from PaperProvider,
// not from ThemedContext) renders in the app's palette instead of Paper's
// default purple MD3 theme.
export const getPaperTheme = (colors: ThemeColors, dark: boolean): MD3Theme => {
  const base = dark ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    dark,
    colors: {
      ...base.colors,
      primary: colors.primary,
      onPrimary: colors.onPrimary,
      primaryContainer: colors.primary,
      onPrimaryContainer: colors.onPrimary,
      secondary: colors.secondary,
      onSecondary: colors.onPrimary,
      background: colors.cardBg,
      onBackground: colors.title,
      surface: colors.cardBg,
      onSurface: colors.title,
      surfaceVariant: colors.inputColor,
      onSurfaceVariant: colors.description,
      outline: colors.inputBorder,
      outlineVariant: colors.borderColor,
      error: colors.expense,
      onError: colors.onPrimary,
      scrim: colors.scrim,
      backdrop: colors.scrim,
      // TimePickerModal's dialog card reads elevation.level3 (not surface)
      // for its background - override every level so it matches cardBg too.
      elevation: {
        level0: 'transparent',
        level1: colors.cardBg,
        level2: colors.cardBg,
        level3: colors.cardBg,
        level4: colors.cardBg,
        level5: colors.cardBg,
      },
    },
  };
};
