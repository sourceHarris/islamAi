// https://github.com/fawazahmed0/hadith-api — actual chapter editions, no API key.
import catalogue from '../assets/data/hadith-catalogue.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheHadithChapter } from './hadithCache';
export interface HadithBook { id: string; name: string; available: number }
export interface HadithItem {
  number: number; arab: string;
  id: string; // Legacy Indonesian field retained; never mislabel as English.
  english?: string; urdu?: string; section?: string;
  grades?: { name: string; grade: string }[];
}
export interface HadithPage {
  name: string; id: string; available: number; requested: number; hadiths: HadithItem[];
  translationWarning?: string;
}
interface Edition { hadiths: { hadithnumber: number; text: string; grades?: { name: string; grade: string }[] }[] }
const BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';
const memory = new Map<string, Promise<Edition>>();
async function editionChapter(edition: string, section: number): Promise<Edition> {
  const key = 'hidayah_hadith_v1_' + edition + '_' + section;
  if (!memory.has(key)) {
    const promise = (async () => {
      let cached: string | null = null;
      try { cached = await AsyncStorage.getItem(key); } catch { /* Reading remains available online. */ }
      if (cached) {
        try { const parsed = JSON.parse(cached); if (Array.isArray(parsed.hadiths)) return parsed as Edition; } catch { /* Re-fetch invalid cache. */ }
      }
      for (const suffix of ['min.json', 'json']) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        try {
          const response = await fetch(BASE + '/editions/' + edition + '/sections/' + section + '.' + suffix, { signal: controller.signal });
          if (!response.ok) throw new Error('Chapter unavailable');
          const data = await response.json();
          if (!Array.isArray(data.hadiths)) throw new Error('Invalid Hadith response');
          void cacheHadithChapter(key, JSON.stringify(data)).catch(() => {});
          return data as Edition;
        } catch {
          if (suffix === 'json') throw new Error('This Hadith chapter could not be loaded. Check your connection and try again.');
        } finally { clearTimeout(timeout); }
      }
      throw new Error('Chapter unavailable');
    })();
    if (memory.size >= 24) memory.delete(memory.keys().next().value!);
    memory.set(key, promise);
    promise.catch(() => memory.delete(key));
  }
  return memory.get(key)!;
}
export async function fetchHadithBooks(): Promise<HadithBook[]> {
  return catalogue.map(({ id, name, available }) => ({ id, name, available }));
}
export function hadithCoverage(bookId: string) {
  const book = catalogue.find(b => b.id === bookId);
  return { languages: book?.languages.map(e => e.language) || [], missingArabic: book?.missingArabic.length || 0 };
}
export function hadithSections(bookId: string) {
  const book = catalogue.find(b => b.id === bookId);
  if (!book) return [];
  return Object.entries(book.sections).filter(([, title]) => !!title).map(([id, title]) => ({
    id: Number(id), title: title!, start: book.index.findIndex(row => row[1] === Number(id)) + 1,
  })).filter(s => s.start > 0);
}
export async function fetchHadiths(bookId: string, start = 1, end = 20): Promise<HadithPage> {
  const book = catalogue.find(b => b.id === bookId);
  if (!book) throw new Error('Unknown Hadith collection');
  if (!Number.isInteger(start) || start < 1 || end < start || end - start >= 50) throw new Error('Choose a range of up to 50 narrations.');
  const index = book.index.slice(start - 1, Math.min(end, book.available));
  const sections = [...new Set(index.map(row => row[1]))];
  const editions = new Map(book.languages.map(e => [e.language, e.edition]));
  const results = await Promise.all(sections.map(async section => {
    const arabic = await editionChapter(editions.get('Arabic')!, section);
    const translations = await Promise.allSettled(['English', 'Urdu'].map(language => {
      const edition = editions.get(language);
      return edition ? editionChapter(edition, section) : Promise.resolve(null);
    }));
    return { section, arabic, translations };
  }));
  const hadiths = index.map(([number, section]) => {
    const chapter = results.find(r => r.section === section)!;
    const arab = chapter.arabic.hadiths.find(h => h.hadithnumber === number);
    if (!arab?.text) throw new Error('Hadith ' + number + " is missing from this provider's Arabic edition.");
    const translation = (i: number) => {
      const result = chapter.translations[i];
      return result.status === 'fulfilled' ? result.value?.hadiths.find(h => h.hadithnumber === number)?.text : undefined;
    };
    const englishResult = chapter.translations[0];
    const englishRecord = englishResult.status === 'fulfilled' ? englishResult.value?.hadiths.find(h => h.hadithnumber === number) : undefined;
    return { number, arab: arab.text, id: '', english: translation(0), urdu: translation(1),
      section: (book.sections as Record<string, string>)[section], grades: englishRecord?.grades || arab.grades || [] };
  });
  return { id: book.id, name: book.name, available: book.available, requested: hadiths.length, hadiths,
    translationWarning: results.some(r => r.translations.some(t => t.status === 'rejected')) ? 'Some translations could not be loaded. Arabic is available; retry to load translations.' : undefined };
}
export async function fetchHadithByNumber(bookId: string, number: number): Promise<HadithPage> {
  const book = catalogue.find(b => b.id === bookId);
  const position = book?.index.findIndex(row => row[0] === number) ?? -1;
  if (position < 0) throw new Error('That Hadith number is not in this edition.');
  return fetchHadiths(bookId, position + 1, position + 1);
}
