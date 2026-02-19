export const colors = {
  primary: '#0066FF',
  primaryDark: '#0047CC',
  primaryLight: '#EBF2FF',

  black: '#0A0A0F',
  dark: '#1A1A2E',
  grey800: '#2D2D3F',
  grey600: '#5A5A7A',
  grey400: '#9898B0',
  grey200: '#D4D4E0',
  grey100: '#EEEEF4',
  grey50: '#F7F7FC',
  white: '#FFFFFF',

  success: '#00C48C',
  successLight: '#E6FBF4',
  warning: '#FFB020',
  warningLight: '#FFF7E6',
  error: '#FF3B30',
  errorLight: '#FFEDEC',

  darkBg: '#0D0D14',
  darkSurface1: '#16161F',
  darkSurface2: '#1E1E2A',
  darkSurface3: '#26263A',
  darkBorder: '#2E2E45',
} as const;

export const spacing = {
  2: 2, 4: 4, 6: 6, 8: 8, 12: 12,
  16: 16, 20: 20, 24: 24, 32: 32,
  40: 40, 48: 48, 64: 64,
} as const;

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 9999,
} as const;

export const shadows = {
  card: '0 2px 12px rgba(0,0,0,0.08)',
  accountCard: '0 8px 32px rgba(0, 102, 255, 0.20)',
  modal: '0 8px 32px rgba(0,0,0,0.16)',
} as const;
