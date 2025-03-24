import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recognizePlant } from '../plantService';

interface Plant {
  id: string; // Use string for MongoDB ObjectId
  name: string;
  image: string;
  health: string;
  lastWatered: string;
  common_names?: string[];
  care_details?: string;
  light_requirements: string;
  watering_frequency: string;
  temperature_range: string;
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
      };
    }>;
  };
}

export default function PlantsScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadPlants();
    }
  }, [currentUserId]);
  


  // Load the current user's ID from AsyncStorage
  const loadCurrentUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      console.log("userId:", userId);
      
      if (userId) {
        setCurrentUserId(userId);
      } else {
        Alert.alert('Error', 'User ID not found. Please log in.');
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  // Fetch plants from the backend API
  const loadPlants = async () => {
    try {
      if (!currentUserId) {
        console.error('Error: currentUserId is missing.');
        return;
      }

      // Get the authentication token
      const authToken = await AsyncStorage.getItem('accessToken');
      console.log("authToken",authToken);
      

      if (!authToken) {
        console.error('Error: Missing authToken');
        Alert.alert('Error', 'Authentication required. Please log in again.');
        return;
      }

      const url = `http://192.168.1.3:5000/plants/${currentUserId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch plants. Status: ${response.status}`);
      }

      const data = await response.json();
      setPlants(data);
    } catch (error) {
      console.error('Error fetching plants:', error);
      Alert.alert('Error', 'Failed to load plants. Please try again.');
    }
  };


 

  // Add a new plant by sending it to the backend
  const addNewPlant = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to use this feature.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) return;

      setIsProcessing(true);

      const recognizedPlant = await recognizePlant(result.assets[0].uri);

      if (recognizedPlant.result.is_plant.binary && recognizedPlant.result.classification.suggestions.length > 0) {
        const suggestions = recognizedPlant.result.classification.suggestions.map((suggestion) => ({
          name: suggestion.name,
          probability: (suggestion.probability * 100).toFixed(1) + '%',
        }));

        const newPlant: Plant = {
          id: '', 
          name: suggestions[0].name,
          image: result.assets[0].uri,
          health: 'Excellent',
          lastWatered: 'Just now',
          common_names: suggestions.map((s) => s.name),
          light_requirements: 'N/A',
          watering_frequency: 'N/A',
          temperature_range: 'N/A',
          is_plant: recognizedPlant.result.is_plant,
          classification: recognizedPlant.result.classification,
        };


        // Send the new plant to the backend
        const response = await fetch('http://192.168.1.3:5000/plants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ ...newPlant, userId: currentUserId }),
        });

        if (!response.ok) {
          throw new Error('Failed to add plant');
        }

        const createdPlant = await response.json();
        
        setPlants((prevPlants) => [...prevPlants, createdPlant]);

        Alert.alert(
          'Plant Recognized!',
          `Top Suggestion: ${suggestions[0].name}\nProbability: ${suggestions[0].probability}`
        );
      } else {
        Alert.alert('No Plant Detected', 'Please try again with a clearer image.');
      }
    } catch (error) {
      console.error('Error in addNewPlant:', error);
      Alert.alert('Error', 'Failed to capture or process the image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlantPress = (plant: Plant) => {
    router.push(`/dashboard?plant=${encodeURIComponent(JSON.stringify(plant))}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Plants</Text>
        <TouchableOpacity
          style={[styles.addButton, isProcessing && styles.addButtonDisabled]}
          onPress={addNewPlant}
          disabled={isProcessing}
        >
          <Ionicons name={isProcessing ? 'hourglass-outline' : 'add'} size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      {plants.map((plant) => (
        <TouchableOpacity key={plant._id} style={styles.plantCard} onPress={() => handlePlantPress(plant)}>
          <Image source={{ uri: plant.image }} style={styles.plantImage} />
          <View style={styles.plantInfo}>
            <Text style={styles.plantName}>{plant.name}</Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.healthIndicator,
                  {
                    backgroundColor: plant.health === 'Excellent' ? '#2F9E44' :
                      plant.health === 'Good' ? '#FFA500' : '#FF4444',
                  },
                ]}
              />
              <Text style={styles.healthText}>{plant.health}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 12,
  },
  addButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  plantCard: {
    backgroundColor: '#ffffff',
    margin: 10,
    marginHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plantImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  plantInfo: {
    flex: 1,
    marginLeft: 15,
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  healthText: {
    fontSize: 14,
    color: '#666666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  healthIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});