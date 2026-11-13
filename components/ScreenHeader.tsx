import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { GlassSurface } from './Glass';
import { ui } from './DesignSystem';

export default function ScreenHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  const { colors } = useTheme(); const insets = useSafeAreaInsets(); const router = useRouter();
  return <View style={{ paddingTop: insets.top + 12, paddingBottom: 18, paddingHorizontal: 20 }}>
    <View style={{ width: '100%', maxWidth: 768, alignSelf: 'center', gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}><GlassSurface style={ui.back}><ArrowLeft color={colors.textPrimary} size={21} /></GlassSurface></TouchableOpacity>
        <Text accessibilityRole="header" style={[ui.title, { color: colors.textPrimary, flex: 1 }]}>{title}</Text>{action}
      </View>
      <Text style={[ui.caption, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
  </View>;
}
