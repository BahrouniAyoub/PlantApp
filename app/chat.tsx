import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

const SAMPLE_RESPONSES = [
  "Based on the symptoms you described, your plant might be experiencing root rot. Try reducing watering frequency and ensure proper drainage.",
  "For optimal growth, place your Monstera in bright, indirect light and water when the top 2-3 inches of soil feels dry.",
  "Yellow leaves often indicate overwatering. Let the soil dry out between waterings and ensure good air circulation.",
  "The best time to repot your plant is during the growing season (spring/summer). Choose a pot 1-2 inches larger than the current one.",
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your plant care assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Function to handle sending a message
  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Create a new message from the user
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    try {
      // Make an API call to the chatbot for plant care advice
      const response = await axios.post(
        'https://plant.id/api/v3/identification/AgLgoPJZwbxCXo8/conversation', // Replace with actual access token
        {
          question: inputText.trim(),
          temperature: 0.5,  // You can adjust this for more randomness
          stream: false,     // Set to true for streaming responses
        },
        {
          headers: {
            Authorization: `Bearer VTSXEXvv5uzUkTJULkgDFNmzDNJ5q2rlWJVzyXbMDa2FwaT0w7`, // Replace with your API Key
            'Content-Type': 'application/json',
          },
        }
      );

      // Handle the chatbot's response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.answer || 'I could not get an answer right now. Try again!',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error during API call:', error);

      // Fallback to sample response if error occurs
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)],
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plant Care Assistant</Text>
        <Text style={styles.subtitle}>Get expert advice for your plants</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.messageWrapper, message.sender === 'user' ? styles.userMessageWrapper : null]}>
            {message.sender === 'ai' && (
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411' }}
                style={styles.aiAvatar}
              />
            )}
            <View style={[styles.message, message.sender === 'user' ? styles.userMessage : styles.aiMessage]}>
              <Text style={[styles.messageText, message.sender === 'user' ? styles.userMessageText : null]}>
                {message.text}
              </Text>
              <Text style={[styles.timestamp, message.sender === 'user' ? styles.userTimestamp : null]}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about plant care..."
          placeholderTextColor="#666"
          multiline
        />
        <Pressable
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}>
          <Ionicons
            name="send"
            size={24}
            color={inputText.trim() ? '#fff' : '#999'}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#2F9E44',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#2F9E44',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    fontSize: 16,
    maxHeight: 120,
    marginRight: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2F9E44',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#eee',
  },
});
