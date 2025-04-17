import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  Switch,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';

interface Plant {
  _id: string;
  name: string;
  image: string;
  classification: {
    suggestions: Array<{
      id: string;
      name: string;
      probability: number;
      similar_images: Array<{ id: string; url: string; similarity: number }>;
      details: {
        description?: { value: string } | string;
        common_names?: string[];
        common_uses?: string;
        best_light_condition?: string;
        best_watering?: string;
        best_soil_type?: string;
        temperature_range?: string;
      };
    }>;
  };
  plantHealth?: {
    is_healthy: { probability: number; binary: boolean };
    disease?: {
      suggestions?: Array<{
        name: string;
        probability: number;
        details: {
          description?: string;
          treatment?: string | {
            biological?: string[];
            prevention?: string[];
            chemical?: string[];
          };
          cause?: string;
          url?: string;
        };
      }>;
    };
  };
}



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Dashboard() {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [activeTab, setActiveTab] = useState<'basicInfo' | 'plantHealth' | 'care'>('basicInfo');
  const router = useRouter();

  // Scheduling states
  const [isWaterEnabled, setIsWaterEnabled] = useState(false);
  const [isFertilizerEnabled, setIsFertilizerEnabled] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [notificationDate, setNotificationDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [repeatDays, setRepeatDays] = useState(1);
  const [useSmartSchedule, setUseSmartSchedule] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);


  const registerForPushNotificationsAsync = async () => {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('You need to enable notifications for this feature');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  const scheduleNotification = async (type: 'water' | 'fertilizer') => {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to ${type} your plant!`,
        body: `Don't forget to ${type} ${plant?.name}`,
        sound: 'default',
        data: { type },
      },
      trigger: {
        type: 'calendar', 
        hour: notificationDate.getHours(),
        minute: notificationDate.getMinutes(),
        repeats: repeatDays > 1,
      },
    });

    // Store the notification ID for cancellation if needed
    await AsyncStorage.setItem(
      `${type}_notification_id`, 
      notificationId
    );
    
    return notificationId;
  };

  const handleConfirmSchedule = async () => {
    try {
      // Cancel any existing notifications
      if (isWaterEnabled) {
        const waterId = await AsyncStorage.getItem('water_notification_id');
        if (waterId) await Notifications.cancelScheduledNotificationAsync(waterId);
      }
      if (isFertilizerEnabled) {
        const fertId = await AsyncStorage.getItem('fertilizer_notification_id');
        if (fertId) await Notifications.cancelScheduledNotificationAsync(fertId);
      }

      // Schedule new notifications
      if (isWaterEnabled) await scheduleNotification('water');
      if (isFertilizerEnabled) await scheduleNotification('fertilizer');

      Alert.alert(
        'Schedule Saved',
        `Will remind every ${repeatDays} day${repeatDays > 1 ? 's' : ''} at ${formatTime(
          notificationDate
        )}.`
      );
      setShowScheduleModal(false);
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', 'Failed to schedule notification');
    }
  };

  const renderSafe = (value: any) =>
    value == null ? 'N/A' : typeof value === 'object' ? JSON.stringify(value) : value;
  const formatPercentage = (value: any) =>
    typeof value === 'number' ? Math.round(value * 100) + '%' : renderSafe(value);
  const formatTime = (date: Date) =>
    `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

  useEffect(() => {
    loadPlantData();
  }, []);

  const loadPlantData = async () => {
    try {
      const plantData = await AsyncStorage.getItem('currentPlant');
      if (plantData) setPlant(JSON.parse(plantData));
      else Alert.alert('Error', 'No plant data found.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load plant data.');
    }
  };

  if (!plant) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.loadingText}>Loading plant data...</Text>
      </View>
    );
  }

  const suggestion = plant.classification.suggestions[0];

  const handleWaterToggle = (val: boolean) => {
    setIsWaterEnabled(val);
    if (val) setShowScheduleModal(true);
  };
  const handleFertilizerToggle = (val: boolean) => {
    setIsFertilizerEnabled(val);
    if (val) setShowScheduleModal(true);
  };

  // const handleConfirmSchedule = () => {
  //   Alert.alert(
  //     'Schedule Saved',
  //     `Will remind every ${repeatDays} day${repeatDays > 1 ? 's' : ''} at ${formatTime(
  //       notificationDate
  //     )}.`
  //   );
  //   setShowScheduleModal(false);
  // };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{plant.name}</Text>
      </View>
      <Image source={{ uri: plant.image }} style={styles.plantImage} />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['basicInfo', 'plantHealth', 'care'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
          >
            <Text style={styles.tabButtonText}>
              {tab === 'basicInfo'
                ? 'Basic Info'
                : tab === 'plantHealth'
                ? 'Plant Health'
                : 'Care'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Basic Info */}
      {activeTab === 'basicInfo' && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.cardContent}>
              {typeof suggestion.details.description === 'object'
                ? renderSafe((suggestion.details.description as any).value)
                : renderSafe(suggestion.details.description) || 'No description.'}
            </Text>
          </View>
          {suggestion.similar_images.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Similar Images</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {suggestion.similar_images.map((img) => (
                  <Image key={img.id} source={{ uri: img.url }} style={styles.similarImage} />
                ))}
              </ScrollView>
            </View>
          )}
          <View style={styles.section}>
            {[
              ['Temperature', suggestion.details.temperature_range],
              ['Sunlight', suggestion.details.best_light_condition],
              ['Soil', suggestion.details.best_soil_type],
              ['Watering', suggestion.details.best_watering],
            ].map(([label, val]) => (
              <View key={label} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {label === 'Temperature'
                    ? '🌡️ '
                    : label === 'Sunlight'
                    ? '🌞 '
                    : label === 'Soil'
                    ? '🌱 '
                    : '💧 '}
                  {label}
                </Text>
                <Text style={styles.cardContent}>{renderSafe(val) || 'N/A'}</Text>
              </View>
            ))}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Uses</Text>
            <Text style={styles.cardContent}>{renderSafe(suggestion.details.common_uses) || 'N/A'}</Text>
          </View>
        </>
      )}

      {/* Plant Health */}
      {activeTab === 'plantHealth' && (
        <View style={styles.healthContainer}>
          {plant.plantHealth ? (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Health</Text>
                <Text style={styles.cardContent}>
                  Healthy: {plant.plantHealth.is_healthy.binary ? 'Yes' : 'No'} (
                  {formatPercentage(plant.plantHealth.is_healthy.probability)})
                </Text>
              </View>
              {plant.plantHealth.disease?.suggestions?.length ? (
                plant.plantHealth.disease.suggestions.map((sug, i) => (
                  <View key={i} style={[styles.card, styles.suggestionCard]}>
                    <Text style={styles.cardTitle}>Suggestion #{i + 1}</Text>
                    {[
                      ['Name', sug.name],
                      ['Prob.', formatPercentage(sug.probability)],
                      ['Desc.', sug.details.description],
                      ['Treatment', sug.details.treatment],
                      ['Cause', sug.details.cause],
                      ['URL', sug.details.url],
                    ].map(([t, v]) => (
                      <Text key={t} style={styles.cardContent}>
                        {t}: {renderSafe(v)}
                      </Text>
                    ))}
                  </View>
                ))
              ) : (
                <Text style={styles.cardContent}>No disease detected.</Text>
              )}
            </>
          ) : (
            <Text style={styles.cardContent}>No health data.</Text>
          )}
        </View>
      )}

      {/* Care / Scheduling */}
      {activeTab === 'care' && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Schedule</Text>
            {[
              ['Water', isWaterEnabled, handleWaterToggle],
              ['Fertilizer', isFertilizerEnabled, handleFertilizerToggle],
            ].map(([label, val, fn]) => (
              <View key={label} style={styles.scheduleRow}>
                <Text style={styles.scheduleLabel}>{label}</Text>
                <Switch
                  value={val as boolean}
                  onValueChange={fn as any}
                  trackColor={{ false: '#767577', true: '#2F9E44' }}
                  thumbColor="#f4f3f4"
                />
              </View>
            ))}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Care Tools</Text>
            <Text style={styles.cardContent}>Water Calculator → ~17 ml per watering</Text>
            <Text style={styles.cardContent}>Light Meter → Good sunlight</Text>
          </View>
        </>
      )}

      {/* Schedule Modal */}
      <Modal
        visible={showScheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Schedule</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Pick time */}
            <View style={styles.modalField}>
              <Text style={styles.modalFieldLabel}>Time</Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={styles.pickerField}
              >
                <Text style={styles.modalFieldValue}>{formatTime(notificationDate)}</Text>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#000"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={notificationDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, d) => {
                    setShowTimePicker(false);
                    if (d) setNotificationDate(d);
                  }}
                />
              )}
            </View>

            {/* Pick repeat days */}
            <View style={styles.modalField}>
              <Text style={styles.modalFieldLabel}>Repeat (days)</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={repeatDays}
                  onValueChange={(v) => setRepeatDays(v)}
                  mode="dropdown"
                  style={styles.picker}
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                    <Picker.Item
                      key={day}
                      label={`${day} day${day > 1 ? 's' : ''}`}
                      value={day}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Smart switch */}
            <View
              style={[
                styles.modalField,
                { flexDirection: 'row', alignItems: 'center' },
              ]}
            >
              <Text style={[styles.modalFieldLabel, { flex: 1 }]}>
                Use smart schedule
              </Text>
              <Switch
                value={useSmartSchedule}
                onValueChange={setUseSmartSchedule}
                trackColor={{ false: '#767577', true: '#2F9E44' }}
                thumbColor="#f4f3f4"
              />
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmSchedule}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e9f5ee', padding: 20 },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9f5ee',
  },
  loadingText: { fontSize: 16, color: '#333' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F9E44',
    padding: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: { color: '#fff', fontSize: 16, marginLeft: 8 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#2F9E44' },
  plantImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2F9E44',
  },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#c8e6c9',
    borderRadius: 50,
    marginHorizontal: 10,
  },
  activeTab: { backgroundColor: '#2F9E44' },
  tabButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#2F9E44', marginBottom: 8 },
  cardContent: { fontSize: 16, color: '#333', lineHeight: 24 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#2F9E44', marginBottom: 12 },
  similarImage: { width: 110, height: 110, borderRadius: 12, marginRight: 10 },
  healthContainer: { alignItems: 'center', marginBottom: 20 },
  suggestionCard: { marginTop: 12 },
  marginTop: { marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  icon: { marginRight: 8 },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scheduleLabel: { fontSize: 16, color: '#333' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  modalField: { marginTop: 14 },
  modalFieldLabel: { fontSize: 16, color: '#666' },
  modalFieldValue: { fontSize: 16, color: '#333', marginTop: 4 },
  pickerWrapper: { backgroundColor: '#f0f0f0', borderRadius: 8, marginTop: 4 },
  picker: { height: 200, width: '100%' },
  pickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#2F9E44',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
