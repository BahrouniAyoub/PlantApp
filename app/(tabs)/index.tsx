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
  _id: string; // Use string for MongoDB ObjectId
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
        language: String;
        entity_id: String;
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


      if (!authToken) {
        console.error('Error: Missing authToken');
        Alert.alert('Error', 'Authentication required. Please log in again.');
        return;
      }

      const url = `http://192.168.0.141:5000/plants/${currentUserId}`;

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

      // 1. Recognize the plant using the Create Identification Endpoint
      const recognizedPlant = await recognizePlant(result.assets[0].uri);
      console.log('🚀 Plant recognition description:', recognizedPlant.result.classification.suggestions[0].details.description);


      if (recognizedPlant.result.is_plant.binary && recognizedPlant.result.classification.suggestions.length > 0) {
        const suggestions = recognizedPlant.result.classification.suggestions.map((suggestion) => ({
          name: suggestion.name,
          details: {
            common_names: suggestion.details.common_names,
            description: suggestion.details.description,
            common_uses: suggestion.details.common_uses,
            best_light_condition: suggestion.details.best_light_condition,
            best_watering: suggestion.details.best_watering,
            best_soil_type: suggestion.details.best_soil_type,
          }
        }));

        const topSuggestion = suggestions[0];


        // 3. Alert with the data
        Alert.alert(
          'Plant Recognized!',
          `Top Suggestion: ${topSuggestion.name}\nDescription: ${topSuggestion.details.description?.value || 'No description available.'}\nCommon Names: ${topSuggestion.details.common_names?.join(', ') || 'No common names available.'}
          \nBest Light Condition: ${topSuggestion.details.best_light_condition || 'No information available.'}\nBest Watering: ${topSuggestion.details.best_watering || 'No information available.'}\nBest Soil Type: ${topSuggestion.details.best_soil_type || 'No information available.'}`,
        );

        // Optionally, you can store the plant data in your state and send it to the backend
        const newPlant: Plant = {
          _id: '',
          name: topSuggestion.name,
          image: result.assets[0].uri,
          is_plant: recognizedPlant.result.is_plant,
          classification: recognizedPlant.result.classification,
        };

        // Send the new plant to the backend
        const response = await fetch('http://192.168.0.141:5000/plants', {
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

  const fetchPlants = async () => {
    try {
      const response = await fetch('http://192.168.0.141:5000/plants', {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plants');
      }

      const plants = await response.json();
      setPlants(plants);
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);


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
        console.error('Error: Missing authToken');
        Alert.alert('Error', 'Authentication required. Please log in again.');
        return;
      }

      const url = `http://192.168.0.141:5000/plants/${plantId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete plant. Status: ${response.status}`);
      }

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
  deleteButton: {
    backgroundColor: '#FF5252',
    borderRadius: 50,
    padding: 8,
  },
});