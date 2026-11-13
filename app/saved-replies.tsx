import React, { useCallback, useState } from 'react';
import { Alert, Platform, Share, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Share2, Trash2 } from 'lucide-react-native';
import { Card, Page, ui } from '../components/DesignSystem';
import { useTheme } from '../contexts/ThemeContext';
import { loadSavedReplies, removeSavedReply, SavedReply } from '../services/savedReplies';
import { ReplyText } from '../components/ReplyText';

export default function SavedRepliesScreen() {
  const { colors } = useTheme();
  const [replies, setReplies] = useState<SavedReply[]>([]), [ready, setReady] = useState(false), [error, setError] = useState('');
  const load = useCallback(() => {
    let active = true;
    loadSavedReplies().then(data => { if (active) { setReplies(data); setReady(true); setError(''); } }).catch(() => { if (active) setError('Saved replies could not be loaded. Existing data has been kept.'); });
    return () => { active = false; };
  }, []);
  useFocusEffect(load);
  const remove = (id: string) => {
    const run = async () => { try { await removeSavedReply(id); setReplies(await loadSavedReplies()); } catch { setError('This reply could not be removed. Try again.'); } };
    if (Platform.OS === 'web') { if (window.confirm('Remove this saved reply?')) void run(); }
    else Alert.alert('Remove this reply?', 'The saved copy on this device will be removed.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => void run() }]);
  };
  return <Page title="Saved replies" subtitle="AI responses you chose to keep on this device." back>
    {!!error && <Card><Text accessibilityRole="alert" style={[ui.body, { color: colors.danger }]}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={load} style={ui.primaryButton}><Text style={{ color: colors.primary }}>Try again</Text></TouchableOpacity></Card>}
    {!ready && !error && <Text style={[ui.body, { color: colors.textSecondary }]}>Loading saved replies…</Text>}
    {ready && !replies.length && <Card><Text style={[ui.rowTitle, { color: colors.textPrimary }]}>Keep a reflection close</Text><Text style={[ui.body, { color: colors.textSecondary }]}>Use the bookmark on an AI answer to save it here with its sources.</Text></Card>}
    {replies.map(reply => <Card key={reply.id}>
      <View style={ui.row}><Text style={[ui.small, { color: colors.textSecondary }]}>AI-assisted · {new Date(reply.savedAt).toLocaleDateString()}</Text><View style={{ flexDirection: 'row' }}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Share saved reply" onPress={() => void Share.share({ message: reply.text }).catch(() => setError('Sharing is not supported here. Select and copy the reply instead.'))} style={ui.back}><Share2 size={18} color={colors.primary} /></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel="Remove saved reply" onPress={() => remove(reply.id)} style={ui.back}><Trash2 size={18} color={colors.danger} /></TouchableOpacity></View></View>
      <ReplyText text={reply.text} />
      {reply.sources.map((source, index) => <Text selectable key={index} style={[ui.caption, { color: colors.textSecondary }]}>{source.citation} · {source.source}</Text>)}
    </Card>)}
  </Page>;
}
