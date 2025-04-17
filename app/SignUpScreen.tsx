import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import axios from 'axios';
import { router } from 'expo-router';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`http://192.168.1.10:5000/api/auth/signup`, {
        name,
        email,
        password,
      });
      console.log('SignUp response:', response.data);
      alert('Sign Up Successful!');
      router.replace('/LoginScreen'); 
    } catch (error) {
      console.error('SignUp error:', error);
      alert('Sign Up Failed: Please try again');
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
        <Text variant="headlineMedium" style={styles.title}>
          Create an Account
        </Text>

        {/* name Input */}
        <TextInput
          label="name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
        />

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

        {/* Sign Up Button */}
        <Button
          mode="contained"
          onPress={handleSignUp}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Sign Up
        </Button>

        {/* Login Link */}
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text
            style={{ color: "#2f9e44", fontWeight: 'bold' }}
            onPress={() => router.push('/LoginScreen')}
          >
            Login
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
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: "#2f9e44"
  },
  loginText: {
    textAlign: 'center',
    marginTop: 20,
  },
});