import { AppText as Text } from '../components/Typography';
import React, { useState } from 'react';
import { View, TouchableOpacity, Share } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { BookOpen, Share2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Page, ui } from '../components/DesignSystem';
import { useTheme } from '../contexts/ThemeContext';
import quran from '../assets/data/quran.json';
interface Card {
  id: number;
  topic: string;
  arabicVerse: string;
  translation: string;
  reference: string;
  color1: string;
  color2: string;
  emoji: string;
}

const CARDS_DATA: Card[] = [
  ['Peace', 13, 28], ['Gratitude', 14, 7], ['Trust in Allah', 65, 3],
  ['Hope', 39, 53], ['Forgiveness', 2, 173], ['Guidance', 1, 6],
  ['Patience', 2, 153], ['Strength', 3, 139],
].map(([topic, number, ayah], index) => {
  const surah = quran.find(s => s.number === number)!;
  const verse = surah.ayahs.find(a => a.numberInSurah === ayah)!;
  return { id: index + 1, topic: String(topic), arabicVerse: verse.text, translation: verse.english,
    reference: 'Quran ' + number + ':' + ayah + ' · ' + surah.englishName + ' · Sahih International',
    color1: '#174D3D', color2: '#003626', emoji: '✦' };
});

export default function SwipeCardsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [error, setError] = useState('');
  const card = CARDS_DATA[index];
  const next = () => setIndex((i) => (i + 1) % CARDS_DATA.length);
  const previous = () =>
    setIndex((i) => (i - 1 + CARDS_DATA.length) % CARDS_DATA.length);
  const swipe = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .failOffsetY([-20, 20])
    .onEnd((event) => {
      if (event.translationX < -60) runOnJS(next)();
      else if (event.translationX > 60) runOnJS(previous)();
    });
  const share = async () => {
    try {
      await Share.share({
        message:
          card.arabicVerse + '\n\n' + card.translation + '\n' + card.reference,
      });
    } catch {
      setError(
        'Sharing is unavailable. You can select and copy the verse instead.',
      );
    }
  };
  return (
    <Page title="Gift Ayah" subtitle="Read and reflect." back>
      <GestureDetector gesture={swipe}>
        <View
          style={{
            backgroundColor: '#174D3D',
            borderRadius: 26,
            padding: 28,
            gap: 28,
          }}
        >
          <Text
            style={{
              color: '#D7E8DD',
              fontSize: 13,
              fontWeight: '600',
              letterSpacing: 1,
            }}
          >
            {card.topic}
          </Text>
          <Text
            selectable
            style={{
              color: '#FFFFFF',
              fontSize: 30,
              lineHeight: 56,
              textAlign: 'right',
              writingDirection: 'rtl',
            }}
          >
            {card.arabicVerse}
          </Text>
          <View style={{ width: 32, height: 2, backgroundColor: '#D7BD7C' }} />
          <Text
            selectable
            style={{ color: '#FFFFFF', fontSize: 20, lineHeight: 32 }}
          >
            {card.translation}
          </Text>
          <Text style={{ color: '#D7E8DD', fontSize: 14 }}>
            {card.reference}
          </Text>
        </View>
      </GestureDetector>
      <View style={ui.row}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={previous}
          style={ui.primaryButton}
        >
          <Text style={[ui.rowTitle, { color: colors.primary }]}>Previous</Text>
        </TouchableOpacity>
        <Text
          accessibilityLiveRegion="polite"
          style={[ui.caption, { color: colors.textSecondary }]}
        >
          {index + 1} / {CARDS_DATA.length}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={next}
          style={ui.primaryButton}
        >
          <Text style={[ui.rowTitle, { color: colors.primary }]}>Next</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={share}
        style={[
          ui.route,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
        ]}
      >
        <Share2 color={colors.primary} size={22} />
        <Text style={[ui.rowTitle, { color: colors.textPrimary }]}>
          Share this verse
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => router.push({ pathname: '/(tabs)/quran', params: { surah: String([13, 14, 65, 39, 2, 1, 2, 3][index]) } })}
        style={[
          ui.route,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
        ]}
      >
        <BookOpen color={colors.primary} size={22} />
        <Text style={[ui.rowTitle, { color: colors.textPrimary }]}>
          Open the Quran
        </Text>
      </TouchableOpacity>
      {!!error && (
        <Text
          accessibilityRole="alert"
          style={[ui.caption, { color: colors.textSecondary }]}
        >
          {error}
        </Text>
      )}
    </Page>
  );
}
