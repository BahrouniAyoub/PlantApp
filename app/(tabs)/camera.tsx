import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { assessPlantHealth, recognizePlant } from '../plantService'; // Import the plant recognition service
import { useRouter } from 'expo-router';

export default function CameraPage() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Function to pick an image from the camera
  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
      identifyPlant(imageUri); // Call the function to identify the plant after selecting the image
    }
  };

  // Function to identify the plant and add it to the database
  const identifyPlant = async (imageUri: string) => {
    setLoading(true);
    try {
      const recognitionResult = await recognizePlant(imageUri);
      const health = await assessPlantHealth(imageUri);
      console.log("Health Data", health);

      if (recognitionResult?.result?.classification?.suggestions) {
        const plantSuggestion = recognitionResult.result.classification.suggestions[0];

        if (plantSuggestion) {
          const newPlant = {
            _id: '',
            name: plantSuggestion.name,
            image: imageUri,
            is_plant: recognitionResult.result.is_plant,
            classification: recognitionResult.result.classification,
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
            body: JSON.stringify({ ...newPlant, userId: await AsyncStorage.getItem('userId') }),
          });

          if (!response.ok) throw new Error('Failed to add plant');

          const createdPlant = await response.json();
          
          await AsyncStorage.setItem('currentPlant', JSON.stringify(createdPlant));

          Alert.alert('Success', 'Plant added successfully!');
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error identifying plant:', error);
      Alert.alert('Error', 'Failed to identify or add the plant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plant Identification</Text>
        <Text style={styles.subtitle}>Take a photo to identify your plant</Text>
      </View>

      <View style={styles.cameraContainer}>
        {image ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.preview} />
            {loading ? (
              <ActivityIndicator size="large" color="#2F9E44" style={{ marginTop: 10 }} />
            ) : (
              <TouchableOpacity style={styles.retakeButton} onPress={() => setImage(null)}>
                <Text style={styles.retakeText}>Take Another Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
            <Ionicons name="camera" size={40} color="#2F9E44" />
            <Text style={styles.cameraText}>Take Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraButton: {
    width: '100%',
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2F9E44',
    borderStyle: 'dashed',
  },
  cameraText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2F9E44',
    fontWeight: '500',
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  retakeButton: {
    backgroundColor: '#2F9E44',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  retakeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
