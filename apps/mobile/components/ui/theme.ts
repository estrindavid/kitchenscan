export const colors = {
  primary: '#45B8F0',
  primaryLight: '#EAF6FF',
  primaryDark: '#1E83B7',
  background: '#F6FBFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#EEF7FB',
  text: '#102033',
  textSecondary: '#516274',
  textTertiary: '#7A8996',
  border: '#D7E8F5',
  borderLight: '#EEF7FB',
  danger: '#A32D2D',
  dangerLight: '#FCEBEB',
  dangerBorder: '#F7C1C1',
  warning: '#B8860B',
  warningLight: '#FFF8E7',
  success: '#22885E',
  successLight: '#E6F7EF',
} as const;

export const brandColors = {
  sky: '#45B8F0',
  skyLight: '#EAF6FF',
  peach: '#FFC1A6',
  peachLight: '#FFE4D6',
  cream: '#FFFDF8',
  ink: '#102033',
  green: '#2FBF86',
  mint: '#D8F6E8',
  coral: '#FF7F66',
  lemon: '#FFE8A3',
  lilac: '#B9B6FF',
  white: '#FFFFFF',
} as const;

export const darkColors = {
  primary: '#58C6F6',
  primaryLight: '#17364A',
  primaryDark: '#8BD8FF',
  background: '#101923',
  surface: '#172536',
  surfaceSecondary: '#213448',
  text: '#F6FBFF',
  textSecondary: '#B8C7D5',
  textTertiary: '#8797A7',
  border: '#2E445A',
  borderLight: '#213448',
  danger: '#E05555',
  dangerLight: '#2D1515',
  dangerBorder: '#5C2020',
  warning: '#E2AF2B',
  warningLight: '#322A0C',
  success: '#3DD190',
  successLight: '#17382A',
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
  h1: { fontSize: 30, fontWeight: '800' as const, lineHeight: 36 },
  h2: { fontSize: 23, fontWeight: '800' as const, lineHeight: 29 },
  h3: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionMedium: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  label: { fontSize: 11, fontWeight: '700' as const, lineHeight: 14, letterSpacing: 0.4 },
} as const;

export const motion = {
  fast: 160,
  medium: 260,
  slow: 420,
  float: 2600,
  stagger: 70,
  pressScale: 0.96,
} as const;
