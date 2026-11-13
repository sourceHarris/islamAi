import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayDateString } from './trackingService';

export interface PrayerSettings { city: string; country: string; method: number; school: number }
export interface PrayerSchedule {
  date: string; city: string; timezone: string; method: string;
  timings: Record<string, string>;
}
export const prayerMethods = [{ id: 1, name: 'Karachi' }, { id: 2, name: 'ISNA' }, { id: 3, name: 'Muslim World League' }, { id: 4, name: 'Umm Al-Qura' }, { id: 5, name: 'Egyptian' }];
export async function fetchPrayerTimes(settings: PrayerSettings): Promise<PrayerSchedule> {
  if (!settings.city.trim() || !settings.country.trim()) throw new Error('Enter a city and country.');
  const date = getTodayDateString();
  const key = 'hidayah_prayer_times_' + JSON.stringify({ ...settings, date });
  try { const cached = await AsyncStorage.getItem(key); if (cached) return JSON.parse(cached); } catch { /* Fetch without cache. */ }
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 20000);
  try {
    const url = 'https://api.aladhan.com/v1/timingsByCity/' + date.split('-').reverse().join('-') + '?city=' + encodeURIComponent(settings.city.trim()) + '&country=' + encodeURIComponent(settings.country.trim()) + '&method=' + settings.method + '&school=' + settings.school;
    const response = await fetch(url, { signal: controller.signal });
    const json = await response.json();
    if (!response.ok || json.code !== 200 || !json.data?.timings) throw new Error('Prayer times could not be loaded. Check the city and connection, then retry.');
    const timings: Record<string, string> = {};
    for (const name of ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
      const time = json.data.timings[name]?.match(/^\d{2}:\d{2}/)?.[0];
      if (!time) throw new Error('The prayer schedule is incomplete.');
      timings[name] = time;
    }
    const schedule = { date, city: settings.city.trim(), timezone: json.data.meta.timezone, method: json.data.meta.method.name, timings };
    void AsyncStorage.setItem(key, JSON.stringify(schedule)).catch(() => {});
    return schedule;
  } finally { clearTimeout(timer); }
}
