import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  SquarePen,
  Info,
  Mic,
  BookOpen,
  Bookmark,
  Share2,
} from 'lucide-react-native';
import { useReducedMotion } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppBackdrop, GlassSurface } from '../../components/Glass';
import { useTheme, fonts } from '../../contexts/ThemeContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandHeader, ui } from '../../components/DesignSystem';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { saveReply } from '../../services/savedReplies';
import { API_BASE } from '../../constants/config';
import { fetchWithTimeout } from '../../utils/fetchWithTimeout';

type Source = { citation: string; source: string };
type Message = {
  id: number;
  text: string;
  isUser: boolean;
  sources?: Source[];
};

async function callHidayahBackend(
  message: string,
  userId: string,
): Promise<{ reply: string; detected_emotion: string; sources: Source[] }> {
  const response = await fetchWithTimeout(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, user_id: userId }),
  }, 90000);
  if (!response.ok) throw new Error('The response could not be loaded.');
  return response.json();
}

function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (
        <Text
          key={i}
          style={
            part.startsWith('**') && part.endsWith('**')
              ? { fontWeight: '600' }
              : undefined
          }
        >
          {part.startsWith('**') && part.endsWith('**')
            ? part.slice(2, -2)
            : part}
        </Text>
      ))}
    </>
  );
}

// Keep source metadata outside the reading flow, including replies using the older text format.
function splitAnswer(text: string) {
  const lines = text.split('\n');
  const sourceStart = lines.findIndex((line) =>
    /^(?:📚\s*)?Sources:?$/i.test(line.trim().replace(/\*\*|^#+\s*/g, '')),
  );
  return {
    body: (sourceStart < 0 ? lines : lines.slice(0, sourceStart))
      .join('\n')
      .trim(),
    citations:
      sourceStart < 0
        ? []
        : lines
            .slice(sourceStart + 1)
            .map((line) => line.trim().replace(/^[•\-]\s*/, ''))
            .filter(Boolean),
  };
}
function AnswerText({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.answerText}>
      {text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((paragraph, i) => {
          const lines = paragraph.split('\n').filter((line) => line.trim());
          return (
            <View key={i} style={{ gap: 8 }}>
              {lines.map((raw, j) => {
                const line = raw.trim();
                const heading = line.match(
                  /^(?:#{1,3}\s+(.+)|\*\*([^*]+)\*\*\s*:?)$/,
                );
                const bullet = line.match(/^([•\-]|\d+\.)\s+(.+)$/);
                const evidence = line.match(
                  /^[•\-]\s*\*\*([^*]+)\*\*\s*[:：]\s*["“](.+)["”]$/,
                );
                const rtl = /^[\u0600-\u06FF\u0750-\u077F]/.test(
                  line.replace(/^\*\*/, ''),
                );
                if (evidence)
                  return (
                    <View
                      key={j}
                      style={[
                        styles.quote,
                        { borderColor: colors.border, backgroundColor: colors.surface },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sourceText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {evidence[1]}
                      </Text>
                      <Text
                        selectable
                        style={[styles.prose, { color: colors.textPrimary }]}
                      >
                        {evidence[2]}
                      </Text>
                    </View>
                  );
                if (heading)
                  return (
                    <Text
                      key={j}
                      accessibilityRole="header"
                      selectable
                      style={[
                        styles.prose,
                        { color: colors.textPrimary, fontWeight: '600' },
                      ]}
                    >
                      {heading[1] || heading[2]}
                    </Text>
                  );
                if (bullet)
                  return (
                    <View key={j} style={styles.bulletRow}>
                      <Text
                        style={[styles.prose, { color: colors.textSecondary }]}
                      >
                        {bullet[1] === '-' ? '•' : bullet[1]}
                      </Text>
                      <Text
                        selectable
                        style={[
                          styles.prose,
                          { flex: 1, color: colors.textPrimary },
                        ]}
                      >
                        <InlineText text={bullet[2]} />
                      </Text>
                    </View>
                  );
                return (
                  <Text
                    key={j}
                    selectable
                    style={[
                      styles.prose,
                      { color: colors.textPrimary },
                      rtl && styles.rtl,
                    ]}
                  >
                    <InlineText text={line} />
                  </Text>
                );
              })}
            </View>
          );
        })}
    </View>
  );
}
function Sources({ citations }: { citations: string[] }) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  if (!citations.length) return null;
  return (
    <View style={styles.sources}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? 'Hide' : 'Show'} sources`}
        accessibilityState={{ expanded }}
        aria-expanded={expanded}
        onPress={() => setExpanded((value) => !value)}
        style={styles.sourceButton}
      >
        <Text style={[styles.sourceLabel, { color: colors.textSecondary }]}>
          {citations.length} {citations.length === 1 ? 'source' : 'sources'}
        </Text>
        {expanded ? (
          <ChevronUp size={15} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={15} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
      {expanded && (
        <View style={[styles.sourceList, { borderColor: colors.border }]}>
          {citations.map((citation) => (
            <Text
              key={citation}
              selectable
              style={[styles.sourceText, { color: colors.textSecondary, backgroundColor: colors.surface, padding: 14, borderRadius: 12 }]}
            >
              {citation}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
function ConversationMessage({ message }: { message: Message }) {
  const { colors } = useTheme();
  const [saved, setSaved] = useState(false), [saving, setSaving] = useState(false), [saveError, setSaveError] = useState('');
  const save = async () => {
    setSaving(true); setSaveError('');
    try { await saveReply(message.text, message.sources || []); setSaved(true); }
    catch { setSaveError('This reply could not be saved. Try again.'); }
    finally { setSaving(false); }
  };
  if (message.isUser)
    return (
      <View style={styles.userRow}>
        <View
          style={[
            styles.userMessage,
            { backgroundColor: colors.messageSurface },
          ]}
        >
          <Text
            selectable
            style={[styles.prose, { color: colors.textPrimary }]}
          >
            {message.text}
          </Text>
        </View>
      </View>
    );
  const answer = splitAnswer(message.text);
  const citations = [
    ...new Set(
      message.sources?.length
        ? message.sources.map((source) => source.citation)
        : answer.citations,
    ),
  ];
  return (
    <View style={[styles.answer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}><LinearGradient colors={[colors.primary, colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 2, position: 'absolute', top: 0, left: 0, right: 0 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted }}><BookOpen size={17} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={[styles.sender, { color: colors.textPrimary }]}>Hidayah Companion</Text><Text style={[ui.small, { color: colors.textSecondary }]}>AI-assisted reflection</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Share response" onPress={() => void Share.share({ message: answer.body + (citations.length ? '\n\nSources:\n' + citations.join('\n') : '') }).catch(() => Alert.alert('Sharing unavailable', 'Sharing is not available on this device.'))} style={ui.back}><Share2 size={17} color={colors.textSecondary} /></TouchableOpacity></View>
      <AnswerText text={answer.body} />
      <Sources citations={citations} />
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={saved ? 'Reply saved on this device' : 'Save reply'} disabled={saving || saved} onPress={save} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Bookmark size={17} fill={saved ? colors.primary : 'none'} color={colors.primary} /><Text style={[ui.caption, { color: colors.primary }]}>{saving ? 'Saving…' : saved ? 'Saved on this device' : 'Save reply'}</Text></TouchableOpacity>
      {!!saveError && <Text accessibilityRole="alert" style={[ui.caption, { color: colors.danger }]}>{saveError}</Text>}
    </View>
  );
}

export default function ChatbotScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const scroll = useRef<ScrollView>(null);
  const input = useRef<TextInput>(null);
  const followEnd = useRef(true);
  const nextId = useRef(0);
  const identity = useRef<Promise<string>>(Promise.resolve('anonymous'));
  const mounted = useRef(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(true);
  const params = useLocalSearchParams<{ prompt?: string }>();
  useEffect(() => { if (params.prompt) { setDraft(params.prompt); input.current?.focus(); } }, [params.prompt]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ question: string } | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    mounted.current = true;
    identity.current = AsyncStorage.getItem('hidayah_user')
      .then((stored) => {
        try {
          return stored
            ? (JSON.parse(stored).registration_number ?? 'anonymous')
            : 'anonymous';
        } catch {
          return 'anonymous';
        }
      })
      .catch(() => 'anonymous');
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      mounted.current = false;
      show.remove();
      hide.remove();
    };
  }, []);
  const send = async (question = draft.trim(), retry = false) => {
    if (!question || loading) return;
    followEnd.current = true;
    setError(null);
    setLoading(true);
    if (!retry) {
      setMessages((previous) => [
        ...previous,
        { id: ++nextId.current, text: question, isUser: true },
      ]);
      setDraft('');
    }
    try {
      const result = await callHidayahBackend(question, await identity.current);
      if (mounted.current)
        setMessages((previous) => [
          ...previous,
          {
            id: ++nextId.current,
            text: result.reply,
            sources: result.sources,
            isUser: false,
          },
        ]);
    } catch {
      if (mounted.current) setError({ question });
    } finally {
      if (mounted.current) setLoading(false);
    }
  };
  const reset = () => {
    const clear = () => {
      setMessages([]);
      setDraft('');
      setError(null);
      followEnd.current = true;
      input.current?.focus();
    };
    if (!messages.length || loading) return;
    if (Platform.OS === 'web') {
      if (
        window.confirm(
          'Start a new conversation? The current conversation will be cleared.',
        )
      )
        clear();
    } else
      Alert.alert(
        'Start a new conversation?',
        'The current conversation will be cleared.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start new', onPress: clear },
        ],
      );
  };
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    followEnd.current =
      contentSize.height - contentOffset.y - layoutMeasurement.height < 100;
  };
  const chooseStarter = (question: string) => {
    setDraft(question);
    input.current?.focus();
  };
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppBackdrop />
      <View
        style={[
          styles.column,
          {
            paddingTop: insets.top,
            paddingBottom: keyboardVisible
              ? Math.max(insets.bottom, 8)
              : Math.max(insets.bottom, 12) + 84,
          },
        ]}
      >
        <BrandHeader section="Ask Hidayah" action={<TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="New conversation"
            accessibilityState={{ disabled: !messages.length || loading }}
            disabled={!messages.length || loading}
            onPress={reset}
          >
            <GlassSurface
              style={[
                styles.newButton,
                { opacity: !messages.length || loading ? 0.5 : 1 },
              ]}
            >
              <SquarePen
                size={19}
                color={colors.textPrimary}
                strokeWidth={1.6}
              />
            </GlassSurface>
          </TouchableOpacity>} />
        <View style={[styles.header, { borderColor: colors.border }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: colors.textPrimary }]}
            >
              Ask Hidayah
            </Text>

          </View>
          <Text accessibilityLabel="Questions supported in English or Urdu" style={[ui.small, { color: colors.primary, backgroundColor: colors.surfaceMuted, borderRadius: 12, padding: 8 }]}>English / اردو questions</Text>

        </View>
        <View style={{ paddingHorizontal: 20, paddingBottom: 12, gap: 6, alignItems: 'flex-start' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.messageSurface, borderRadius: 18, paddingHorizontal: 9, paddingVertical: 3 }}><MaterialIcons name="verified" size={14} color={colors.primary} /><Text style={[ui.small, { color: colors.primary }]}>Quran & Sunnah Sources</Text></View><View style={{ borderRadius: 18, paddingHorizontal: 9, paddingVertical: 3, backgroundColor: colors.surfaceMuted }}><Text style={[ui.small, { color: colors.gold }]}>Heart & Emotional Solace</Text></View></View>
        <ScrollView
          ref={scroll}
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.conversation,
            !messages.length && styles.emptyConversation,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={100}
          onContentSizeChange={() => {
            if (followEnd.current && messages.length)
              scroll.current?.scrollToEnd({ animated: !reduceMotion });
          }}
        >
          {noticeVisible && <View style={[styles.trust, { backgroundColor: colors.surface, borderColor: colors.border }]}><Info size={18} color={colors.primary} /><Text style={[ui.caption, { color: colors.textSecondary, flex: 1 }]}>Hidayah AI assists with contemplative reflection and classical citations. For formal legal rulings (Fatwas), please consult accredited scholars.</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Dismiss guidance notice" onPress={() => setNoticeVisible(false)} hitSlop={8} style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted }}><Text style={{ color: colors.textSecondary, fontSize: 22 }}>×</Text></TouchableOpacity></View>}
          {!messages.length ? (
            <View style={styles.welcome}>
              <Svg
                width={44}
                height={64}
                viewBox="0 0 44 64"
                accessible={false}
              >
                <Path
                  d="M5 61V28Q5 13 22 3Q39 13 39 28V61M13 61V31Q13 21 22 14Q31 21 31 31V61"
                  fill="none"
                  stroke={colors.primary}
                  strokeOpacity=".5"
                  strokeWidth="1"
                />
              </Svg>
              <Text
                style={[styles.welcomeTitle, { color: colors.textPrimary }]}
              >
                What&apos;s on your mind?
              </Text>
              <Text
                style={[styles.welcomeText, { color: colors.textSecondary }]}
              >
                A verse, a daily practice,{'\n'}or a question you want to
                explore.
              </Text>
              <View style={styles.starters}>
                {[
                  {
                    label: 'Finding patience',
                    question: 'What does the Quran say about patience?',
                  },
                  {
                    label: 'Understanding prayer',
                    question: 'Explain the importance of Salah',
                  },
                ].map((starter) => (
                  <TouchableOpacity
                    accessibilityRole="button"
                    key={starter.label}
                    onPress={() => chooseStarter(starter.question)}
                    style={[styles.starter, { borderColor: colors.border }]}
                  >
                    <Text
                      style={[
                        styles.starterLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {starter.label}
                    </Text>
                    <ArrowUpRight size={15} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map((message) => (
              <ConversationMessage key={message.id} message={message} />
            ))
          )}
          {loading && (
            <View
              accessibilityRole="progressbar"
              accessibilityLabel="Preparing a response"
              style={styles.loading}
            >
              <ActivityIndicator size="small" color={colors.textSecondary} />
              <Text
                style={[styles.sourceText, { color: colors.textSecondary }]}
              >
                Preparing a response…
              </Text>
            </View>
          )}
          {error && (
            <View
              accessibilityRole="alert"
              style={[styles.error, { borderColor: colors.border }]}
            >
              <Text
                style={[styles.sourceText, { color: colors.textSecondary }]}
              >
                The answer couldn&apos;t be loaded. Check your connection and try
                again.
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => void send(error.question, true)}
                style={styles.retry}
              >
                <Text style={[styles.sourceLabel, { color: colors.primary }]}>
                  Try again
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        <View style={styles.composerArea}>
          {!!messages.length && <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8 }}>{['How can I apply this today?', 'A dua for peace of mind'].map(question => <TouchableOpacity accessibilityRole="button" key={question} onPress={() => chooseStarter(question)} style={[styles.suggestion, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={[ui.small, { color: colors.textPrimary }]}>✦ {question}</Text></TouchableOpacity>)}</ScrollView>}
          <GlassSurface style={[styles.composer, { backgroundColor: colors.cardBackground }]}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Open saved replies" onPress={() => router.push('/saved-replies')} style={ui.back}><Bookmark size={19} color={colors.textSecondary} /></TouchableOpacity>
            <TextInput
              ref={input}
              accessibilityLabel="Your question"
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask Hidayah…"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, writingDirection: /^[\u0600-\u06FF]/.test(draft) ? 'rtl' : 'auto', fontFamily: /^[\u0600-\u06FF]/.test(draft) ? fonts.arabic : fonts.body }]}
              multiline
              numberOfLines={1}
              scrollEnabled={false}
              maxLength={500}
              editable={!loading}
            />
            <View accessible accessibilityLabel="Voice input is not implemented. Use keyboard dictation." style={[ui.back, { opacity: .4 }]}><Mic size={19} color={colors.textSecondary} /></View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Send message"
              accessibilityState={{ disabled: !draft.trim() || loading }}
              disabled={!draft.trim() || loading}
              onPress={() => void send()}
              style={[
                styles.send,
                {
                  backgroundColor:
                    draft.trim() && !loading
                      ? colors.primary
                      : colors.messageSurface,
                },
              ]}
            >
              <ArrowUp
                size={21}
                strokeWidth={1.8}
                color={
                  draft.trim() && !loading
                    ? colors.onPrimary
                    : colors.textSecondary
                }
              />
            </TouchableOpacity>
          </GlassSurface>
          <Text style={[styles.disclosure, { color: colors.textSecondary }]}>
            AI-assisted. Replies save on this device. For voice input, use keyboard dictation.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  column: { flex: 1, width: '100%', maxWidth: 620, alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
  },
  title: { fontFamily: fonts.body, fontSize: 18, fontWeight: '500', lineHeight: 24 },
  headerSubtitle: { fontFamily: fonts.body, fontSize: 11, lineHeight: 18 },
  newButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  conversation: { paddingHorizontal: 20, paddingVertical: 16, gap: 24 },
  emptyConversation: { flexGrow: 1 },
  welcome: { alignItems: 'center', gap: 16, paddingVertical: 16 },
  welcomeTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '500',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  welcomeText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  starters: { marginTop: 12, width: '100%', maxWidth: 300 },
  starter: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 24,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  starterLabel: { fontFamily: fonts.body, fontSize: 14, flexShrink: 1 },
  userRow: { alignItems: 'flex-end' },
  userMessage: {
    maxWidth: '85%',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  answer: { gap: 16, padding: 16, borderWidth: 1, borderRadius: 16, borderTopStartRadius: 4, overflow: 'hidden' },
  sender: { fontFamily: fonts.body, fontSize: 13, fontWeight: '600' },
  answerText: { gap: 18 },
  prose: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22 },
  rtl: {
    fontFamily: fonts.arabic,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontSize: 25,
    lineHeight: 48,
  },
  bulletRow: { flexDirection: 'row', gap: 10 },
  quote: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 8, marginVertical: 4 },
  sources: { gap: 2 },
  sourceButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  sourceLabel: { fontFamily: fonts.body, fontSize: 13, fontWeight: '500' },
  sourceText: { fontFamily: fonts.body, fontSize: 13, lineHeight: 22 },
  sourceList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  composerArea: { paddingHorizontal: 18, paddingTop: 8, gap: 10 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 8,
    borderRadius: 16,
  },
  input: {
    borderRadius: 24,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
    maxHeight: 128,
    fontSize: 14,
    lineHeight: 22,
  },
  send: {
    width: 44,
    height: 44,
    marginBottom: 2,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclosure: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  error: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 14 },
  retry: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  trust: { flexDirection: 'row', gap: 8, padding: 16, borderRadius: 12, borderWidth: 0, alignItems: 'flex-start' },
  suggestion: { borderWidth: 1, borderRadius: 22, paddingHorizontal: 12, paddingVertical: 10, minHeight: 38, justifyContent: 'center' },
});
