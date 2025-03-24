import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, StatusBar, View } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in on app launch
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    };

    checkLoginStatus();
  }, []);

  // Redirect based on login status
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.replace('/LoginScreen'); // Redirect to Login Screen if not logged in
      } else {
        router.replace('/'); // Redirect to Home Screen if logged in
      }
    }
  }, [isLoading, isLoggedIn]);

  // Show a loading indicator while checking login status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render the app once the login status is determined
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="LoginScreen" options={{ title: 'Login' }} />
        <Stack.Screen name="SignUpScreen" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="plantScreen" options={{ title: "Plant Details" }} />
        {/* <Stack.Screen name="PlantDetails" /> */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
