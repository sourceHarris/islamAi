import quran from '../assets/data/quran.json';
export interface EnglishSurah {
  verses: Record<number, string>; firstPage: number | null; firstJuz: number | null;
}
export async function fetchEnglishSurah(number: number, signal?: AbortSignal): Promise<EnglishSurah> {
  if (signal?.aborted) throw new Error('Reading cancelled');
  const surah = quran.find(s => s.number === number);
  if (!surah) throw new Error('Choose a Surah from 1 to 114.');
  return {
    verses: Object.fromEntries(surah.ayahs.map(a => [a.numberInSurah, a.english])),
    firstPage: surah.ayahs[0]?.page ?? null, firstJuz: surah.ayahs[0]?.juz ?? null,
  };
}
