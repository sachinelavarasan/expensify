export const LightColors = {
  background: '#F5F6FA',
  text: '#141A33',
  primary: '#2A3B8F',
  secondary: '#1C2653',
  arrowColor: '#9297AD',
  monthSwitcher: '#141A33',
  title: '#141A33',
  description: '#5A607A',
  lighterTitle: '#9297AD',
  borderColor: '#DFE2ED',
  borderSelected: '#2A3B8F',
  income: '#2F9E63',
  expense: '#E14848',
  transfer: '#2A3B8F',
  bottomBarBackground: '#F1F2F7',
  bottomBarBackgroundTranslucent: '#F1F2F7CC',
  barBackground: '#E7E9F3',
  topBarColor: '#f5f6fabf',
  themedViewBg: ['#FFFFFF', '#F3F4FA', '#E9EBF4', '#FFFFFF'],
  floatingBtnBg: ['#2A3B8F', '#5B6FE0'],
  cardBg: '#ffffff',
  inputColor: '#F2F4FA',
  inputBorder: '#B9BDCD',
  inputPlaceholder: '#7C8199',
  scrim: 'rgba(0, 0, 0, 0.5)',
  accent: '#FFC83A',
  onPrimary: '#FFFFFF',
  // Translucent overlays tinted with onPrimary, for use on top of a
  // colors.primary surface (icon-badge fills, dividers, chart strokes) -
  // derived from onPrimary so they stay legible if onPrimary ever flips
  // from light to dark text between themes.
  onPrimarySubtle: '#FFFFFF2E',
  onPrimaryBorder: '#FFFFFF38',
  onPrimaryStrong: '#FFFFFFF2',
  shadow: '#000000',
  favorite: '#FFB347',
  sun: '#FFAA00',
  categoryFallbackBg: '#151933',
  categoryFallbackIcon: '#E5E8F4',
  danger: '#CC1928',
};

export const DarkColors = {
  background: '#0B0E1C',
  text: '#EDEFF7',
  primary: '#5B6FE0',
  secondary: '#B3BCEE',
  arrowColor: '#AEB3CC',
  monthSwitcher: '#EDEFF7',
  title: '#EDEFF7',
  description: '#AEB3CC',
  lighterTitle: '#787E9E',
  income: '#3FBE85',
  borderColor: '#232A4D',
  borderSelected: '#5B6FE0',
  expense: '#F2685F',
  transfer: '#5B6FE0',
  bottomBarBackground: '#10142A',
  bottomBarBackgroundTranslucent: '#10142ACC',
  barBackground: '#1A2040',
  topBarColor: '#0b0e1c9c',
  themedViewBg: ['#10142A', '#0B0E1C', '#070914', '#10142A'],
  floatingBtnBg: ['#2A3B8F', '#5B6FE0'],
  cardBg: '#141833',
  inputColor: '#ffffff04',
  inputBorder: '#ffffff33',
  inputPlaceholder: '#ffffff66',
  scrim: 'rgba(0, 0, 0, 0.6)',
  accent: '#FFC83A',
  onPrimary: '#0B0E1C',
  onPrimarySubtle: '#0B0E1C2E',
  onPrimaryBorder: '#0B0E1C38',
  onPrimaryStrong: '#0B0E1CF2',
  shadow: '#000000',
  favorite: '#FFB347',
  sun: '#FFAA00',
  categoryFallbackBg: '#151933',
  categoryFallbackIcon: '#E5E8F4',
  danger: '#E5484D',
};

export type ThemeColors = typeof LightColors;

// Self-contained sub-widget palettes: each of these intentionally does NOT
// react to the app's light/dark theme (they're their own fixed design), but
// are centralized here so no raw hex lives inline in components.

export const NativeDarkPickerTheme = {
  backgroundColor: '#0E0E10',
  textHeaderColor: '#6B5DE6',
  textDefaultColor: '#717171',
  selectedTextColor: '#0E0E10',
  mainColor: '#0E0E10',
  textSecondaryColor: '#6B5DE6',
  borderColor: '#606060',
};

export const ToastPalette = {
  successBg: '#3EB489',
  errorBg: '#EF4444',
  infoBg: '#FFBF00',
  text1: '#FFFFFF',
  text2: '#F5F5F5',
  infoText1: '#000000',
};

// Checkmark drawn on top of an arbitrary user-picked category swatch color -
// intentionally fixed white regardless of theme, since the swatch itself
// (not the app theme) supplies the background contrast.
export const SwatchCheckColor = '#FFFFFF';

// Android notification channel LED color - hardware/OS-level config with no
// light/dark variant of its own.
export const NotificationChannelColor = '#FF231F7C';
