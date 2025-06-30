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
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/utils/axiosInstance';
import { useRouter } from 'expo-router';
import profile from '@/assets/images/profile.png';
import cp_logo from '@/assets/images/cp_logo.png';

export default function ProfileScreen() {
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_no: '',
    company_name: '',
  });

  const router = useRouter();

  const fetchUser = async () => {
    const cpId = await SecureStore.getItemAsync('cpId');
    if (!cpId) return;
    try {
      const res = await axiosInstance.get(`/get-cp-details/${cpId}`);
      const cp = res.data.cp;
      setFormData({
        full_name: cp.full_name || '',
        email: cp.email || '',
        phone_no: cp.phone_no || '',
        company_name: cp.company_name || '',
      });
    } catch (err) {
      Alert.alert('Error', 'Could not fetch profile data');
    } finally {
      setPageLoading(false);
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
      await axiosInstance.post('/update-cp-member', {
        id: cpId,
        ...formData,
      });
      Alert.alert('Success', 'Profile updated successfully.');
      setIsEditing(false);
      fetchUser();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await SecureStore.deleteItemAsync('token');
          await SecureStore.deleteItemAsync('cpId');
          router.replace('/');
        },
      },
    ]);
  };

  const handleNavigateToBankDetails = () => {
    router.push('/BankDetailsScreen');
  };

  if (pageLoading) {
    return (
      <View style={styles.centered}><ActivityIndicator size="large" color="#FF7B00" /></View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Image source={cp_logo} style={styles.logo} />
        <Text style={styles.navTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.avatarSection}>
          <Image source={profile} style={styles.avatar} />
          <Text style={styles.nameLabel}>Name</Text>
          <Text style={styles.name}>{formData.full_name}</Text>
        </View>

        <View style={styles.formGroup}>
          {isEditing ? (
            <>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              />

              <Text style={styles.label}>Email id</Text>
              <TextInput style={styles.input} value={formData.email} editable={false} />

              <Text style={styles.label}>Mobile no</Text>
              <TextInput
                style={styles.input}
                value={formData.phone_no}
                onChangeText={(text) => setFormData({ ...formData, phone_no: text })}
              />

              <Text style={styles.label}>Company</Text>
              <TextInput
                style={styles.input}
                value={formData.company_name}
                onChangeText={(text) => setFormData({ ...formData, company_name: text })}
              />
            </>
          ) : (
            <View style={styles.readOnlyInfoCard}>
              <View style={styles.readOnlyItem}><Text style={styles.readOnlyLabel}>Name</Text><Text style={styles.readOnlyValue}>{formData.full_name}</Text></View>
              <View style={styles.readOnlyItem}><Text style={styles.readOnlyLabel}>Email id</Text><Text style={styles.readOnlyValue}>{formData.email}</Text></View>
              <View style={styles.readOnlyItem}><Text style={styles.readOnlyLabel}>Mobile no</Text><Text style={styles.readOnlyValue}>{formData.phone_no}</Text></View>
              <View style={styles.readOnlyItem}><Text style={styles.readOnlyLabel}>Company</Text><Text style={styles.readOnlyValue}>{formData.company_name}</Text></View>
            </View>
          )}
        </View>

        {/* <View style={styles.statsCard}>
          <Text style={styles.statTitle}>Quick stats</Text>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Active leads</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Total commission</Text>
            </View>
          </View>
        </View> */}

        {isEditing ? (
          <View style={styles.editButtonGroup}>
            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.glowButton} onPress={handleUpdate}>
                <Text style={styles.glowText}>{isLoading ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.outlinedButton} onPress={handleNavigateToBankDetails}>
              <Text style={styles.outlinedText}>Bank detail</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.outlinedButton} onPress={handleNavigateToBankDetails}>
              <Text style={styles.outlinedText}>Bank detail</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.glowButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.glowText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingBottom: '26%' },
  scroll: { paddingBottom: 30 },
  navbar: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#fff' },
  logo: { width: 35, height: 35, resizeMode: 'contain' },
  navTitle: { fontSize: 20, fontWeight: 'semibold', color: '#000', marginLeft: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20, marginTop: 20, opacity: 0.5 },
  backText: { fontSize: 14, marginLeft: 4, color: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarSection: { alignItems: 'center', marginTop: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  nameLabel: { color: '#27375d', fontSize: 14, marginTop: 10 },
  name: { color: '#27375d', fontSize: 16, fontWeight: '600' },
  formGroup: { marginTop: 20, paddingHorizontal: 20 },
  label: { fontSize: 14, marginBottom: 4, color: '#000' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 15,
  },
  readOnlyInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    // elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  readOnlyItem: { marginBottom: 16 },
  readOnlyLabel: { fontSize: 13, color: '#777', marginBottom: 4 },
  readOnlyValue: { fontSize: 15, fontWeight: '500', color: '#000' },
  statsCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statTitle: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  statLabel: { fontSize: 12, color: '#999' },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  editButtonGroup: {
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  outlinedButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ff7b00',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlinedText: { 
    fontWeight: '600', 
    color: '#ff7b00' },
  glowButton: {
    flex: 1,
    borderRadius: 50,
    backgroundColor: '#ff9900',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#ff9933',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  glowText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  cancelText: { fontWeight: '600', color: '#000' },
  logout: { marginTop: 30, alignItems: 'center' },
  logoutText: { fontSize: 16, color: 'red' },
});
