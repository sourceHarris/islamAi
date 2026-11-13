import AsyncStorage from '@react-native-async-storage/async-storage';

// Bound disposable text caches so they cannot consume all web storage needed by
// personal prayers, bookmarks, and practice history. Only our own cache keys evict.
const PREFIX = 'hidayah_hadith_v1_';
const MAX_CHARACTERS = 700000;
let pending: Promise<void> = Promise.resolve();
export function cacheHadithChapter(key: string, value: string): Promise<void> {
  if (!key.startsWith(PREFIX) || value.length > MAX_CHARACTERS) return Promise.resolve();
  const next = pending.catch(() => {}).then(async () => {
    const keys = (await AsyncStorage.getAllKeys()).filter(k => k.startsWith(PREFIX) && k !== key);
    const entries = await AsyncStorage.multiGet(keys);
    let size = entries.reduce((n, [, content]) => n + (content?.length || 0), 0) + value.length;
    const remove: string[] = [];
    for (const [oldKey, content] of entries) {
      if (size <= MAX_CHARACTERS) break;
      remove.push(oldKey); size -= content?.length || 0;
    }
    if (remove.length) await AsyncStorage.multiRemove(remove);
    await AsyncStorage.setItem(key, value);
  });
  pending = next;
  return next;
}
