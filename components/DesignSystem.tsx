import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, I18nManager, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, ChevronRight, LucideIcon, Sparkles } from 'lucide-react-native';
import { useRouter, Href, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, fonts } from '../contexts/ThemeContext';
import { GlassSurface } from './Glass';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { APP_VERSION } from '../constants/branding';
import { HidayahMark } from './HidayahMark';
import { displayName } from '../utils/displayName';

export function hijriDate(date = new Date()) {
  try { return new Intl.DateTimeFormat('en-GB-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(date); }
  catch { return date.toLocaleDateString(); }
}
export function BrandHeader({ section, reader = false, action }: { section: string; reader?: boolean; action?: React.ReactNode }) {
  const { colors, theme } = useTheme(); const router = useRouter();
  const [name, setName] = useState('');
  useFocusEffect(useCallback(() => {
    let active = true;
    AsyncStorage.getItem('hidayah_user').then(value => { if (active) { try { setName(value ? displayName(JSON.parse(value).name) : ''); } catch { setName(''); } } }).catch(() => {});
    return () => { active = false; };
  }, []));
  return <View style={[s.brandBar, { backgroundColor: reader ? colors.readerBackground : colors.background, borderColor: colors.border }]}>
    <View style={s.brandInner}>
      <View style={{ width: 32, height: 32 }}>{reader && theme === 'light' ? <View style={{ flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}><MaterialIcons name="menu-book" size={19} color={colors.primary} /></View> : <HidayahMark size={32} />}</View>
      <View style={{ flex: 1, gap: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Text style={[s.brandName, { color: colors.textPrimary, fontFamily: reader && theme === 'light' ? fonts.display : fonts.body }]}>Hidayah</Text><Text style={[s.version, { color: colors.gold, backgroundColor: colors.surfaceMuted }]}>{reader && theme === 'light' ? 'QURAN' : APP_VERSION}</Text></View>
        <Text style={[s.brandCaption, { color: colors.textSecondary }]}>{hijriDate()} · {section}</Text>
      </View>
      {action || <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notification availability" onPress={() => { const message = 'Prayer reminders and notifications are not available yet. Prayer times are available through Home → Set prayer times.'; if (Platform.OS === 'web') window.alert(message); else Alert.alert('Notifications', message); }} style={ui.back}><Bell size={20} color={colors.textSecondary} strokeWidth={1.5} /></TouchableOpacity>}
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open your profile" onPress={() => router.push('/(tabs)/profile')} style={[s.avatar, { backgroundColor: colors.surfaceMuted, borderColor: colors.gold }]}>
        <Text style={{ fontFamily: fonts.display, color: colors.primary, fontSize: 21 }}>{name.trim().slice(0, 1).toUpperCase() || 'H'}</Text>
      </TouchableOpacity>
    </View>
  </View>;
}
export function Page({ title, subtitle, children, back = false }: { title: string; subtitle: string; children: React.ReactNode; back?: boolean }) {
  const { colors } = useTheme(); const router = useRouter(); const insets = useSafeAreaInsets();
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView contentContainerStyle={[ui.page, { paddingBottom: 112 + insets.bottom }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={ui.heading}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {back && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}><GlassSurface style={ui.back}><ArrowLeft size={21} color={colors.textPrimary} style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }} /></GlassSurface></TouchableOpacity>}
        <Text accessibilityRole="header" style={[ui.title, { color: colors.textPrimary, flex: 1 }]}>{title}</Text>
      </View>{!!subtitle && <Text style={[ui.body, { color: colors.textSecondary }]}>{subtitle}</Text>}</View>{children}
    </ScrollView>
  </SafeAreaView>;
}
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={ui.section}><Text accessibilityRole="header" style={[ui.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>{children}</View>;
}
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors, theme } = useTheme();
  return <View style={[ui.card, { borderColor: theme === 'dark' ? colors.border : 'transparent', backgroundColor: colors.cardBackground, shadowOpacity: theme === 'dark' ? 0 : .035 }, style]}>{children}</View>;
}
export function Chip({ children, gold = false }: { children: React.ReactNode; gold?: boolean }) {
  const { colors } = useTheme();
  return <View style={[s.chip, { backgroundColor: gold ? colors.goldSurface : colors.surfaceMuted }]}><Text style={[ui.small, { color: gold ? colors.gold : colors.primary }]}>{children}</Text></View>;
}
export function Unavailable({ label }: { label: string }) {
  const { colors } = useTheme();
  return <View style={[s.unavailable, { backgroundColor: colors.surface }]}><Text style={[ui.small, { color: colors.textSecondary }]}>{label} · Not available yet</Text></View>;
}
export function RouteRow({ title, detail, route, icon: Icon }: { title: string; detail: string; route: Href; icon: LucideIcon }) {
  const { colors } = useTheme(); const router = useRouter();
  return <TouchableOpacity accessibilityRole="button" onPress={() => router.push(route)} activeOpacity={.7} style={[ui.route, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}>
    <View style={[ui.icon, { backgroundColor: colors.surfaceMuted }]}><Icon size={21} strokeWidth={1.5} color={colors.primary} /></View>
    <View style={{ flex: 1, gap: 3 }}><Text style={[ui.rowTitle, { color: colors.textPrimary }]}>{title}</Text>{!!detail && <Text style={[ui.caption, { color: colors.textSecondary }]}>{detail}</Text>}</View><ChevronRight size={17} color={colors.textSecondary} style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }} />
  </TouchableOpacity>;
}
export function AskMark({ size = 26 }: { size?: number }) { const { colors } = useTheme(); return <Sparkles size={size} strokeWidth={1.4} color={colors.gold} />; }
export const ui = StyleSheet.create({
  page: { width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120, gap: 24 },
  heading: { gap: 10 }, back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontFamily: fonts.body, fontSize: 11, fontWeight: '600', letterSpacing: 1.1 },
  title: { fontFamily: fonts.display, fontSize: 30, fontWeight: '500', lineHeight: 36 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 26 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, fontWeight: '400' },
  small: { fontFamily: fonts.body, fontSize: 11, lineHeight: 14, fontWeight: '400' },
  section: { gap: 12 }, sectionTitle: { fontFamily: fonts.body, fontSize: 18, fontWeight: '600', lineHeight: 24 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 16, shadowColor: '#134E3A', shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, overflow: 'hidden' },
  route: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, minHeight: 82, borderWidth: 1, borderRadius: 14, marginBottom: 8 },
  icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.body, fontSize: 16, fontWeight: '400', lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  primaryButton: { minHeight: 44, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  arabic: { fontFamily: fonts.arabic, fontSize: 30, lineHeight: 58, writingDirection: 'rtl', textAlign: 'right', letterSpacing: 0, includeFontPadding: true },
  urdu: { fontFamily: fonts.arabic, fontSize: 21, lineHeight: 40, writingDirection: 'rtl', textAlign: 'right', letterSpacing: 0, includeFontPadding: true },
});
const s = StyleSheet.create({
  brandBar: { borderBottomWidth: StyleSheet.hairlineWidth }, brandInner: { width: '100%', maxWidth: 620, alignSelf: 'center', minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 8 },
  brandMark: { width: 32, height: 32, borderRadius: 0 }, brandName: { fontFamily: fonts.body, fontSize: 18, fontWeight: '600' }, version: { fontFamily: fonts.body, fontSize: 10, borderRadius: 7, paddingHorizontal: 4, paddingVertical: 1 },
  brandCaption: { fontFamily: fonts.body, fontSize: 11, lineHeight: 14 }, avatar: { width: 32, height: 32, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  chip: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2 }, unavailable: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
});
