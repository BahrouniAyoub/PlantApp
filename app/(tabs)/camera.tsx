import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { recognizePlant, getPlantDetail } from '../plantService'; // Updated import
import { AxiosError } from 'axios';

export default function CameraScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [plantDetails, setPlantDetails] = useState<any>(null); // State to store plant details

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

  // Function to identify the plant from the selected image
  const identifyPlant = async (imageUri: string) => {
    setLoading(true);

    try {
      // Step 1: Recognize plant using the Plant.id API
      const recognitionResult = await recognizePlant(imageUri);

      console.log('Recognition result:', recognitionResult);

      // Check if suggestions are available from the recognition result
      if (recognitionResult?.result?.classification?.suggestions) {
        const plantSuggestion = recognitionResult.result.classification.suggestions[0]; // Get the first suggestion

        if (plantSuggestion) {
          // Step 2: Fetch detailed plant information using the plant ID
          const plantDetailsResponse = await getPlantDetail(plantSuggestion.id);

          console.log('Plant details:', plantDetailsResponse);

          setPlantDetails(plantDetailsResponse?.data); // Store plant details in the state

          // Display a simple alert with the plant name
          Alert.alert('Plant Identified', plantSuggestion.name, [
            {
              text: 'OK',
              onPress: () => {
                setLoading(false);
                setImage(null); // Optionally reset the image after identification
              },
            },
          ]);
        }
      } else {
        setLoading(false);
        Alert.alert('Error', 'Could not identify the plant. Please try again.');
      }
    } catch (error: unknown) {
      setLoading(false);
      console.error('Error identifying plant:', error);

      if (error instanceof AxiosError) {
        Alert.alert("API Error", `Error: ${error.response?.status} - ${error.response?.data}`);
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    }
  };

  // Function to render plant details in the alert or directly in the UI
  const renderPlantDetails = () => {
    if (!plantDetails) return null;

    const plantInfo = plantDetails;
    const detailsMessage = `
      🌿 Name: ${plantInfo?.name || 'N/A'}
      🌎 Common Names: ${plantInfo?.common_names?.join(', ') || 'N/A'}
      🔍 Probability: ${plantInfo?.probability ? (plantInfo.probability * 100).toFixed(2) : 'N/A'}%
      🌱 Description: ${plantInfo?.description || 'No additional details available.'}
      🌞 Sunlight: ${plantInfo?.sunlight || 'N/A'}
      💧 Watering: ${plantInfo?.watering || 'N/A'}
      🌡️ Temperature Range: ${plantInfo?.temperature_range || 'N/A'}
      🍴 Edible Parts: ${plantInfo?.edible_parts || 'N/A'}
      🌱 Propagation Methods: ${plantInfo?.propagation_methods || 'N/A'}
      📊 Taxonomy: ${plantInfo?.taxonomy || 'N/A'}
      🔗 URL: ${plantInfo?.url || 'N/A'}
    `;
    return <Text>{detailsMessage}</Text>;
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

      {/* Render Plant Details if available */}
      <View style={styles.detailsContainer}>
        {renderPlantDetails()}
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
  detailsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 20,
    borderRadius: 8,
    marginHorizontal: 15,
  },
});
