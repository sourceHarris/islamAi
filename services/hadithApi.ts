// Hadith API Service
// Source: api.hadith.gading.dev — Free, no API key required
// Covers 9 major hadith collections

const BASE_URL = 'https://api.hadith.gading.dev';

export interface HadithBook {
  id: string;
  name: string;
  available: number; // total hadiths in collection
}

export interface HadithItem {
  number: number;
  arab: string;   // Arabic text
  id: string;     // Indonesian (used as English fallback — contains English when available)
}

export interface HadithPage {
  name: string;
  id: string;
  available: number;
  requested: number;
  hadiths: HadithItem[];
}

// Fetch list of all 9 hadith books
export async function fetchHadithBooks(): Promise<HadithBook[]> {
  const response = await fetch(`${BASE_URL}/books`);
  if (!response.ok) throw new Error('Failed to fetch hadith books');
  const json = await response.json();
  return json.data as HadithBook[];
}

// Fetch a page of hadiths from a given book
// range: { start: number, end: number } — max 50 per request
export async function fetchHadiths(
  bookId: string,
  start: number = 1,
  end: number = 20
): Promise<HadithPage> {
  const response = await fetch(`${BASE_URL}/books/${bookId}?range=${start}-${end}`);
  if (!response.ok) throw new Error(`Failed to fetch hadiths from ${bookId}`);
  const json = await response.json();
  return json.data as HadithPage;
}
