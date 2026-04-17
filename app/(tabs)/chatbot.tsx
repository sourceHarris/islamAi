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
import { MessageCircle, Send, Sparkles, BookOpen, Heart, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

// ── User Identity (loaded from AsyncStorage session) ──────────────────────────
// Falls back to 'anonymous' if not logged in
let _cachedUserId = 'anonymous';

// ── Backend URL ────────────────────────────────────────────────────────────────
// Physical phone on same WiFi → use PC's LAN IP
// Android emulator           → use http://10.0.2.2:8001
// Expo Web (browser on PC)   → use http://localhost:8001
const API_BASE = 'http://192.168.1.8:8001';

// Calls the Hidayah FastAPI backend which runs
// Emotion Detection → FAISS RAG → Groq LLM (Llama 3)
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

// Animated typing indicator
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

export default function ChatbotScreen() {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "السلام عليكم ورحمة الله وبركاته!\n\nI'm your Islamic AI Assistant. Ask me about the Quran, Hadith, Islamic history, prayer, and more. I'm here to help you on your spiritual journey. 🌙\n\n(I will reply in English, with an Urdu translation added below)", isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');

  // Load the logged-in user from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('hidayah_user').then((stored) => {
      if (stored) {
        const user = JSON.parse(stored);
        _cachedUserId = user.registration_number ?? 'anonymous';
        setUserName(user.name ?? '');
      }
    });
  }, []);

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userText = inputText.trim();
    const userMessage: Message = { id: messages.length + 1, text: userText, isUser: true };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await callHidayahBackend(userText);

      // Build reply text — include sources if available
      let replyText = result.reply;
      if (result.sources && result.sources.length > 0) {
        const sourceLines = result.sources
          .map((s) => `• ${s.citation}`)
          .join('\n');
        replyText += `\n\n📚 Sources:\n${sourceLines}`;
      }

      setMessages(prev => [...prev, { id: Date.now(), text: replyText, isUser: false }]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        { id: prev.length + 1, text: `Sorry, I encountered an error: ${error.message}\n\nMake sure the Hidayah backend is running on port 8000.`, isUser: false },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
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
                {'Powered by Groq • Llama 3 (via Backend RAG)'}
              </Text>
            </View>
          </View>
        </View>

        {/* ⚠️ Disclaimer banner */}
        <View style={[styles.disclaimer, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}>
          <AlertTriangle size={14} color={colors.primary} />
          <Text style={[styles.disclaimerText, { color: colors.primary }]}>
            AI answers are for guidance only — always verify important matters with a qualified scholar.
          </Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>

          {messages.map((message) => (
            <View
              key={message.id}
              style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}>
              {!message.isUser && (
                <View style={[styles.aiAvatar, { backgroundColor: colors.primary + '20', borderColor: colors.border }]}>
                  <MessageCircle size={16} color={colors.primary} />
                </View>
              )}
              <View
                style={[
                  styles.messageContent,
                  message.isUser
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 },
                ]}>
                <Text style={[styles.messageText, { color: message.isUser ? '#ffffff' : colors.textPrimary }]}>
                  {message.text}
                </Text>
              </View>
            </View>
          ))}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator color={colors.primary} />}

          {/* Quick questions (shown at start) */}
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
            placeholder="Ask about Islam..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
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
  messagesContent: { padding: 16, paddingBottom: 8, gap: 12 },
  messageBubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  messageContent: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  messageText: { fontSize: 15, lineHeight: 22 },

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
