// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { MessageCircle, Send, Sparkles, BookOpen, Heart } from 'lucide-react-native';
// import { useTheme } from '../../contexts/ThemeContext';

// interface Message {
//   id: number;
//   text: string;
//   isUser: boolean;
// }

// export default function ChatbotScreen() {
//   const { colors } = useTheme();
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: 1,
//       text: "السلام عليكم!",
//       isUser: false,
//     },
//   ]);
//   const [inputText, setInputText] = useState('');

//   const handleSend = () => {
//     if (inputText.trim() === '') return;

//     const userMessage: Message = {
//       id: messages.length + 1,
//       text: inputText,
//       isUser: true,
//     };

//     setMessages([...messages, userMessage]);
//     setInputText('');

//     setTimeout(() => {
//       const aiResponse: Message = {
//         id: messages.length + 2,
//         text: "Thank you for your question! This is a demo response. The full AI chatbot will be available soon with features including Quran references, Hadith explanations, and Islamic guidance.",
//         isUser: false,
//       };
//       setMessages((prev) => [...prev, aiResponse]);
//     }, 1000);
//   };

//   const quickQuestions = [
//     "What are the pillars of Islam?",
//     "Explain Wudu steps",
//     "Times for daily prayers",
//     "Importance of Ramadan",
//   ];

//   return (
//     <KeyboardAvoidingView 
//       style={[styles.container, { backgroundColor: colors.background }]}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      
//       <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
//         <View style={styles.headerContent}>
//           <View style={[styles.aiIconContainer, { backgroundColor: colors.primary + '20', borderColor: colors.border }]}>
//             <Sparkles size={28} color={colors.primary} />
//           </View>
//           <View>
//             <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Islamic AI Assistant</Text>
//             <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Ask me anything about Islam</Text>
//           </View>
//         </View>
//       </View>

//       <ScrollView 
//         style={styles.messagesContainer}
//         contentContainerStyle={styles.messagesContent}>
        
//         {messages.map((message) => (
//           <View
//             key={message.id}
//             style={[
//               styles.messageBubble,
//               message.isUser ? styles.userBubble : styles.aiBubble,
//             ]}>
//             {!message.isUser && (
//               <View style={[styles.aiAvatar, { backgroundColor: colors.primary + '20', borderColor: colors.border }]}>
//                 <MessageCircle size={16} color={colors.primary} />
//               </View>
//             )}
//             <View
//               style={[
//                 styles.messageContent,
//                 message.isUser ? 
//                   { backgroundColor: colors.primary } : 
//                   { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 },
//               ]}>
//               <Text
//                 style={[
//                   styles.messageText,
//                   { color: message.isUser ? '#ffffff' : colors.textPrimary },
//                 ]}>
//                 {message.text}
//               </Text>
//             </View>
//           </View>
//         ))}

//         {messages.length === 1 && (
//           <View style={styles.quickQuestionsContainer}>
//             <Text style={[styles.quickQuestionsTitle, { color: colors.textSecondary }]}>Quick Questions:</Text>
//             {quickQuestions.map((question, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[styles.quickQuestionButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
//                 onPress={() => setInputText(question)}>
//                 <Text style={[styles.quickQuestionText, { color: colors.primary }]}>{question}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
//       </ScrollView>

//       <View style={[styles.featuresBanner, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
//         <View style={styles.featureItem}>
//           <BookOpen size={16} color={colors.primary} />
//           <Text style={[styles.featureText, { color: colors.primary }]}>Quran & Hadith</Text>
//         </View>
//         <View style={styles.featureItem}>
//           <Heart size={16} color={colors.primary} />
//           <Text style={[styles.featureText, { color: colors.primary }]}>Islamic Guidance</Text>
//         </View>
//         <View style={styles.featureItem}>
//           <Sparkles size={16} color={colors.primary} />
//           <Text style={[styles.featureText, { color: colors.primary }]}>AI Powered</Text>
//         </View>
//       </View>

//       <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
//         <TextInput
//           style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
//           placeholder="Ask about Islam..."
//           placeholderTextColor={colors.textSecondary}
//           value={inputText}
//           onChangeText={setInputText}
//           multiline
//           maxLength={500}
//         />
//         <TouchableOpacity
//           style={[styles.sendButton, { backgroundColor: colors.primary }]}
//           onPress={handleSend}
//           disabled={inputText.trim() === ''}>
//           <Send size={20} color="#ffffff" />
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     paddingTop: 60,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   aiIconContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//     borderWidth: 1,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     marginTop: 2,
//   },
//   messagesContainer: {
//     flex: 1,
//   },
//   messagesContent: {
//     padding: 20,
//   },
//   messageBubble: {
//     flexDirection: 'row',
//     marginBottom: 16,
//     alignItems: 'flex-end',
//   },
//   userBubble: {
//     justifyContent: 'flex-end',
//   },
//   aiBubble: {
//     justifyContent: 'flex-start',
//   },
//   aiAvatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 8,
//     borderWidth: 1,
//   },
//   messageContent: {
//     maxWidth: '75%',
//     padding: 12,
//     borderRadius: 16,
//   },
//   messageText: {
//     fontSize: 15,
//     lineHeight: 20,
//   },
//   quickQuestionsContainer: {
//     marginTop: 20,
//   },
//   quickQuestionsTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   quickQuestionButton: {
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 8,
//     borderWidth: 1,
//   },
//   quickQuestionText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   featuresBanner: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 12,
//     borderTopWidth: 1,
//   },
//   featureItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   featureText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     padding: 16,
//     borderTopWidth: 1,
//     alignItems: 'flex-end',
//   },
//   input: {
//     flex: 1,
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     fontSize: 15,
//     maxHeight: 100,
//     marginRight: 8,
//     borderWidth: 1,
//   },
//   sendButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

// version 2

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ImageBackground, // 👈 added
} from 'react-native';
import { MessageCircle, Send, Sparkles, BookOpen, Heart } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

export default function ChatbotScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "السلام عليكم!", isUser: false },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim() === '') return;
    const userMessage: Message = { id: messages.length + 1, text: inputText, isUser: true };
    setMessages([...messages, userMessage]);
    setInputText('');
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: "Thank you for your question! This is a demo response. The full AI chatbot will be available soon with features including Quran references, Hadith explanations, and Islamic guidance.",
        isUser: false,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const quickQuestions = [
    "What are the pillars of Islam?",
    "Explain Wudu steps",
    "Times for daily prayers",
    "Importance of Ramadan",
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 🌙 Background Image Layer */}
      <ImageBackground
        source={require('../../assets/images/chatbot-img.png')}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.08 }} // very soft, subtle
        resizeMode="cover"
      >
        {/* Everything else sits above */}
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <View style={[styles.aiIconContainer, { backgroundColor: colors.primary + '20', borderColor: colors.border }]}>
              <Sparkles size={28} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Islamic AI Assistant</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Ask me anything about Islam</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}
            >
              {!message.isUser && (
                <View
                  style={[styles.aiAvatar, { backgroundColor: colors.primary + '20', borderColor: colors.border }]}
                >
                  <MessageCircle size={16} color={colors.primary} />
                </View>
              )}
              <View
                style={[
                  styles.messageContent,
                  message.isUser
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: message.isUser ? '#ffffff' : colors.textPrimary },
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}

          {messages.length === 1 && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={[styles.quickQuestionsTitle, { color: colors.textSecondary }]}>Quick Questions:</Text>
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickQuestionButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => setInputText(question)}
                >
                  <Text style={[styles.quickQuestionText, { color: colors.primary }]}>{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[styles.featuresBanner, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
          <View style={styles.featureItem}>
            <BookOpen size={16} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.primary }]}>Quran & Hadith</Text>
          </View>
          <View style={styles.featureItem}>
            <Heart size={16} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.primary }]}>Islamic Guidance</Text>
          </View>
          <View style={styles.featureItem}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.primary }]}>AI Powered</Text>
          </View>
        </View>

        <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border },
            ]}
            placeholder="Ask about Islam..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={handleSend}
            disabled={inputText.trim() === ''}
          >
            <Send size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 }, // 👈 ensures background covers full screen
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  aiIconContainer: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 20 },
  messageBubble: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1 },
  messageContent: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  messageText: { fontSize: 15, lineHeight: 20 },
  quickQuestionsContainer: { marginTop: 20 },
  quickQuestionsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  quickQuestionButton: { padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
  quickQuestionText: { fontSize: 14, fontWeight: '500' },
  featuresBanner: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featureText: { fontSize: 12, fontWeight: '600' },
  inputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, alignItems: 'flex-end' },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, marginRight: 8, borderWidth: 1 },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
