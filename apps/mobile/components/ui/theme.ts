export const colors = {
  primary: '#0F6E56',
  primaryLight: '#E8F5F0',
  primaryDark: '#0A4D3C',
  background: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F4F0',
  text: '#1A1A18',
  textSecondary: '#6B6B65',
  textTertiary: '#8A8A84',
  border: '#E5E4E0',
  borderLight: '#F0EFEB',
  danger: '#A32D2D',
  dangerLight: '#FCEBEB',
  dangerBorder: '#F7C1C1',
  warning: '#B8860B',
  warningLight: '#FFF8E7',
  success: '#0F6E56',
  successLight: '#E8F5F0',
} as const;

export const brandColors = {
  sky: '#16A4E8',
  skyLight: '#BFEAFF',
  peach: '#FFC1A6',
  peachLight: '#FFE4D6',
  cream: '#FFF7E8',
  ink: '#10162F',
  green: '#22A06B',
  mint: '#BCEFD7',
  coral: '#FF7F66',
  lemon: '#FFE36E',
  lilac: '#B9B6FF',
  white: '#FFFFFF',
} as const;

export const darkColors = {
  primary: '#0F6E56',
  primaryLight: '#1A3D34',
  primaryDark: '#0A4D3C',
  background: '#1A1A18',
  surface: '#2A2A28',
  surfaceSecondary: '#3A3A38',
  text: '#FAFAF8',
  textSecondary: '#B0B0AA',
  textTertiary: '#808078',
  border: '#3A3A38',
  borderLight: '#2A2A28',
  danger: '#E05555',
  dangerLight: '#2D1515',
  dangerBorder: '#5C2020',
  warning: '#D4A017',
  warningLight: '#2D2500',
  success: '#0F6E56',
  successLight: '#1A3D34',
} as const;

export const darkBrandColors = {
  sky: '#3DB8F2',
  skyLight: '#15384A',
  peach: '#FFB092',
  peachLight: '#452C25',
  cream: '#27231C',
  ink: '#F8FAFF',
  green: '#35C789',
  mint: '#174431',
  coral: '#FF927C',
  lemon: '#FFE36E',
  lilac: '#C8C5FF',
  white: '#FFFFFF',
} as const;

export type ColorPalette = { readonly [K in keyof typeof colors]: string };
export type BrandPalette = typeof brandColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionMedium: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  label: { fontSize: 11, fontWeight: '600' as const, lineHeight: 14, letterSpacing: 0.5 },
} as const;

export const motion = {
  fast: 160,
  medium: 260,
  slow: 420,
  float: 2600,
  stagger: 70,
  pressScale: 0.96,
} as const;
