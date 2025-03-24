import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const [autoWatering, setAutoWatering] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Logout function
  const handleLogout = async () => {
    try {
      // Remove the token from AsyncStorage
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userId');
      alert("logout succefully")
      // Redirect to the Login Screen
      router.replace('/LoginScreen');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="water" size={24} color="#2F9E44" />
            <Text style={styles.settingText}>Automatic Watering</Text>
          </View>
          <Switch
            value={autoWatering}
            onValueChange={setAutoWatering}
            trackColor={{ false: '#767577', true: '#2F9E44' }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color="#2F9E44" />
            <Text style={styles.settingText}>Push Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#2F9E44' }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={24} color="#2F9E44" />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: '#2F9E44' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Management</Text>
        
        <TouchableOpacity style={styles.deviceItem}>
          <View style={styles.deviceInfo}>
            <Ionicons name="hardware-chip" size={24} color="#2F9E44" />
            <View style={styles.deviceDetails}>
              <Text style={styles.deviceName}>Smart Pot #1</Text>
              <Text style={styles.deviceStatus}>Connected</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.addDeviceButton}>
          <Ionicons name="add-circle" size={24} color="#2F9E44" />
          <Text style={styles.addDeviceText}>Add New Device</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuInfo}>
            <Ionicons name="person" size={24} color="#2F9E44" />
            <Text style={styles.menuText}>Profile Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuInfo}>
            <Ionicons name="shield-checkmark" size={24} color="#2F9E44" />
            <Text style={styles.menuText}>Privacy & Security</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuInfo}>
            <Ionicons name="help-circle" size={24} color="#2F9E44" />
            <Text style={styles.menuText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333333',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceDetails: {
    marginLeft: 15,
  },
  deviceName: {
    fontSize: 16,
    color: '#333333',
  },
  deviceStatus: {
    fontSize: 14,
    color: '#2F9E44',
  },
  addDeviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 12,
    borderWidth: 2,
    borderColor: '#2F9E44',
    borderRadius: 8,
  },
  addDeviceText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2F9E44',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333333',
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#FF4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});