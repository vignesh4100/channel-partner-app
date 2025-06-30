import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import logo from '@/assets/images/logo.png';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://noqu.co.in/db/login-cp', { email, password });
      const { token, user, tempLogin } = response.data;
      if (tempLogin && user?.id) {
        await SecureStore.setItemAsync('tempUserId', String(user.id));
        setLoading(false);
        router.push('/(auth)/ResetPasswordScreen');
        return;
      }

      if (token && user?.id) {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('cpId', String(user.id));
        setLoading(false);
        router.push('/(tabs)');
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Forgot Password Button */}
      <TouchableOpacity onPress={() => router.push('/(auth)/ForgotPasswordScreen')}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff',
    paddingHorizontal: 20, justifyContent: 'center'
  },
  logo: {
    width: 120, height: 120,
    resizeMode: 'contain', alignSelf: 'center',
    marginBottom: 30
  },
  title: {
    fontSize: 24, textAlign: 'center',
    fontWeight: 'bold'
  },
  subtitle: {
    textAlign: 'center', color: '#777',
    marginBottom: 30
  },
  input: {
    borderWidth: 1, borderColor: '#ccc',
    padding: 14, borderRadius: 8,
    fontSize: 16, backgroundColor: '#f9f9f9',
    marginBottom: 16
  },
  forgotText: {
    color: '#27375d',
    textAlign: 'right',
    marginBottom: 20,
    fontWeight: '600'
  },
  button: {
    backgroundColor: '#27375d',
    padding: 14, borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold'
  }
});
