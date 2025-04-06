import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';



export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // const { colors } = useTheme();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://192.168.0.141:5000/api/auth/login', { email, password });
      alert('Login Successful!');
      
      // Store both tokens
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      await AsyncStorage.setItem('userId', response.data.userId);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
  
      router.replace('/'); // Navigate to the home screen after login
    } catch (error) {
      console.log(error);
      alert('Login Failed: Invalid credentials');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* Logo or App Name */}
        <Image
          source={require('../assets/images/favicon.png')} // Add your logo in assets
          style={styles.logo}
        />
        <Text variant="headlineMedium" style={styles.title}>
          Welcome Back!
        </Text>

        {/* Email Input */}
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Input */}
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry
        />

        {/* Login Button */}
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Login
        </Button>

        {/* Sign Up Link */}
        <Text style={styles.signUpText}>
          Don't have an account?{' '}
          <Text
            style={{ color: "#2f9e44", fontWeight: 'bold' }}
            onPress={() => router.push('/SignUpScreen')}
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  innerContainer: {
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderColor: "#2f9e44",
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: "#2f9e44",
  },
  signUpText: {
    textAlign: 'center',
    marginTop: 20,
  },
});