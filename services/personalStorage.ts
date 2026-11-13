import AsyncStorage from '@react-native-async-storage/async-storage';

// New features use account-specific keys. Existing history keys stay intact.
export async function personalStorageKey(feature: string): Promise<string> {
  const stored = await AsyncStorage.getItem('hidayah_user');
  if (!stored) throw new Error('Sign in to save your personal practice.');
  const user = JSON.parse(stored);
  const identity = user.id ?? user.registration_number ?? user.email;
  if (!identity) throw new Error('Your account could not be identified. Sign in again.');
  return `hidayah_${feature}_v1_${encodeURIComponent(String(identity))}`;
}
const writes = new Map<string, Promise<void>>();
export function savePersonalData(key: string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value);
  const next = (writes.get(key) || Promise.resolve()).catch(() => {}).then(() => AsyncStorage.setItem(key, serialized));
  writes.set(key, next);
  void next.finally(() => { if (writes.get(key) === next) writes.delete(key); }).catch(() => {});
  return next;
}
