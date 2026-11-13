import React from 'react';
import { Text as NativeText, TextProps } from 'react-native';
import { fonts } from '../contexts/ThemeContext';

// Preserve native text scaling and use a script font for Arabic/Urdu paragraphs.
export function AppText({ children, style, ...props }: TextProps) {
  const content = React.Children.toArray(children).filter(value => typeof value === 'string').join(' ');
  const arabic = (content.match(/[\u0600-\u06FF\u0750-\u077F]/g) || []).length;
  const latin = (content.match(/[a-zA-Z]/g) || []).length;
  return <NativeText {...props} style={[{ fontFamily: arabic > latin ? fonts.arabic : fonts.body }, arabic > latin && { writingDirection: 'rtl', includeFontPadding: true, letterSpacing: 0 }, style]}>{children}</NativeText>;
}
