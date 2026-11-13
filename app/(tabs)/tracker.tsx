import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { CalendarDays, Check, Clock3, BookOpen, Sun, CircleDot, HeartHandshake, Pencil, Sparkles, Moon, ChevronDown, ChevronUp, Leaf } from 'lucide-react-native';
import { BrandHeader, Card, Chip, ui } from '../../components/DesignSystem';
import { useTheme, fonts } from '../../contexts/ThemeContext';
import { calculateStreaks, getWeeklyInsights, getHeatmapData, getPrayerAnalytics, loadAllData, loadTodayChecklist, getTodayDateString, DailyChecklist } from '../../services/trackingService';

type Data = { streaks: Awaited<ReturnType<typeof calculateStreaks>>; insights: Awaited<ReturnType<typeof getWeeklyInsights>>; days: Awaited<ReturnType<typeof getHeatmapData>>; prayers: Awaited<ReturnType<typeof getPrayerAnalytics>>; history: Record<string, DailyChecklist>; today: DailyChecklist };
const dateKey = (date: Date) => date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
export default function TrackerScreen() {
  const { colors, theme } = useTheme(); const router = useRouter(); const insets = useSafeAreaInsets(); const { fontScale } = useWindowDimensions();
  const [details, setDetails] = useState(false); const [data, setData] = useState<Data | null>(null); const [error, setError] = useState(false); const [selected, setSelected] = useState(getTodayDateString());
  const load = useCallback(() => { let active = true; setError(false); Promise.all([calculateStreaks(), getWeeklyInsights(), getHeatmapData(), getPrayerAnalytics(), loadAllData(), loadTodayChecklist()]).then(([streaks, insights, days, prayers, history, today]) => { if (active) setData({ streaks, insights, days, prayers, history, today }); }).catch(() => { if (active) setError(true); }); return () => { active = false; }; }, []);
  useFocusEffect(load);
  const todayKey = getTodayDateString(); const record = selected === todayKey ? data?.today : data?.history[selected];
  const completed = record?.prayers.filter(p => !p.isCustom && p.completed).length ?? 0;
  const customPrayers = record?.prayers.filter(p => p.isCustom) || [];
  const week = Array.from({ length: 7 }, (_, index) => { const d = new Date(); d.setDate(d.getDate() - 6 + index); return d; });
  const start = new Date(); start.setDate(start.getDate() - 29);
  const selectedDate = week.find(date => dateKey(date) === selected) || new Date();
  const edit = () => router.push({ pathname: '/checklist', params: { date: selected } });
  const ask = () => router.push({ pathname: '/(tabs)/chatbot', params: { prompt: record?.reflection ? 'Help me reflect on my spiritual practice today: ' + record.reflection : 'How can I bring more presence and consistency to my daily worship?' } });
  const reflectionActions = <View style={s.actions}><TouchableOpacity accessibilityRole="button" onPress={edit} style={[s.action, { backgroundColor: colors.surfaceMuted }]}><Pencil size={14} color={colors.textPrimary} /><Text style={[ui.small, { color: colors.textPrimary }]}>Edit Reflection</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" onPress={ask} style={[s.action, { backgroundColor: colors.primary }]}><Sparkles size={15} color={colors.onPrimary} /><Text style={[ui.small, { color: colors.onPrimary }]}>Ask AI Prompt</Text></TouchableOpacity></View>;
  const practice = (title: string, detail: string, value: string, Icon: typeof Sun, route: '/dhikr' | '/checklist') => <TouchableOpacity accessibilityRole="button" onPress={() => router.push(route)} style={[s.practice, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
    <View style={[ui.icon, { backgroundColor: colors.surfaceMuted, borderRadius: 22 }]}><Icon size={21} color={colors.primary} strokeWidth={1.5} /></View><View style={{ flex: 1, gap: 3 }}><Text style={[ui.rowTitle, { color: colors.textPrimary }]}>{title}</Text><Text style={[ui.small, { color: colors.textSecondary }]}>{detail}</Text></View><Text style={[ui.small, { color: colors.gold, flexShrink: 1 }]}>{value}</Text>
  </TouchableOpacity>;
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
    <BrandHeader section="Prayer Tracker" />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[ui.page, { maxWidth: 760, paddingTop: 4, gap: 24, paddingBottom: 112 + insets.bottom }]}>
      <View style={{ gap: 8 }}>
        <View style={ui.row}><View style={{ flex: 1 }}><Text style={[ui.eyebrow, { color: colors.gold }]}>MINDFUL PRESENCE</Text><Text accessibilityRole="header" style={[s.title, { color: colors.textPrimary }]}>Spiritual Habits & Reflections</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Show prayer details" accessibilityState={{ expanded: details }} onPress={() => setDetails(v => !v)} style={ui.back}><CalendarDays size={21} color={colors.primary} /></TouchableOpacity></View>
        <View style={[s.week, { backgroundColor: colors.surfaceMuted }]}>{week.map(date => { const key = dateKey(date), active = key === selected; const hasActivity = key === todayKey ? !!data?.today.prayers.some(p => p.completed) : !!data?.history[key]; return <TouchableOpacity accessibilityRole="button" accessibilityLabel={date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} accessibilityState={{ selected: active }} key={key} onPress={() => setSelected(key)} style={[s.day, { backgroundColor: active ? colors.primary : 'transparent' }]}><Text style={[ui.small, { color: active ? colors.onPrimary : colors.textSecondary, fontSize: fontScale > 1.3 ? 10 : 11 }]}>{key === todayKey ? 'TODAY' : date.toLocaleDateString('en-US', { weekday: 'narrow' })}</Text><Text style={[ui.rowTitle, { color: active ? colors.onPrimary : colors.textPrimary }]}>{date.getDate()}</Text><View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: active ? colors.onPrimary : hasActivity ? colors.primary : colors.border }} /></TouchableOpacity>; })}</View>
      </View>
      {!data ? <Card><Text style={[ui.body, { color: colors.textSecondary }]}>{error ? 'Your activity could not be loaded.' : 'Loading your activity…'}</Text>{error ? <TouchableOpacity accessibilityRole="button" onPress={load} style={ui.primaryButton}><Text style={[ui.rowTitle, { color: colors.primary }]}>Try again</Text></TouchableOpacity> : <ActivityIndicator color={colors.primary} />}</Card> : <>
        <Card style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><Leaf size={23} color={colors.primary} /><View style={{ flex: 1 }}><Text style={[ui.rowTitle, { color: colors.textPrimary }]}>Gentle Devotion</Text><Text style={[ui.small, { color: colors.textSecondary }]}>Purity in constancy, without overwhelm</Text></View></View>
          {theme === 'dark' ? reflectionActions : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{[['Prayer', data.streaks.prayerStreak], ['Quran', data.streaks.quranStreak]].map(([label, value]) => <View key={label} style={[s.streak, { backgroundColor: colors.surface }]}><Text style={[ui.rowTitle, { color: colors.primary }]}>{value} {value === 1 ? 'day' : 'days'}</Text><Text style={[ui.small, { color: colors.textSecondary }]}>{label} streak</Text></View>)}</View>}
          <View style={[s.quote, { backgroundColor: colors.surface }]}><Text style={[s.quoteText, { color: colors.textPrimary }]}>“The most beloved deeds to Allah are those that are consistent, even if small.”</Text><Text style={[ui.small, { color: colors.gold, textAlign: 'center' }]}>— SAHIH AL-BUKHARI</Text></View>
        </Card>
        <Card style={{ gap: 4 }}>
          <View style={[ui.row, { marginBottom: 12 }]}><View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flex: 1 }}><Clock3 size={19} color={colors.primary} /><Text style={[ui.rowTitle, { color: colors.textPrimary, flex: 1 }]}>Fardh (Obligatory Prayers)</Text></View><Chip>{completed} of 5 fulfilled</Chip></View>
          {!record && <Text style={[ui.caption, { color: colors.textSecondary }]}>No practice recorded for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.</Text>}
          {(record?.prayers.filter(p => !p.isCustom) || []).map(prayer => <View key={prayer.id} style={[s.prayer, { backgroundColor: prayer.completed ? colors.surfaceMuted : colors.surface, borderColor: colors.border }]}>
            <View accessibilityLabel={prayer.completed ? 'Completed' : 'Not recorded'} style={[s.check, { backgroundColor: prayer.completed ? colors.primary : 'transparent', borderColor: prayer.completed ? colors.primary : colors.border }]}>{prayer.completed ? <Check size={16} color={colors.onPrimary} /> : <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: colors.textSecondary }} />}</View>
            <View style={{ flex: 1 }}><Text style={[ui.rowTitle, { color: colors.textPrimary }]}>{prayer.title}</Text><Text style={[ui.small, { color: colors.textSecondary }]}>{prayer.completed ? 'Recorded in your checklist' : 'Not recorded'}</Text></View><Text style={[ui.small, { color: prayer.completed ? colors.primary : colors.textSecondary, flexShrink: 1 }]}>{prayer.completed ? 'Completed' : '—'}</Text>
          </View>)}
          {!!customPrayers.length && <Text style={[ui.caption, { color: colors.textSecondary }]}>Additional prayers: {customPrayers.filter(p => p.completed).length} of {customPrayers.length} completed</Text>}
          <TouchableOpacity accessibilityRole="button" onPress={edit} style={{ minHeight: 44, justifyContent: 'center', alignItems: 'flex-end', paddingTop: 6 }}><Text style={[ui.small, { color: colors.primary }]}>{selected === todayKey ? "Edit today's record" : 'Edit selected record'}</Text></TouchableOpacity>
        </Card>
        <View style={{ gap: 8 }}><View style={ui.row}><Text accessibilityRole="header" style={[ui.sectionTitle, { color: colors.textPrimary }]}>Daily Soul Practices</Text><Text style={[ui.small, { color: colors.gold }]}>{selected === todayKey ? 'Today' : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text></View>
          {practice('Morning & Evening Adhkar', record ? record.dhikr.filter(d => d.completed).length + ' of ' + record.dhikr.length + ' practices completed' : 'No entry for this day', record?.dhikr.length ? Math.round(record.dhikr.filter(d => d.completed).length / record.dhikr.length * 100) + '%' : '—', Sun, '/checklist')}
          {practice('Quran Tilawah', record ? [record.quranTracking.read && 'Read', record.quranTracking.listened && 'Listened'].filter(Boolean).join(' · ') || 'Not recorded' : 'No entry for this day', (record?.quranTracking.minutes ?? 0) + ' min', BookOpen, '/checklist')}
          {practice('Tasbih / Istighfar', 'Open the Digital Tasbih counter', 'Count', CircleDot, '/dhikr')}
          {practice('Kindness & Custom Practices', record?.customPractices.length ? record.customPractices.map(p => p.title).join(' · ') : 'Add a practice in your checklist', record ? record.customPractices.filter(p => p.completed).length + ' done' : '—', HeartHandshake, '/checklist')}
        </View>
        <Card><View style={ui.row}><Text accessibilityRole="header" style={[ui.rowTitle, { color: colors.textPrimary }]}>✦ 30-Day Consistency Grid</Text><Text style={[ui.small, { color: colors.textSecondary }]}>Past 30 days</Text></View>
          <View style={s.heatmap}>{data.days.map((day, i) => { const date = new Date(start); date.setDate(start.getDate() + i); const shades = [colors.surface, colors.primary + '55', colors.primary + '88', colors.primary + 'BB', colors.primary]; return <View key={i} accessible accessibilityLabel={date.toLocaleDateString() + ': ' + day.intensity + ' of 4 activity indicators'} style={[s.heatCell, { backgroundColor: shades[day.intensity], borderColor: dateKey(date) === todayKey ? colors.gold : colors.border }]}>{dateKey(date) === todayKey && <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: colors.gold }} />}</View>; })}</View>
          <View style={ui.row}><Text style={[ui.small, { color: colors.textSecondary }]}>Less consistent</Text><Text style={[ui.small, { color: colors.textSecondary }]}>Fully fulfilled</Text></View>
        </Card>
        <Card><View style={ui.row}><View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Pencil size={17} color={colors.gold} /><Text accessibilityRole="header" style={[ui.rowTitle, { color: colors.textPrimary }]}>Daily Reflection</Text></View><Text style={[ui.small, { color: colors.textSecondary }]}>{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text></View>
          <View style={[s.quote, { backgroundColor: colors.surface }]}><Text style={[s.reflectionPrompt, { color: colors.textPrimary }]}>How was your presence (Khushu) in worship today, and where did you feel peace?</Text><Text selectable style={[ui.caption, { color: colors.textSecondary, fontStyle: record?.reflection ? 'italic' : 'normal' }]}>{record?.reflection || 'Your reflection will appear here after you save it in the daily checklist.'}</Text></View>
          {reflectionActions}
        </Card>
        {details && <Card><TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: details }} aria-expanded={details} onPress={() => setDetails(v => !v)} style={ui.row}><Text style={[ui.rowTitle, { color: colors.textPrimary }]}>Prayer details</Text>{details ? <ChevronUp size={19} color={colors.primary} /> : <ChevronDown size={19} color={colors.primary} />}</TouchableOpacity>
          <Text style={[ui.caption, { color: colors.textSecondary }]}>{data.insights.prayersCompleted} prayers recorded across {data.insights.daysActive} recent recorded days.</Text>
          {details && data.prayers.map(prayer => <View key={prayer.name} style={{ gap: 7 }}><View style={ui.row}><Text style={[ui.caption, { color: colors.textPrimary }]}>{prayer.name}</Text><Text style={[ui.small, { color: colors.textSecondary }]}>{prayer.completion}%</Text></View><View accessibilityRole="progressbar" accessibilityLabel={prayer.name} accessibilityValue={{ min: 0, max: 100, now: prayer.completion }} style={{ height: 4, borderRadius: 2, backgroundColor: colors.surfaceMuted }}><View style={{ height: 4, borderRadius: 2, width: (prayer.completion + '%') as `${number}%`, backgroundColor: colors.primary }} /></View></View>)}
        </Card>}
        <View style={[s.practice, { backgroundColor: colors.surface, borderColor: colors.border }]}><Moon size={23} color={colors.gold} /><View style={{ flex: 1, gap: 3 }}><Text style={[ui.rowTitle, { color: colors.textPrimary }]}>Tahajjud Watch</Text><Text style={[ui.small, { color: colors.textSecondary }]}>Wake-up reminders · Not available yet</Text></View></View>

      </>}
    </ScrollView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, fontWeight: '500' },
  week: { flexDirection: 'row', gap: 3, padding: 6, borderRadius: 12 }, day: { flex: 1, minHeight: 64, paddingVertical: 6, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 3 },
  streak: { flex: 1, minWidth: 100, borderRadius: 8, padding: 8 }, quote: { padding: 12, gap: 8, borderRadius: 8 },
  quoteText: { fontFamily: fonts.editorialItalic, fontSize: 22, lineHeight: 29, textAlign: 'center' },
  prayer: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 9, padding: 8 },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  practice: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 16, minHeight: 80 },
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 }, heatCell: { width: '8.5%', flexGrow: 1, aspectRatio: 1, borderRadius: 3, borderWidth: 1, alignItems: 'center', justifyContent: 'center', minWidth: 15 },
  reflectionPrompt: { fontFamily: fonts.editorialItalic, fontSize: 22, lineHeight: 32 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, action: { flexDirection: 'row', flex: 1, minWidth: 125, alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, borderRadius: 24, paddingHorizontal: 12, paddingVertical: 10 },
});
