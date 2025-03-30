import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

// Mock Data
const mockData = {
  moisture: 65,
  temperature: 24,
  light: 80,
};

interface Plant {
  _id: string;
  name: string;
  image: string;
  health: string;
  lastWatered: string;
  light_requirements: string;
  watering_frequency: string;
  temperature_range: string;
  edible_parts?: string[];
  propagation_methods?: string[];
  watering?: string;
}

export default function Dashboard() {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadPlantData = async () => {
      try {
        const storedPlant = await AsyncStorage.getItem('currentPlant');
        if (storedPlant) {
          setPlant(JSON.parse(storedPlant));
        }
      } catch (error) {
        console.error('Error loading plant data:', error);
      }
    };

    loadPlantData();
  }, []);

  console.log('Plant :', plant);
  

  const PLANT_ID_API_KEY = 'H2PEHTBnlBy9TPy53lRfozUyBjLBsUQQlZEIGXWRBqx4A0Dr23';

  // useEffect(() => {
  //   const fetchPlantDetails = async (plantId: string) => {
  //     try {
        
  //       setLoading(true);
  //       const response = await fetch(`https://plant.id/api/v3/plant_details/${plantId}?details=common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,edible_parts,watering,propagation_methods`, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Api-Key': PLANT_ID_API_KEY,
  //         },
  //       });

  //       const data = await response.json();
  //       console.log(data);

  //       if (data.plants && data.plants.length > 0) {
  //         const plantDetails = data.plants[0];
  //         const updatedPlant = {
  //           ...plant,
  //           edible_parts: plantDetails.edible_parts || [],
  //           propagation_methods: plantDetails.propagation_methods || [],
  //           watering: plantDetails.watering || 'Not available',
  //         };

  //         setPlant(updatedPlant);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching plant details:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (plant && plant._id) {
  //     fetchPlantDetails(plant._id);
  //   }
  // }, [plant]);

  const handleChatPress = () => {
    // console.log(plant._id);
    
    if (plant && plant._id) {
      // Navigate to the Chat page and pass the plant ID as query parameter
      router.push(`/chat`);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!plant) {
    return <Text>No plant data found</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Garden</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="water-outline" size={24} color="#2F9E44" />
          <Text style={styles.statValue}>{mockData.moisture}%</Text>
          <Text style={styles.statLabel}>Soil Moisture</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="thermometer-outline" size={24} color="#2F9E44" />
          <Text style={styles.statValue}>{mockData.temperature}°C</Text>
          <Text style={styles.statLabel}>Temperature</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="sunny-outline" size={24} color="#2F9E44" />
          <Text style={styles.statValue}>{mockData.light}%</Text>
          <Text style={styles.statLabel}>Light Level</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        {plant ? (
          <>
            <Image source={{ uri: plant.image }} style={styles.image} />
            <Text style={styles.detailTitle}>Plant Details</Text>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{plant.name}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Watered:</Text>
              <Text style={styles.detailValue}>{plant.lastWatered || 'Not recorded'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Edible Parts:</Text>
              <Text style={styles.detailValue}>
                {plant.edible_parts?.join(', ') || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Propagation Methods:</Text>
              <Text style={styles.detailValue}>
                {plant.propagation_methods?.join(', ') || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Watering Instructions:</Text>
              <Text style={styles.detailValue}>{plant.watering || 'N/A'}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.noData}>No plant data available</Text>
        )}
      </View>

      <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
        <Ionicons name="chatbubble-outline" size={24} color="#fff" />
        <Text style={styles.chatButtonText}>Chat with Expert</Text>
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
    alignItems: 'center',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '31%',
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999999',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F9E44',
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    elevation: 3,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
});
