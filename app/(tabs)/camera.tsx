import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function CameraScreen() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Analysis Result</Text>
              <Text style={styles.plantName}>Monstera Deliciosa</Text>
              <Text style={styles.confidence}>Confidence: 95%</Text>
              <TouchableOpacity style={styles.retakeButton} onPress={() => setImage(null)}>
                <Text style={styles.retakeText}>Take Another Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
            <Ionicons name="camera" size={40} color="#2F9E44" />
            <Text style={styles.cameraText}>Take Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips for better identification:</Text>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#2F9E44" />
          <Text style={styles.tipText}>Ensure good lighting</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#2F9E44" />
          <Text style={styles.tipText}>Focus on leaves and flowers</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#2F9E44" />
          <Text style={styles.tipText}>Keep the camera steady</Text>
        </View>
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
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F9E44',
    marginBottom: 5,
  },
  confidence: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
  },
  retakeButton: {
    backgroundColor: '#2F9E44',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retakeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  tipsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666666',
  },
});