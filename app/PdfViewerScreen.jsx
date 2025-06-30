import React, { useEffect } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams } from 'expo-router';

export default function PdfViewerScreen() {
  const { url } = useLocalSearchParams();

  useEffect(() => {
    const downloadAndOpenPDF = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');

        const downloadResumable = FileSystem.createDownloadResumable(
          url,
          FileSystem.documentDirectory + 'cp-agreement.pdf',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { uri } = await downloadResumable.downloadAsync();
        console.log('✅ PDF downloaded to:', uri);

        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert('Error', 'PDF viewer not available on this device');
          return;
        }

        await Sharing.shareAsync(uri);
      } catch (error) {
        console.error('❌ Failed to preview PDF:', error);
        Alert.alert('Error', 'Unable to open the PDF file');
      }
    };

    if (url) downloadAndOpenPDF();
  }, [url]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#27375d" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
