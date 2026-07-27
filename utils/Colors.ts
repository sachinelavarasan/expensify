export const LightColors = {
  background: '#F7F7FA',
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
  bottomBarBackground: '#F7F7FA',
  barBackground: '#EDEBFA',
  topBarColor: '#f5f4fabf',
  themedViewBg: ['#F7F7FA', '#F2F1F8', '#ECEAF5', '#F7F7FA'],
  floatingBtnBg: ['#6B5DE6', '#8A7CFF'],
  cardBg: "#ffffff",
  inputColor:"#F1F0F8",
  inputBorder: "#DEDCEA",
  inputPlaceholder: '#A6A4B8',
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
  background: '#0D001A',
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
  bottomBarBackground: '#0A0015',
  barBackground: '#1A0033',
  topBarColor: '#1a00339c',
  themedViewBg: ['#160029', '#0D001A', '#090012', '#160029'],
  floatingBtnBg: ['#6B5DE6', '#8A7CFF'],
  cardBg: "#241F3Eff",
  inputColor:"#ffffff04",
  inputBorder: "#ffffff33",
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

export const BankCardPalette = {
  light: {
    text: '#0F0E17',
    sub: '#5A5A6A',
    chip: '#E6E6F2',
    chipInner: '#FFD66B',
    gradDefault: '#6C63FF',
    gradEnd: '#B388FF',
    cardBgStart: '#FFFFFF',
    cardBgEnd: '#F7F7FB',
    border: '#E9E7F2',
  },
  dark: {
    text: '#FFFFFF',
    sub: '#CFCFE6',
    chip: '#2B2748',
    chipInner: '#FFD66B',
    gradDefault: '#6C63FF',
    gradEnd: '#9E6BFF',
    cardBgStart: '#1A1535',
    cardBgEnd: '#0F0E25',
    border: '#2F2A4F',
  },
};

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

// Fixed decorative gradient for the profile screen's header cover image -
// not theme-reactive, it's a one-off hero treatment.
export const ProfileHeroGradient = ['#2E026D', '#15162C', '#0F0E17'];

// Fixed gradient + glow for the "Add account" CTA button.
export const AddAccountButtonGradient = ['#6B5DE6', '#8A7CFF'];
