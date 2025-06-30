import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import cp_dashboard from '@/assets/images/cp_dashboard.png';
import cp_logo from '@/assets/images/cp_logo.png';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoRow}>
          <Image
            source={cp_logo}
            style={styles.logoIcon}
          />
          <View>
            <Text style={styles.helloText}>Hello,</Text>
            <Text style={styles.userName}>Aakash!</Text>
          </View>
        </View>
        <Ionicons name="notifications-outline" size={22} color="#FF7B00" />
      </View>

      <Image source={cp_dashboard} style={styles.dashboardImage} resizeMode="contain" />

      <View style={styles.buttonWrapper}>
        <Link href="/leads" asChild>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Leads</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/BusinessScreen" asChild>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Business</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/agreement-upload" asChild>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Upload Agreement</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  topSection: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    resizeMode: 'contain',
  },
  helloText: {
    fontSize: 14,
    color: '#000',
    opacity: 0.6,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7B00',
  },
  dashboardImage: {
    width: width,
    height: width * 0.6,
    marginVertical: '12%',
  },
  buttonWrapper: {
    marginTop: 30,
    alignItems: 'center',
    gap: 30,
  },
  btn: {
    width: width * 0.75,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#FF7B00',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    width: width,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  plusBtn: {
    backgroundColor: '#FF7B00',
    padding: 14,
    borderRadius: 50,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
