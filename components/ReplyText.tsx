import React from 'react';
import { View } from 'react-native';
import { AppText } from './Typography';
import { ui } from './DesignSystem';
import { useTheme } from '../contexts/ThemeContext';

export function ReplyText({ text }: { text: string }) {
  const { colors } = useTheme();
  return <View style={{ gap: 16 }}>{text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => {
    const arabic = (paragraph.match(/[\u0600-\u06ff]/g) || []).length > (paragraph.match(/[a-z]/gi) || []).length;
    return <AppText selectable key={index} style={[arabic ? ui.urdu : ui.body, { color: colors.textPrimary }]}>
      {paragraph.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith('**') && part.endsWith('**') ? <AppText key={i} style={{ fontWeight: '600' }}>{part.slice(2, -2)}</AppText> : part)}
    </AppText>;
  })}</View>;
}
