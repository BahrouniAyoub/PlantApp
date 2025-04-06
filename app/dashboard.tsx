import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Import useRouter for navigation

interface Plant {
  _id: string;
  name: string;
  image: string;
  is_plant: {
    probability: number;
    binary: boolean;
    threshold: number;
  };
  classification: {
    suggestions: Array<{
      id: string;
      name: string;
      probability: number;
      similar_images: Array<{
        id: string;
        url: string;
        license_name?: string;
        license_url?: string;
        citation?: string;
        similarity: number;
        url_small: string;
      }>;
      details: {
        language: string;
        entity_id: string;
        common_names?: string[];
        description?: {
          value: string;
          citation?: string;
          license_name?: string;
          license_url?: string;
        };
        common_uses?: string;
        best_light_condition?: string;
        best_watering?: string;
        best_soil_type?: string;
      };
    }>;
  };
}

const mockData = {
  moisture: 65,
  temperature: 24,
  light: 80,
};

export default function Dashboard() {
  const [plant, setPlant] = useState<Plant | null>(null);
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    loadPlantData();
  }, []);

  const loadPlantData = async () => {
    try {
      const plantData = await AsyncStorage.getItem('currentPlant');
      if (plantData) {
        setPlant(JSON.parse(plantData));
      } else {
        Alert.alert('Error', 'No plant data found.');
      }
    } catch (error) {
      console.error('Error loading plant data:', error);
      Alert.alert('Error', 'Failed to load plant data.');
    }
  };

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading plant data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Plant Name */}
      <View style={styles.header}>
        <Text style={styles.title}>{plant.name}</Text>
      </View>

      {/* Plant Image */}
      <Image source={{ uri: plant.image }} style={styles.plantImage} />

      {/* Plant Data Cards */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Description</Text>
        <Text style={styles.cardText}>
          {plant.classification.suggestions[0]?.details.description?.value || 'No description available.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Common Names</Text>
        <Text style={styles.cardText}>
          {plant.classification.suggestions[0]?.details.common_names?.join(', ') || 'No common names available.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Best Light Condition</Text>
        <Text style={styles.cardText}>
          {plant.classification.suggestions[0]?.details.best_light_condition || 'No information available.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Best Watering</Text>
        <Text style={styles.cardText}>
          {plant.classification.suggestions[0]?.details.best_watering || 'No information available.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Best Soil Type</Text>
        <Text style={styles.cardText}>
          {plant.classification.suggestions[0]?.details.best_soil_type || 'No information available.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Light background for better contrast
    padding: 20,
    marginTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F9E44', // Green background for the back button
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  plantImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2F9E44', // Green border for the image
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F9E44', // Green color for card titles
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20, // Better readability
  },
});