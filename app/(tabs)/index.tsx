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
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { assessPlantHealth, recognizePlant } from '../plantService';

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
      details: {
        common_names?: string[];
        description?: { value: string };
        best_light_condition?: string;
        best_watering?: string;
        best_soil_type?: string;
        toxicity?: string;
      };
    }>;
  };
  plantHealth?: {
    is_healthy: {
      probability: number;
      binary: boolean;
    };
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

export default function PlantsScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) loadPlants();
  }, [currentUserId]);

  const loadCurrentUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) setCurrentUserId(userId);
      else Alert.alert('Error', 'User ID not found. Please log in.');
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadPlants = async () => {
    try {
      if (!currentUserId) return;

      const authToken = await AsyncStorage.getItem('accessToken');
      if (!authToken) {
        Alert.alert('Error', 'Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`http://192.168.1.10:5000/plants/${currentUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch plants. Status: ${response.status}`);

      const data = await response.json();
      setPlants(data);
    } catch (error) {
      console.error('Error fetching plants:', error);
      Alert.alert('Error', 'Failed to load plants. Please try again.');
    }
  };

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

      // Recognize plant and assess its health
      const recognizedPlant = await recognizePlant(result.assets[0].uri);
      const health = await assessPlantHealth(result.assets[0].uri);
      console.log("health Data", health);

      // Check if the captured image is indeed a plant and if recognition data is valid
      if (
        recognizedPlant.result.is_plant.binary &&
        recognizedPlant.result.classification.suggestions.length > 0
      ) {
        const topSuggestion = recognizedPlant.result.classification.suggestions[0];

        // Construct the plant object including the health data
        const newPlant = {
          _id: '',
          name: topSuggestion.name,
          image: result.assets[0].uri,
          is_plant: recognizedPlant.result.is_plant,
          classification: recognizedPlant.result.classification,
          plantHealth: {
            is_healthy: health.result.is_healthy,
            disease: health.result.disease,
          },
        };

        const response = await fetch('http://192.168.1.10:5000/plants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          },
          // Include userId along with the newPlant payload
          body: JSON.stringify({ ...newPlant, userId: currentUserId }),
        });

        if (!response.ok) throw new Error('Failed to add plant');

        const createdPlant = await response.json();

        // Save the newly created plant (with health data) as the current plant
        await AsyncStorage.setItem('currentPlant', JSON.stringify(createdPlant));

        // Optionally update your list
        setPlants((prevPlants) => [...prevPlants, createdPlant]);

        // Navigate to Dashboard to display the plant and its health data
        router.push('/dashboard');
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


  const handlePlantPress = async (plant: Plant) => {
    try {
      await AsyncStorage.setItem('currentPlant', JSON.stringify(plant));
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving plant data:', error);
    }
  };

  const handleDeletePlant = async (plantId: string) => {
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      if (!authToken) {
        Alert.alert('Error', 'Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`http://192.168.1.10:5000/plants/${plantId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to delete plant. Status: ${response.status}`);

      setPlants((prevPlants) => prevPlants.filter((plant) => plant._id !== plantId));
    } catch (error) {
      console.error('Error deleting plant:', error);
      Alert.alert('Error', 'Failed to delete plant. Please try again.');
    }
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
        <View key={plant._id} style={styles.plantCard}>
          <TouchableOpacity style={styles.plantInfo} onPress={() => handlePlantPress(plant)}>
            <Image source={{ uri: plant.image }} style={styles.plantImage} />
            <View>
              <Text style={styles.plantName}>{plant.name}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeletePlant(plant._id)}
          >
            <Ionicons name="trash-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    borderRadius: 8,
    marginRight: 15,
  },
  plantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 8,
  },
});

