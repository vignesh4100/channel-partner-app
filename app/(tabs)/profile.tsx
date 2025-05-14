import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Image,
  RefreshControl
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/utils/axiosInstance';
import { useRouter } from 'expo-router';
import profile from '@/assets/images/profile.png';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_no: '',
    company_name: '',
  });

  const fetchUser = async () => {
    const cpId = await SecureStore.getItemAsync('cpId');
    console.log(cpId);
    if (!cpId) return;
    try {
      const res = await axiosInstance.get(`/get-cp-members/${cpId}`);
      console.log(res.data);
      const cp = res.data.cp;
      setUser(cp);
      setFormData(cp);
    } catch (err) {
      console.error('Failed to load profile:', err);
      Alert.alert('Error', 'Could not fetch profile data');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  };

  const handleUpdate = async () => {
    const cpId = await SecureStore.getItemAsync('cpId');
    if (!cpId) return;
    setIsLoading(true);
    try {
      await axiosInstance.post(`/update-cp-profile/${cpId}`, formData);
      Alert.alert('Success', 'Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Update failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('cpId');
    router.replace('/');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Image source={profile} style={styles.avatar} />
        <Text style={styles.name}>{formData.full_name || 'User'}</Text>
        <Text style={styles.company}>{formData.company_name || 'No Company'}</Text>
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone_no}
                onChangeText={(text) => setFormData({ ...formData, phone_no: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company</Text>
              <TextInput
                style={styles.input}
                value={formData.company_name}
                onChangeText={(text) => setFormData({ ...formData, company_name: text })}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleUpdate}>
              <Text style={styles.buttonText}>{isLoading ? 'Updating...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.info}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{formData.email}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{formData.phone_no || 'N/A'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Company</Text>
              <Text style={styles.infoValue}>{formData.company_name || 'N/A'}</Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, !isEditing && styles.editButton]}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.buttonText}>{isEditing ? 'Cancel' : 'Edit Profile'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  company: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  info: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  actions: {
    gap: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#27375d',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
