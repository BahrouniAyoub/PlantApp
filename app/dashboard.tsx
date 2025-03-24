// app/(tabs)/dashboard.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

const mockData = {
  moisture: 65,
  temperature: 24,
  light: 80,
};

const mockChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [65, 63, 68, 70, 65, 62, 65],
    },
  ],
};

export default function Dashboard() {
  const { plant } = useLocalSearchParams();
  const plantData = plant ? JSON.parse(decodeURIComponent(plant as string)) : null;

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
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Moisture Levels (Last 7 Days)</Text>
        <LineChart
          data={mockChartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(47, 158, 68, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
      <View style={styles.detailsContainer}>
        {plantData ? (
          <>
            <Text style={styles.detailTitle}>Plant Details</Text>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{plantData.name}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Probability:</Text>
              {/* <Text style={styles.detailValue}>{plantData.result.classification.suggestions[0].probability.toFixed(2)}</Text> */}
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Health:</Text>
              <Text style={styles.detailValue}>{plantData.health}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Watered:</Text>
              <Text style={styles.detailValue}>{plantData.lastWatered}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Light Requirements:</Text>
              <Text style={styles.detailValue}>{plantData.light_requirements}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Watering Frequency:</Text>
              <Text style={styles.detailValue}>{plantData.watering_frequency}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Temperature Range:</Text>
              <Text style={styles.detailValue}>{plantData.temperature_range}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Common Names:</Text>
              <Text style={styles.detailValue}>{plantData.common_names}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.noData}>No plant data available</Text>
        )}
      </View>
      <View style={styles.alertsContainer}>
        <Text style={styles.alertsTitle}>Recent Alerts</Text>
        <View style={styles.alertCard}>
          <Ionicons name="warning-outline" size={24} color="#FFA500" />
          <View style={styles.alertContent}>
            <Text style={styles.alertText}>Low moisture level detected</Text>
            <Text style={styles.alertTime}>2 hours ago</Text>
          </View>
        </View>
      </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  chartContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: 'bold',
    marginBottom: 10
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
  },
  alertsContainer: {
    margin: 20,
    marginTop: 0,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertContent: {
    marginLeft: 15,
  },
  alertText: {
    fontSize: 14,
    color: '#333333',
  },
  alertTime: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999999',
  },
});