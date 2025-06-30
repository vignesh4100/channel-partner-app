import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestTempPass = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email');
    setLoading(true);
    try {
      await axios.post('https://noqu.co.in/db/cp-forgot-password-init', { email });
      Alert.alert('Success', 'Temporary password sent to your email');
      setStep(2);
    } catch (error) {
      console.error(error);
      Alert.alert('Failed', error.response?.data?.message || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTempPass = async () => {
    if (!tempPassword) return Alert.alert('Error', 'Enter the temporary password');
    setLoading(true);
    try {
      const res = await axios.post('https://noqu.co.in/db/cp-forgot-password-verify', { email, tempPassword });
      const { userId } = res.data;
      await SecureStore.setItemAsync('tempUserId', String(userId));
      Alert.alert('Verified', 'Proceed to reset your password');
      router.replace('/(auth)/ResetPasswordScreen');
    } catch (error) {
      console.error(error);
      Alert.alert('Invalid', error.response?.data?.message || 'Invalid temp password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      {step === 1 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your registered email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleRequestTempPass} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Temp Password</Text>}
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.label}>Enter Temporary Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Temporary Password"
            secureTextEntry
            value={tempPassword}
            onChangeText={setTempPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleVerifyTempPass} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Continue</Text>}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  label: { marginBottom: 10, fontWeight: 'bold' },
  button: { backgroundColor: '#27375d', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
