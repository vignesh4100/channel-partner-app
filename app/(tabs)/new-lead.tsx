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
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    contactName: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const cpId = await SecureStore.getItemAsync('cpId');
        if (!cpId) return;
        const response = await axiosInstance.get(`/get-cp-details/${cpId}`);
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

    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.contactName.trim()) newErrors.contactName = "Contact person is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
      setErrors({});
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
        <Text style={styles.title}>Create New Lead</Text>
      </View>
      <ScrollView style={styles.container}>
        {userStatus === 'inactive' && (
          <Text style={{ color: 'red', margin: 10 }}>
            You must upload the agreement. Admin will activate your account to enable lead submission.
          </Text>
        )}
        <View style={styles.content}>
          <View style={styles.form}>
            {/* Company Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={[styles.input, errors.companyName && styles.inputError]}
                value={formData.companyName}
                onChangeText={(text) => {
                  setFormData({ ...formData, companyName: text });
                  if (errors.companyName) setErrors({ ...errors, companyName: null });
                }}
                placeholder="Enter company name"
              />
              {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
            </View>

            {/* Contact Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Person</Text>
              <TextInput
                style={[styles.input, errors.contactName && styles.inputError]}
                value={formData.contactName}
                onChangeText={(text) => {
                  setFormData({ ...formData, contactName: text });
                  if (errors.contactName) setErrors({ ...errors, contactName: null });
                }}
                placeholder="Enter contact person name"
              />
              {errors.contactName && <Text style={styles.errorText}>{errors.contactName}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={formData.phone}
                onChangeText={(text) => {
                  setFormData({ ...formData, phone: text });
                  if (errors.phone) setErrors({ ...errors, phone: null });
                }}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Submit Button */}
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
  inputError: {
    borderWidth: 1.5,
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginTop: 5,
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
