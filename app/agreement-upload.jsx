import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Linking,
    ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/utils/axiosInstance';

export default function AgreementUploadScreen() {
    const [file, setFile] = useState(null);
    const [agreementExists, setAgreementExists] = useState(false);
    const router = useRouter();
    const [cpId, setCpId] = useState(null);

    useEffect(() => {
        const loadCpIdAndCheck = async () => {
            const id = await SecureStore.getItemAsync('cpId');
            setCpId(id);
            if (!id) return;

            try {
                const response = await fetch(`https://noqu.co.in/agreements/CP-Agreements/${id}.pdf`, {
                    method: 'HEAD',
                });
                setAgreementExists(response.ok);
            } catch (error) {
                console.log('Agreement check failed:', error);
                setAgreementExists(false);
            }
        };

        loadCpIdAndCheck();
    }, []);

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
        if (!result.canceled) {
            setFile(result.assets[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !cpId) {
            Alert.alert('Missing Info', 'Please select a file and ensure CP ID is set.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('agreement', {
                uri: file.uri,
                name: `${cpId}.pdf`,
                type: 'application/pdf',
            });
            formData.append('cpId', cpId);

            const res = await axiosInstance.post('/upload-agreement', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.status === 200) {
                Alert.alert('Success', 'Agreement uploaded successfully.');
                setAgreementExists(true);
                setFile(null);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            Alert.alert('Error', 'Failed to upload agreement.');
        }
    };

    const handleDownloadSample = () => {
        Linking.openURL('https://noqu.co.in/agreements/CP-Agreement.pdf').catch(() =>
            Alert.alert('Error', 'Unable to open sample agreement.')
        );
    };

    const handleViewAgreement = () => {
        Linking.openURL(`https://noqu.co.in/agreements/CP-Agreements/${cpId}.pdf`).catch(() =>
            Alert.alert('Error', 'No agreement found or file URL is broken.')
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.Nav}>
                <View style={styles.navContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#27375d" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Upload Agreement</Text>
                </View>
            </View>

            <View style={styles.cardContainer}>
                <View style={styles.cardSection}>
                    <TouchableOpacity style={styles.outlinedButton} onPress={handleDownloadSample}>
                        <Text style={styles.outlinedButtonText}>Download Sample Agreement</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.primaryButton} onPress={pickDocument}>
                        <Text style={styles.primaryButtonText}>Select PDF File</Text>
                    </TouchableOpacity>

                    {file && (
                        <View style={styles.preview}>
                            <Text style={styles.previewText}>Selected File:</Text>
                            <Text style={styles.fileName}>{file.name}</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.primaryButton} onPress={handleUpload}>
                        <Text style={styles.primaryButtonText}>Upload</Text>
                    </TouchableOpacity>

                    {agreementExists && (
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleViewAgreement}>
                            <Text style={styles.secondaryButtonText}>View My Agreement</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Instructions</Text>
                <View style={styles.bulletList}>
                    <Text style={styles.instructionText}>• Upload the signed agreement in PDF format.</Text>
                    <Text style={styles.instructionText}>• Download the sample above to get started.</Text>
                    <Text style={styles.instructionText}>• Your agreement will be reviewed by admin.</Text>
                    <Text style={styles.instructionText}>• You’ll be activated after verification.</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#f9fafb', paddingBottom: 40 },
    Nav: { width: '100%', height: 80, backgroundColor: '#ffbb08', justifyContent: 'center', paddingTop: 25 },
    navContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
    backButton: { marginRight: 10 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#27375d' },
    cardContainer: { marginHorizontal: 16 },
    cardSection: { backgroundColor: '#ffffff', borderRadius: 12, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
    primaryButton: { backgroundColor: '#27375d', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 12 },
    primaryButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
    secondaryButton: { backgroundColor: '#f1f1f1', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 12 },
    secondaryButtonText: { color: '#27375d', fontWeight: '600', fontSize: 15 },
    outlinedButton: { borderWidth: 1.5, borderColor: '#27375d', borderRadius: 6, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff', marginTop: 12 },
    outlinedButtonText: { color: '#27375d', fontWeight: '600', fontSize: 15 },
    preview: { marginTop: 15, alignItems: 'center' },
    previewText: { fontSize: 14, color: '#555' },
    fileName: { fontSize: 15, fontWeight: '500', color: '#000', marginTop: 5 },
    infoCard: { backgroundColor: '#fdfdfd', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#e0e0e0', marginHorizontal: 16, marginTop: 24 },
    infoTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14, color: '#27375d' },
    bulletList: { gap: 8 },
    instructionText: { fontSize: 14, color: '#333', lineHeight: 22, paddingVertical: 2 },
});
