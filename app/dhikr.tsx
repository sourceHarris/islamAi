import { AppText as Text } from '../components/Typography';
import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { personalStorageKey, savePersonalData } from '../services/personalStorage';
import { View, TouchableOpacity } from 'react-native';
import { RotateCcw } from 'lucide-react-native';
import { Page, Section, Card, ui } from '../components/DesignSystem';
import { useTheme } from '../contexts/ThemeContext';

const adhkar = [
  { arabic: 'سُبْحَانَ اللَّهِ', name: 'Subhan Allah', count: 33 },
  { arabic: 'الْحَمْدُ لِلَّهِ', name: 'Alhamdulillah', count: 33 },
  { arabic: 'اللَّهُ أَكْبَرُ', name: 'Allahu Akbar', count: 34 },
  {
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    name: 'La ilaha illallah',
    count: 100,
  },
  { arabic: 'أَسْتَغْفِرُ اللَّهَ', name: 'Astaghfirullah', count: 100 },
];
export default function DhikrScreen() {
  const { colors } = useTheme();
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(adhkar[0]);
  const storageKey = useRef('');
  const [ready, setReady] = useState(false), [storageError, setStorageError] = useState('');
  const load = async () => {
    setReady(false); setStorageError('');
    try {
      const key = await personalStorageKey('dhikr'), value = await AsyncStorage.getItem(key);
      const data = value ? JSON.parse(value) : { count: 0, total: 0, selected: 0 };
      if (![data.count, data.total, data.selected].every(Number.isInteger) || data.count < 0 || data.total < data.count || !adhkar[data.selected]) throw new Error('Invalid saved count');
      storageKey.current = key; setCount(data.count); setTotal(data.total); setSelected(adhkar[data.selected]); setReady(true);
    } catch { setStorageError('Your saved counter could not be loaded. Retry before counting.'); }
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!ready) return;
    void savePersonalData(storageKey.current, { count, total, selected: adhkar.indexOf(selected) })
      .then(() => setStorageError('')).catch(() => setStorageError('Your count could not be saved. Please retry before leaving.'));
  }, [count, total, selected, ready]);
  return (
    <Page title="Dhikr" subtitle="Remember Allah, at your own pace." back>
      {!!storageError && <View><Text accessibilityRole="alert" style={[ui.body, { color: colors.danger }]}>{storageError}</Text><TouchableOpacity accessibilityRole="button" onPress={ready ? () => { void savePersonalData(storageKey.current, { count, total, selected: adhkar.indexOf(selected) }).then(() => setStorageError('')).catch(() => setStorageError('The counter still could not be saved.')); } : load} style={ui.primaryButton}><Text style={{ color: colors.primary }}>Try again</Text></TouchableOpacity></View>}
      <Card>
        <Text
          style={{
            color: colors.textPrimary,
            textAlign: 'center',
            fontSize: 28,
            lineHeight: 48,
            writingDirection: 'rtl',
          }}
        >
          {selected.arabic}
        </Text>
        <Text
          style={[
            ui.body,
            { color: colors.textSecondary, textAlign: 'center' },
          ]}
        >
          {selected.name}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Count ${selected.name}. Current count ${count}. Target ${selected.count}.`}
          disabled={!ready}
          onPress={() => {
            setCount((n) => n + 1);
            setTotal((n) => n + 1);
          }}
          activeOpacity={0.7}
          style={{
            minHeight: 220,
            width: '100%',
            borderRadius: 100,
            backgroundColor: colors.primary + '12',
            borderColor: colors.primary + '60',
            borderWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 72,
              fontWeight: '500',
              fontVariant: ['tabular-nums'],
            }}
          >
            {count}
          </Text>
          <Text style={[ui.caption, { color: colors.textSecondary }]}>
            Tap to count · Target {selected.count}
          </Text>
        </TouchableOpacity>
        <Text
          accessibilityLiveRegion="polite"
          style={[ui.caption, { color: colors.primary, textAlign: 'center' }]}
        >
          {count >= selected.count
            ? 'Target reached. Continue at your own pace.'
            : `${selected.count - count} to your target`}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={!ready}
          onPress={() => setCount(0)}
          style={[ui.primaryButton, { flexDirection: 'row', gap: 8 }]}
        >
          <RotateCcw size={18} color={colors.textSecondary} />
          <Text style={[ui.body, { color: colors.textSecondary }]}>
            Reset count
          </Text>
        </TouchableOpacity>
      </Card>
      <Section title="Choose your dhikr">
        {adhkar.map((dhikr) => (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: selected === dhikr }}
            aria-selected={selected === dhikr}
            key={dhikr.name}
            disabled={!ready}
            onPress={() => {
              setSelected(dhikr);
              setCount(0);
            }}
            style={[
              ui.route,
              {
                borderColor:
                  selected === dhikr ? colors.primary : colors.border,
                backgroundColor: colors.cardBackground,
              },
            ]}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[ui.rowTitle, { color: colors.textPrimary }]}>
                {dhikr.name}
              </Text>
              <Text
                style={[
                  ui.caption,
                  { color: colors.textSecondary, writingDirection: 'rtl' },
                ]}
              >
                {dhikr.arabic}
              </Text>
            </View>
            <Text style={[ui.caption, { color: colors.primary }]}>
              {dhikr.count}×{selected === dhikr ? ' ✓' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </Section>
      <Text
        style={[
          ui.caption,
          { color: colors.textSecondary, textAlign: 'center' },
        ]}
      >
        {total.toLocaleString()} remembrances saved on this device
      </Text>
    </Page>
  );
}
