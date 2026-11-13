// Complete Al Quran Cloud snapshot: Uthmani Arabic + Jalandhry Urdu.
// Public service interface preserved; reading no longer requires a network.
import quran from '../assets/data/quran.json';
export interface Surah {
  number: number; name: string; englishName: string; englishNameTranslation: string;
  numberOfAyahs: number; revelationType: 'Meccan' | 'Medinan';
}
export interface Ayah {
  number: number; numberInSurah: number; text: string;
  translation: string; // Urdu: Fateh Muhammad Jalandhry
}
export async function fetchAllSurahs(): Promise<Surah[]> {
  return quran.map(({ ayahs: _ayahs, ...surah }) => ({ ...surah, revelationType: surah.revelationType as Surah['revelationType'] }));
}
export async function fetchSurahVerses(surahNumber: number): Promise<Ayah[]> {
  const surah = quran.find(s => s.number === surahNumber);
  if (!surah) throw new Error('Choose a Surah from 1 to 114.');
  return surah.ayahs.map(({ number, numberInSurah, text, translation }) => ({ number, numberInSurah, text, translation }));
}
