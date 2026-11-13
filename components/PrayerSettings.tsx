import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ui } from './DesignSystem';
import { fetchPrayerTimes, PrayerSchedule, PrayerSettings as Settings, prayerMethods } from '../services/prayerTimes';

export function PrayerSettings({ visible, close, initial, save }: { visible: boolean; close: () => void; initial: Settings | null; save: (settings: Settings, schedule: PrayerSchedule) => Promise<void> }) {
  const { colors } = useTheme();
  const [city, setCity] = useState(initial?.city || ''), [country, setCountry] = useState(initial?.country || '');
  const [method, setMethod] = useState(initial?.method || 1), [school, setSchool] = useState(initial?.school ?? 1);
  const [loading, setLoading] = useState(false), [error, setError] = useState('');
  const submit = async () => {
    setLoading(true); setError('');
    try { const settings = { city: city.trim(), country: country.trim(), method, school }; const result = await fetchPrayerTimes(settings); await save(settings, result); close(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Prayer times could not be loaded. Try again.'); }
    finally { setLoading(false); }
  };
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={close}><View style={{ flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#0008' }}><ScrollView keyboardShouldPersistTaps="handled" style={{ flexGrow: 0, width: '100%', maxWidth: 520, alignSelf: 'center', borderRadius: 18, backgroundColor: colors.cardBackground }} contentContainerStyle={{ padding: 20, gap: 14 }}>
    <View style={ui.row}><Text accessibilityRole="header" style={[ui.sectionTitle, { color: colors.textPrimary }]}>Prayer times</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Close prayer settings" onPress={close} style={ui.back}><X size={20} color={colors.textPrimary} /></TouchableOpacity></View>
    <Text style={[ui.caption, { color: colors.textSecondary }]}>Choose your city and calculation method. Calculated times may differ from your local mosque; all times use the selected city’s timezone.</Text>
    <TextInput accessibilityLabel="Prayer city" placeholder="City, e.g. Karachi" placeholderTextColor={colors.textSecondary} value={city} onChangeText={setCity} style={{ minHeight: 48, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary }} />
    <TextInput accessibilityLabel="Prayer country" placeholder="Country, e.g. Pakistan" placeholderTextColor={colors.textSecondary} value={country} onChangeText={setCountry} style={{ minHeight: 48, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary }} />
    <Text style={[ui.caption, { color: colors.textSecondary }]}>Calculation method</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{prayerMethods.map(item => <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: item.id === method }} key={item.id} onPress={() => setMethod(item.id)} style={{ minHeight: 44, padding: 12, borderRadius: 8, backgroundColor: item.id === method ? colors.surfaceMuted : colors.surface }}><Text style={{ color: colors.textPrimary }}>{item.name}</Text></TouchableOpacity>)}</View>
    <Text style={[ui.caption, { color: colors.textSecondary }]}>Asr calculation</Text><View style={{ flexDirection: 'row', gap: 8 }}>{['Standard', 'Hanafi'].map((name, i) => <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: school === i }} key={name} onPress={() => setSchool(i)} style={{ minHeight: 44, padding: 12, borderRadius: 8, backgroundColor: school === i ? colors.surfaceMuted : colors.surface }}><Text style={{ color: colors.textPrimary }}>{name}</Text></TouchableOpacity>)}</View>
    {!!error && <Text accessibilityRole="alert" style={[ui.body, { color: colors.danger }]}>{error}</Text>}
    <TouchableOpacity accessibilityRole="button" disabled={loading} onPress={submit} style={[ui.primaryButton, { backgroundColor: colors.primary }]}>{loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={[ui.rowTitle, { color: colors.onPrimary }]}>Load prayer times</Text>}</TouchableOpacity>
    <Text style={[ui.small, { color: colors.textSecondary }]}>Source: AlAdhan. Your city is sent to this service to calculate the schedule.</Text>
  </ScrollView></View></Modal>;
}
