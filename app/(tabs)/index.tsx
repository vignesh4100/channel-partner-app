import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dashboard}>Dashboard</Text>
        <Text style={styles.subheading}>Welcome Channel Partner</Text>
      </View>

      <View style={styles.cardContainer}>
        <Link href="/leads" asChild>
          <TouchableOpacity style={styles.card}>
            <Ionicons name="people-outline" size={32} color="#27375d" />
            <Text style={styles.cardLabel}>Leads</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/business" asChild>
          <TouchableOpacity style={styles.card}>
            <MaterialIcons name="business-center" size={32} color="#27375d" />
            <Text style={styles.cardLabel}>Business</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/agreement-upload" asChild>
          <TouchableOpacity style={styles.card}>
            <Feather name="upload" size={32} color="#27375d" />
            <Text style={styles.cardLabel}>Upload Agreement</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  dashboard: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#27375d',
  },
  subheading: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  cardContainer: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#27375d',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardLabel: {
    marginTop: 10,
    fontSize: 16,
    color: '#ffbb08',
    fontWeight: '600',
  },
});
