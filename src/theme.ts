
import { useMemo } from 'react';
import { useThemeStore } from './store/themeStore';

export interface Palette {
  bg: string;
  surface: string;
  surfaceHigh: string;
  border: string;
  text: string;
  textDim: string;
  accent: string;
  accentSoft: string;
  danger: string;
  overlay: string;
}

export const ACCENTS = {
  violet: '#8B7CFF',
  teal: '#22B7A3',
  rose: '#C75C6C',
  amber: '#d6a33e',
  blue: '#4274BE',
} as const;

export type AccentKey = keyof typeof ACCENTS;

function withAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

function darkPalette(accentKey: AccentKey): Palette {
  const accent = ACCENTS[accentKey];

  return {
    bg: '#0A0A0F',
    surface: '#15151D',
    surfaceHigh: '#1F1F2B',
    border: '#272736',

    text: '#F4F4F8',
    textDim: '#9A9AAE',

    accent,
    accentSoft: withAlpha(accent, '29'),

    danger: '#FF5D73',
    overlay: 'rgba(0,0,0,0.6)',
  };
}

function lightPalette(accentKey: AccentKey): Palette {
  const accent = ACCENTS[accentKey];

  return {
    bg: '#FFF9E6',
    surface: '#40c4b0',
    surfaceHigh: '#83c663',
    border: '#3bdbffd1',

    text: '#15151D',
    textDim: '#5C4B00',

    accent,
    accentSoft: withAlpha(accent, '22'),

    danger: '#D6304A',
    overlay: 'rgba(0,0,0,0.4)',
  };
}

/** Default palette */
export const colors = darkPalette('violet');

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const sizes = {
  row: 64,
  tabBar: 56,
  miniPlayer: 64,
  header: 56,
};

/** Live theme colors */
export function useColors(): Palette {
  const mode = useThemeStore(s => s.mode);
  const accentKey = useThemeStore(s => s.accentKey);

  return useMemo(
    () =>
      mode === 'light'
        ? lightPalette(accentKey)
        : darkPalette(accentKey),
    [mode, accentKey],
  );
}