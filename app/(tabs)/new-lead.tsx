import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/utils/axiosInstance';

export default function NewLeadScreen() {
  const [formData, setFormData] = useState({ companyName: "", email: "", phone: "", contactName: "" });
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const cpId = await SecureStore.getItemAsync('cpId');
        if (!cpId) return;

        const response = await axiosInstance.get(`/get-cp-members/${cpId}`);
        setUserStatus(response.data.cp.status); // 'active' or 'inactive'
      } catch (error) {
        console.log("Error fetching user status:", error.message);
      }
    };

    fetchUserStatus();
  }, []);

  const handleAddLead = async () => {
    if (userStatus !== 'active') {
      Alert.alert(
        "Account Inactive",
        "You are unable to add a lead without uploading the agreement. Please upload the agreement. Once approved by admin, you'll be able to submit leads."
      );
      return;
    }

    try {
      setLoading(true);
      const cpId = await SecureStore.getItemAsync('cpId');
      if (!cpId) throw new Error("CP ID not found");

      await axiosInstance.post('/add-lead', {
        ...formData,
        cpId,
      });

      Alert.alert("Success", "Lead added successfully.");
      setFormData({ companyName: "", email: "", phone: "", contactName: "" });
      setLoading(false);
      router.push('/leads');
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.Nav}>
        <Text style={styles.title}>Create New lead</Text>
      </View>
      <ScrollView style={styles.container}>
        {userStatus === 'inactive' && (
          <Text style={{ color: 'red', margin: 10 }}>
            You must upload the agreement. Admin will activate your account to enable lead submission.
          </Text>
        )}
        <View style={styles.content}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                value={formData.companyName}
                onChangeText={(text) => setFormData({ ...formData, companyName: text })}
                placeholder="Enter company name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Person</Text>
              <TextInput
                style={styles.input}
                value={formData.contactName}
                onChangeText={(text) => setFormData({ ...formData, contactName: text })}
                placeholder="Enter contact person name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, userStatus !== 'active' && { backgroundColor: '#aaa' }]}
              onPress={handleAddLead}
              disabled={userStatus !== 'active' || loading}
            >
              <Text style={styles.buttonText}>{loading ? "Submitting..." : "Submit Lead"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  Nav: {
    width: '100%',
    height: 80,
    backgroundColor: '#ffbb08',
    justifyContent: 'center',
    paddingTop: 25,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27375d',
    textAlign: 'left',
    marginLeft: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4a4a4a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#27375d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
