export const LightColors = {
  background: '#FFFFFF',
  text: '#1E1E1E',
  primary: '#6B5DE6',
  secondary: '#3D3A45',
  arrowColor: '#8B8A99',
  monthSwitcher: '#1E1E1E',
  title: '#1E1E1E',
  description: '#5A5A6E',
  lighterTitle: '#8A8AA0',
  borderColor: '#E2E2EA',
  borderSelected: '#6B5DE6',
  income: '#37955E',
  expense: '#F33F3F',
  bottomBarBackground: '#F5F4FA',
  barBackground: '#EDEBFA',
  topBarColor: '#ffffffbf',
  themedViewBg: ['#FFFFFF', '#F8F7FC', '#F2F1F8', '#FFFFFF'],
  floatingBtnBg: ['#6B5DE6', '#8A7CFF'],
  cardBg: '#ffffff',
  inputColor: '#FBFAFE',
  inputBorder: '#B7B0D9',
  inputPlaceholder: '#75718C',
  scrim: 'rgba(0, 0, 0, 0.5)',
  accent: '#FFC83A',
  onPrimary: '#FFFFFF',
  shadow: '#000000',
  favorite: '#FFB347',
  sun: '#FFAA00',
  categoryFallbackBg: '#282343',
  categoryFallbackIcon: '#E0DEED',
  danger: '#CC1928',
};

export const DarkColors = {
  background: '#16141F',
  text: '#F2F2F2',
  primary: '#8A7CFF',
  secondary: '#B3ACC4',
  arrowColor: '#ABA8C4',
  monthSwitcher: '#F2F2F2',
  title: '#F2F2F2',
  description: '#CCCCCC',
  lighterTitle: '#9C9AB0',
  income: '#48BB78',
  borderColor: '#333333',
  borderSelected: '#6B5DE6',
  expense: '#F56565',
  bottomBarBackground: '#1E1633',
  barBackground: '#211D30',
  topBarColor: '#16141f9c',
  themedViewBg: ['#1f003d', '#140029', '#0a0014', '#1f003d'],
  floatingBtnBg: ['#6B5DE6', '#8A7CFF'],
  cardBg: '#241F3Eff',
  inputColor: '#ffffff04',
  inputBorder: '#ffffff33',
  inputPlaceholder: '#ffffff66',
  scrim: 'rgba(0, 0, 0, 0.6)',
  accent: '#FFC83A',
  onPrimary: '#FFFFFF',
  shadow: '#000000',
  favorite: '#FFB347',
  sun: '#FFAA00',
  categoryFallbackBg: '#282343',
  categoryFallbackIcon: '#E0DEED',
  danger: '#CC1928',
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

export const SwitchPalette = {
  trackOff: '#81629E61',
  thumbOn: '#F5F5F5',
  thumbOff: '#574866',
};

// Fixed gradient + glow for the "Add account" CTA button.
export const AddAccountButtonGradient = ['#6B5DE6', '#8A7CFF'];
