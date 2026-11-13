import AsyncStorage from '@react-native-async-storage/async-storage';
import { personalStorageKey, savePersonalData } from './personalStorage';
export interface SavedReply { id: string; text: string; sources: { citation: string; source: string }[]; savedAt: string }
export async function loadSavedReplies(): Promise<SavedReply[]> {
  return readReplies(await personalStorageKey('saved_replies'));
}
async function readReplies(key: string): Promise<SavedReply[]> {
  const value = await AsyncStorage.getItem(key);
  const data = value ? JSON.parse(value) : [];
  if (!Array.isArray(data) || data.some(r => !r || typeof r.id !== 'string' || typeof r.text !== 'string' || !Array.isArray(r.sources))) throw new Error('Saved replies could not be read.');
  return data;
}
let queue: Promise<unknown> = Promise.resolve();
export function saveReply(text: string, sources: SavedReply['sources']): Promise<void> {
  const next = queue.catch(() => {}).then(async () => {
    const key = await personalStorageKey('saved_replies'), replies = await readReplies(key);
    if (replies.some(r => r.text === text)) return;
    await savePersonalData(key, [{ id: Date.now().toString(), text, sources, savedAt: new Date().toISOString() }, ...replies]);
  });
  queue = next;
  return next;
}
export async function removeSavedReply(id: string): Promise<void> {
  const next = queue.catch(() => {}).then(async () => {
    const key = await personalStorageKey('saved_replies');
    await savePersonalData(key, (await readReplies(key)).filter(r => r.id !== id));
  });
  queue = next;
  return next;
}
