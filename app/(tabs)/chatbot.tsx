import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { MessageCircle, Send, Sparkles, BookOpen, Heart, AlertTriangle, Quote } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../../constants/config';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  sources?: { citation: string; source: string }[];
}

let _cachedUserId = 'anonymous';

async function callHidayahBackend(
  message: string
): Promise<{ reply: string; detected_emotion: string; sources: { citation: string; source: string }[] }> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, user_id: _cachedUserId }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail ?? 'Failed to get a response from the server.');
  }
  return response.json();
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator({ color }: { color: string }) {
  return (
    <View style={styles.typingContainer}>
      <View style={[styles.typingBubble, { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.15)' }]}>
        <View style={[styles.typingDot, { backgroundColor: color }]} />
        <View style={[styles.typingDot, { backgroundColor: color, opacity: 0.6 }]} />
        <View style={[styles.typingDot, { backgroundColor: color, opacity: 0.3 }]} />
      </View>
    </View>
  );
}

// ─── Rich Text Parser ─────────────────────────────────────────────────────────
// Renders **bold**, section headers (lines ending with :), bullet points (•/-),
// quoted evidence lines, and the Sources block — all as proper React Native views.
function RichText({ text, textColor, primaryColor, cardBg, borderColor }: {
  text: string;
  textColor: string;
  primaryColor: string;
  cardBg: string;
  borderColor: string;
}) {
  const lines = text.split('\n');

  const renderInline = (raw: string, key: string | number) => {
    // Split on **...**
    const parts = raw.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Text key={key} style={{ color: textColor, fontSize: 15, lineHeight: 23, flexShrink: 1, flexWrap: 'wrap' }}>
        {parts.map((part, i) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <Text key={i} style={{ fontWeight: '700', color: primaryColor }}>
              {part.slice(2, -2)}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Empty line → small spacer
    if (trimmed === '') {
      elements.push(<View key={`sp-${i}`} style={{ height: 6 }} />);
      i++;
      continue;
    }

    // ── Sources block ──────────────────────────────────────────────────────────
    if (trimmed.startsWith('📚 Sources:')) {
      const sourceLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        sourceLines.push(lines[i].trim().replace(/^[•\-]\s*/, ''));
        i++;
      }
      elements.push(
        <View key={`src-${i}`} style={[styles.sourcesBlock, { backgroundColor: primaryColor + '12', borderColor: primaryColor + '40' }]}>
          <Text style={[styles.sourcesTitle, { color: primaryColor }]}>📚 Sources</Text>
          {sourceLines.map((src, idx) => (
            <View key={idx} style={styles.sourceRow}>
              <Text style={[styles.sourceDot, { color: primaryColor }]}>›</Text>
              <Text style={[styles.sourceText, { color: textColor }]}>{src}</Text>
            </View>
          ))}
        </View>
      );
      continue;
    }

    // ── Section headers: lines that are **Header:** ────────────────────────────
    const headerMatch = trimmed.match(/^\*\*([^*]+)\*\*\s*:?\s*$/);
    if (headerMatch) {
      const label = headerMatch[1].trim();
      elements.push(
        <View key={`hdr-${i}`} style={[styles.sectionHeader, { borderLeftColor: primaryColor }]}>
          <Text style={[styles.sectionHeaderText, { color: primaryColor }]}>{label}</Text>
        </View>
      );
      i++;
      continue;
    }

    // ── Evidence quote lines: • **Citation:** "text" ──────────────────────────
    const evidenceMatch = trimmed.match(/^[•\-]\s*\*\*([^*]+)\*\*\s*[:：]\s*"(.+)"$/s);
    if (evidenceMatch) {
      const citation = evidenceMatch[1].trim();
      const quote = evidenceMatch[2].trim();
      elements.push(
        <View key={`ev-${i}`} style={[styles.evidenceBlock, { backgroundColor: cardBg, borderColor: primaryColor + '50' }]}>
          <View style={[styles.evidenceAccent, { backgroundColor: primaryColor }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.evidenceCitation, { color: primaryColor }]}>{citation}</Text>
            <Text style={[styles.evidenceQuote, { color: textColor }]}>"{quote}"</Text>
          </View>
        </View>
      );
      i++;
      continue;
    }

    // ── Regular bullet point: • or - ──────────────────────────────────────────
    if (/^[•\-]\s/.test(trimmed)) {
      const content = trimmed.replace(/^[•\-]\s*/, '');
      elements.push(
        <View key={`bl-${i}`} style={styles.bulletRow}>
          <Text style={[styles.bullet, { color: primaryColor }]}>•</Text>
          <View style={{ flex: 1 }}>{renderInline(content, `blt-${i}`)}</View>
        </View>
      );
      i++;
      continue;
    }

    // ── Urdu / RTL paragraph: starts with Arabic/Urdu script ──────────────────
    const isRtl = /^[\u0600-\u06FF\u0750-\u077F]/.test(trimmed);
    if (isRtl) {
      elements.push(
        <View key={`rtl-${i}`} style={[styles.urduBlock, { backgroundColor: primaryColor + '10', borderColor: primaryColor + '30' }]}>
          <Text style={[styles.urduText, { color: textColor }]}>{trimmed}</Text>
        </View>
      );
      i++;
      continue;
    }

    // ── Plain paragraph ────────────────────────────────────────────────────────
    elements.push(
      <View key={`p-${i}`} style={styles.paragraph}>
        {renderInline(trimmed, `pi-${i}`)}
      </View>
    );
    i++;
  }

  return <View style={{ gap: 2 }}>{elements}</View>;
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message, colors }: { message: Message; colors: any }) {
  if (message.isUser) {
    return (
      <View style={[styles.messageBubble, styles.userBubble]}>
        <View style={[styles.userContent, { backgroundColor: colors.primary }]}>
          <Text style={styles.userText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.messageBubble, styles.aiBubble]}>
      <View style={[styles.aiAvatar, { backgroundColor: colors.primary + '20', borderColor: colors.border }]}>
        <MessageCircle size={16} color={colors.primary} />
      </View>
      <View style={[styles.aiContent, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <RichText
          text={message.text}
          textColor={colors.textPrimary}
          primaryColor={colors.primary}
          cardBg={colors.background}
          borderColor={colors.border}
        />
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ChatbotScreen() {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "السلام عليكم ورحمة الله وبركاته!\n\n**Welcome to Hidayah AI** — your Islamic assistant.\n\nAsk me anything about:\n• Quran & Tafsir\n• Hadith & Sunnah\n• Daily Du'as & Dhikr\n• Fiqh & Islamic rulings\n• Islamic history\n\nYou can write in **any language** — I'll reply in the same language. 🌙",
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('hidayah_user').then((stored) => {
      if (stored) {
        const user = JSON.parse(stored);
        _cachedUserId = user.registration_number ?? 'anonymous';
      }
    });
  }, []);

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userText = inputText.trim();
    const userMessage: Message = { id: messages.length + 1, text: userText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await callHidayahBackend(userText);

      // Append sources block to reply text if present
      let replyText = result.reply;
      if (result.sources && result.sources.length > 0) {
        const sourceLines = result.sources.map((s) => `• ${s.citation}`).join('\n');
        replyText += `\n\n📚 Sources:\n${sourceLines}`;
      }

      setMessages(prev => [...prev, { id: Date.now(), text: replyText, isUser: false, sources: result.sources }]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: `**Error**\n\n${error.message}\n\nMake sure the Hidayah backend is running on port 8000.`,
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const quickQuestions = [
    "What are the 5 pillars of Islam?",
    "Explain the importance of Salah",
    "What does the Quran say about patience?",
    "Du'a for anxiety and stress",
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>

      <ImageBackground
        source={require('../../assets/images/chatbot-img.png')}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.08 }}
        resizeMode="cover">

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <View style={[styles.aiIconContainer, { backgroundColor: colors.primary + '20', borderColor: colors.border }]}>
              <Sparkles size={28} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Islamic AI Assistant</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Powered by Groq • Llama 3 • RAG
              </Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}>
          <AlertTriangle size={14} color={colors.primary} />
          <Text style={[styles.disclaimerText, { color: colors.primary }]}>
            AI answers are for guidance only — always verify with a qualified scholar.
          </Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} colors={colors} />
          ))}

          {isLoading && <TypingIndicator color={colors.primary} />}

          {messages.length === 1 && !isLoading && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={[styles.quickQuestionsTitle, { color: colors.textSecondary }]}>
                Suggested questions:
              </Text>
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickQuestionButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => setInputText(question)}>
                  <Text style={[styles.quickQuestionText, { color: colors.primary }]}>{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Features bar */}
        <View style={[styles.featuresBanner, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
          <View style={styles.featureItem}>
            <BookOpen size={14} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.primary }]}>Quran & Hadith</Text>
          </View>
          <View style={styles.featureItem}>
            <Heart size={14} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.primary }]}>Islamic Guidance</Text>
          </View>
          <View style={styles.featureItem}>
            <Sparkles size={14} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.primary }]}>AI Powered</Text>
          </View>
        </View>

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Ask in any language..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.border }]}
            onPress={handleSend}
            disabled={inputText.trim() === '' || isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Send size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },

  // Header
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiIconContainer: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },

  // Disclaimer
  disclaimer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 12, marginBottom: 4, padding: 10, borderRadius: 10, borderWidth: 1 },
  disclaimerText: { fontSize: 12, flex: 1, lineHeight: 16 },

  // Messages
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8, gap: 14 },
  messageBubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start', alignItems: 'flex-start' },

  // User bubble
  userContent: { maxWidth: '78%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderBottomRightRadius: 4 },
  userText: { color: '#ffffff', fontSize: 15, lineHeight: 22 },

  // AI bubble
  aiAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginTop: 4 },
  aiContent: { flex: 1, maxWidth: '85%', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 20, borderTopLeftRadius: 4, borderWidth: 1 },

  // Rich text elements
  paragraph: { flexDirection: 'row', flexWrap: 'wrap' },
  bulletRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', paddingLeft: 4 },
  bullet: { fontSize: 16, lineHeight: 23, fontWeight: '700' },

  // Section header
  sectionHeader: { borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 2, marginTop: 4 },
  sectionHeaderText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },

  // Evidence block
  evidenceBlock: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, overflow: 'hidden', marginVertical: 4 },
  evidenceAccent: { width: 4, borderRadius: 2 },
  evidenceCitation: { fontSize: 12, fontWeight: '700', paddingTop: 8, paddingHorizontal: 10, paddingBottom: 2 },
  evidenceQuote: { fontSize: 14, lineHeight: 21, fontStyle: 'italic', paddingHorizontal: 10, paddingBottom: 8 },

  // Urdu / RTL block
  urduBlock: { borderRadius: 10, borderWidth: 1, padding: 10, marginVertical: 2 },
  urduText: { fontSize: 15, lineHeight: 26, textAlign: 'right', writingDirection: 'rtl' },

  // Sources block
  sourcesBlock: { borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 8 },
  sourcesTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8, letterSpacing: 0.3 },
  sourceRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 4 },
  sourceDot: { fontSize: 16, fontWeight: '700', lineHeight: 20 },
  sourceText: { flex: 1, fontSize: 13, lineHeight: 18 },

  // Typing indicator
  typingContainer: { flexDirection: 'row', alignItems: 'flex-end' },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 14, borderRadius: 16, borderWidth: 1 },
  typingDot: { width: 7, height: 7, borderRadius: 3.5 },

  // Quick questions
  quickQuestionsContainer: { marginTop: 8, gap: 8 },
  quickQuestionsTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  quickQuestionButton: { padding: 12, borderRadius: 12, borderWidth: 1 },
  quickQuestionText: { fontSize: 14, fontWeight: '500' },

  // Features bar
  featuresBanner: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderTopWidth: 1 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  featureText: { fontSize: 11, fontWeight: '600' },

  // Input
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, alignItems: 'flex-end', gap: 10 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, borderWidth: 1 },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
