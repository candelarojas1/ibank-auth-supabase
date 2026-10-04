import { Platform } from 'react-native'

/**
 * Paleta de colores y estilos visuales extraídos del Figma oficial de iBank:
 * - Color primario iBank: #3629B7 (Púrpura/Índigo)
 * - Fondo de cabecera curvo: #3629B7
 * - Texto principal: #1B1C52
 * - Texto secundario/placeholders: #8F92A1
 * - Bordes de inputs: #E2E4E8
 * - Botón deshabilitado: #F2F1FB con texto #B8B7D8
 * - Fondo suave: #F9F9FC
 */

export const Colors = {
  primary: '#3629B7',
  primaryLight: '#EAE8FE',
  textDark: '#1B1C52',
  textMuted: '#8F92A1',
  border: '#E2E4E8',
  background: '#F9F9FC',
  cardBackground: '#FFFFFF',
  disabledButton: '#F2F1FB',
  disabledText: '#B8B7D8',
  error: '#EF4444',
  errorBackground: '#FEE2E2',
  success: '#10B981',
  successBackground: '#D1FAE5',
  light: {
    text: '#1B1C52',
    background: '#F9F9FC',
    backgroundElement: '#EAE8FE',
    backgroundSelected: '#3629B7',
    textSecondary: '#8F92A1',
  },
  dark: {
    text: '#FFFFFF',
    background: '#120E43',
    backgroundElement: '#1B1C52',
    backgroundSelected: '#3629B7',
    textSecondary: '#A29BFE',
  },
} as const

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'system-ui',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
})

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  borderRadiusInput: 16,
  borderRadiusButton: 16,
  borderRadiusCard: 24,
} as const

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0
export const MaxContentWidth = 800
