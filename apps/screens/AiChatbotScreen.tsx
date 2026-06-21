import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useAppContext } from '../shared/AppContext';
import { useDimensions } from '../hooks/useDimensions';
import { ArrowLeft, Send, Sparkles, User, MessageCircle } from 'lucide-react-native';

export const AiChatbotScreen: React.FC = () => {
  const { 
    isDarkMode, chatLogs, aiSearching, sendChatMessage, navigateTo 
  } = useAppContext();

  const { contentWidth } = useDimensions();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const colors = isDarkMode ? {
    background: '#0C0717',
    surface: '#160F2B',
    surfaceVariant: '#22183D',
    border: '#3F2D6B',
    primary: '#C78DFF',
    secondary: '#8E24AA',
    text: '#FFFFFF',
    subText: '#B0A2C9',
  } : {
    background: '#F6F2FF',
    surface: '#FFFFFF',
    surfaceVariant: '#EDE5FC',
    border: '#D1C4E9',
    primary: '#7C4DFF',
    secondary: '#6200EA',
    text: '#120024',
    subText: '#6D5C80',
  };

  useEffect(() => {
    // Auto scroll to bottom when chat logs update
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chatLogs, aiSearching]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const msg = inputText.trim();
    setInputText('');
    await sendChatMessage(msg);
  };

  const handleQuickQuestion = async (query: string) => {
    await sendChatMessage(query);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={[styles.container, { maxWidth: contentWidth }]}>
        
        {/* HEADER BAR */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigateTo('HOME')} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Home</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Offer Lanka AI Assistant</Text>
          </View>
        </View>

        {/* CHAT LOGS LIST */}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          style={styles.chatScroll}
        >
          {chatLogs.map((log, index) => {
            const isAI = log.author === 'AI';
            return (
              <View 
                key={index} 
                style={[
                  styles.msgWrapper, 
                  isAI ? styles.msgAiWrapper : styles.msgUserWrapper
                ]}
              >
                {isAI ? (
                  <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                    <Sparkles size={12} color="#FFF" />
                  </View>
                ) : null}

                <View 
                  style={[
                    styles.msgBubble, 
                    isAI 
                      ? { backgroundColor: colors.surface, borderColor: colors.border } 
                      : { backgroundColor: colors.primary }
                  ]}
                >
                  <Text style={[
                    styles.msgText, 
                    { color: isAI ? colors.text : colors.background }
                  ]}>
                    {log.message}
                  </Text>
                </View>

                {!isAI ? (
                  <View style={[styles.avatar, { backgroundColor: colors.surfaceVariant }]}>
                    <User size={12} color={colors.primary} />
                  </View>
                ) : null}
              </View>
            );
          })}

          {/* AI SEARCHING INDICATOR */}
          {aiSearching && (
            <View style={[styles.msgWrapper, styles.msgAiWrapper]}>
              <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                <Sparkles size={12} color="#FFF" />
              </View>
              <View style={[styles.msgBubble, styles.loadingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.subText }]}>Analyzing Sri Lankan store catalogs...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* QUICK SUGGESTIONS BUBBLES */}
        {chatLogs.length <= 1 && !aiSearching && (
          <View style={styles.suggestionsWrapper}>
            <Text style={[styles.suggestTitle, { color: colors.subText }]}>Ask me questions like:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestRow}>
              {[
                "Show best supermarket discounts",
                "Find Keells credit card deals",
                "Are there fashion coupons for Odel?",
                "Which electronics stores have active sales?",
              ].map((query, idx) => (
                <TouchableOpacity 
                  key={idx}
                  style={[styles.suggestCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
                  onPress={() => handleQuickQuestion(query)}
                >
                  <Text style={[styles.suggestText, { color: colors.text }]}>{query}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* INPUT FOOTER */}
        <View style={[styles.inputFooter, { borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.inputBox, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Ask AI assistant about coupons & savings..."
            placeholderTextColor={colors.subText}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={16} color={colors.background} />
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    padding: 16,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  chatScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
    gap: 12,
  },
  msgWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '85%',
  },
  msgAiWrapper: {
    alignSelf: 'flex-start',
  },
  msgUserWrapper: {
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  msgBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 0.5,
  },
  msgText: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 10.5,
  },
  suggestionsWrapper: {
    marginTop: 10,
    gap: 6,
  },
  suggestTitle: {
    fontSize: 9.5,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  suggestRow: {
    gap: 6,
    paddingVertical: 4,
  },
  suggestCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  suggestText: {
    fontSize: 10.5,
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    gap: 8,
    borderTopWidth: 1,
    marginTop: 10,
  },
  inputBox: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 12,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
