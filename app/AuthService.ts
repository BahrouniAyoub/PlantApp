import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_TOKEN_KEY = 'userToken';

export const storeUserToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(USER_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing user token:', error);
  }
};

export const getUserToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
};

export const removeUserToken = async () => {
  try {
    await AsyncStorage.removeItem(USER_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing user token:', error);
  }
};