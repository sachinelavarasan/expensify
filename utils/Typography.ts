export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  display: 32,
} as const;

export const Typography = {
  caption: { fontSize: FontSize.xs, fontFamily: 'Inter-400' },
  label: { fontSize: FontSize.sm, fontFamily: 'Inter-500' },
  body: { fontSize: FontSize.base, fontFamily: 'Inter-500' },
  bodySemiBold: { fontSize: FontSize.base, fontFamily: 'Inter-600' },
  subtitle: { fontSize: FontSize.xl, fontFamily: 'Inter-500' },
  title: { fontSize: FontSize.xxl, fontFamily: 'Inter-700' },
  display: { fontSize: FontSize.display, fontFamily: 'Inter-700' },
} as const;

export type TypographyKey = keyof typeof Typography;
