import React, { createContext, useContext, ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export interface ThemeColors {
  background: string; cardBackground: string; primary: string; secondary: string;
  onPrimary: string; textPrimary: string; textSecondary: string; border: string;
  tabBar: string; messageSurface: string; danger: string; dangerSurface: string;
  surface: string; surfaceMuted: string; gold: string; goldSurface: string;
  hero: string; onHero: string; readerBackground: string; readerBorder: string;
}
const lightColors: ThemeColors = {
  background: '#F1FCF7', cardBackground: '#FFFFFF', primary: '#003626',
  secondary: '#3B6754', onPrimary: '#FFFFFF', textPrimary: '#141E1B',
  textSecondary: '#404944', border: '#E5F0EB', tabBar: '#F1FCF7',
  messageSurface: '#BDEDD5', danger: '#BA1A1A', dangerSurface: '#FFDAD6',
  surface: '#EBF6F1', surfaceMuted: '#E5F0EB', gold: '#806334',
  goldSurface: '#F6E8D0', hero: '#134E3A', onHero: '#FFFFFF',
  readerBackground: '#FBF9F4', readerBorder: '#E8E2D5',
};
export const fonts = { body: 'Jakarta', display: 'Garamond', editorialItalic: 'GaramondItalic', arabic: 'Amiri' } as const;
// The product is intentionally light-only. Legacy saved appearance preferences
// are ignored; account and practice data are never touched.
const ThemeContext = createContext<{ theme: Theme; colors: ThemeColors } | undefined>(undefined);
export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={{ theme: 'light', colors: lightColors }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
