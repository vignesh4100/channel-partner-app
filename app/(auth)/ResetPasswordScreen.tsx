import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter both fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const userId = await SecureStore.getItemAsync('tempUserId');
      if (!userId) throw new Error('No user ID found');

      await axios.post('https://noqu.co.in/db/reset-password', { id: userId, newPassword });
      await SecureStore.deleteItemAsync('tempUserId');

      Alert.alert('Success', 'Password reset successful. Please log in again.');
      router.replace('/login');
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert('Reset Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>
      <TextInput style={styles.input} placeholder="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, textAlign: 'center', fontWeight: 'bold', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 14, borderRadius: 8, marginBottom: 20, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#27375d', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
