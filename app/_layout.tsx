import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

export default function Layout() {
  const [authChecked, setAuthChecked] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('token');
      const cpId = await SecureStore.getItemAsync('cpId');
      const inAuthGroup = segments[0] === '(auth)';

      if (!token || !cpId) {
        if (!inAuthGroup) router.replace('/(auth)/login');
      } else {
        if (inAuthGroup) router.replace('/(tabs)');
      }

      setAuthChecked(true);
    };

    checkAuth();
  }, [segments]);

  if (!authChecked) return null;

  return (
    <>
      <Slot />
      <StatusBar style="dark" />
    </>
  );
}
