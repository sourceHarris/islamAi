// Quran API Service
// Source: api.alquran.cloud — Free, no API key required
// Quran text: Uthmani script (King Fahd Complex)
// English translation: Sahih International (widely accepted)

const BASE_URL = 'https://api.alquran.cloud/v1';

export interface Surah {
  number: number;
  name: string;           // Arabic name
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;         // global ayah number
  numberInSurah: number;
  text: string;           // Arabic text
  translation: string;   // English (Sahih International)
}

// Fetch all 114 surahs
export async function fetchAllSurahs(): Promise<Surah[]> {
  const response = await fetch(`${BASE_URL}/surah`);
  if (!response.ok) throw new Error('Failed to fetch surahs');
  const json = await response.json();
  return json.data as Surah[];
}

// Fetch all ayahs for a surah — Arabic text + Urdu translation (Jalandhry)
export async function fetchSurahVerses(surahNumber: number): Promise<Ayah[]> {
  // Fetch Arabic (Uthmani) and Urdu (Fateh Muhammad Jalandhry) in parallel
  const [arabicRes, translationRes] = await Promise.all([
    fetch(`${BASE_URL}/surah/${surahNumber}`),
    fetch(`${BASE_URL}/surah/${surahNumber}/ur.jalandhry`),
  ]);

  if (!arabicRes.ok || !translationRes.ok) {
    throw new Error('Failed to fetch surah verses');
  }

  const [arabicJson, translationJson] = await Promise.all([
    arabicRes.json(),
    translationRes.json(),
  ]);

  const arabicAyahs = arabicJson.data.ayahs as any[];
  const translationAyahs = translationJson.data.ayahs as any[];

  return arabicAyahs.map((ayah, index) => ({
    number: ayah.number,
    numberInSurah: ayah.numberInSurah,
    text: ayah.text,
    translation: translationAyahs[index]?.text ?? '',
  }));
}
