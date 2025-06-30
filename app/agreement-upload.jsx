import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Linking,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/utils/axiosInstance';
import cp_logo from '@/assets/images/cp_logo.png';

export default function AgreementUploadScreen() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [agreementExists, setAgreementExists] = useState(false);
    const router = useRouter();
    const [cpId, setCpId] = useState(null);
    const [userData, setUserData] = useState({
        full_name: 'Loading...',
        email: 'Loading...',
        phone_no: 'N/A',
        company_name: 'N/A',
        agreement_url: '',
    });

    const fetchUser = async () => {
        const cpId = await SecureStore.getItemAsync('cpId');
        setCpId(cpId);
        console.log('Fetched CP ID:', cpId);
        if (!cpId) return;

        try {
            const res = await axiosInstance.get(`/get-cp-details/${cpId}`);
            console.log('user data:', res.data);
            const cp = res.data.cp;
            setUserData({
                full_name: cp.full_name || '',
                email: cp.email || '',
                phone_no: cp.phone_no || '',
                company_name: cp.company_name || '',
                agreement_url: cp.agreement_url || '',
            });

            if (cp.agreement_url) {
                const fileUrl = `https://noqu.co.in/db/download-agreement/${cp.agreement_url}`;

                try {
                    const token = await SecureStore.getItemAsync('token');
                    const res = await fetch(fileUrl, {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (res.ok) {
                        setAgreementExists(true);
                    } else {
                        setAgreementExists(false);
                    }
                } catch (e) {
                    console.error('Error checking agreement URL:', e);
                    setAgreementExists(false);
                }
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
            Alert.alert('Error', 'Could not fetch profile data');
        }
    };

    useEffect(() => {
        fetchUser();
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
            setLoading(true);
            const formData = new FormData();
            formData.append('cpId', cpId);
            formData.append('full_name', userData.full_name);
            formData.append('company_name', userData.company_name);
            formData.append('agreement', {
                uri: file.uri,
                name: `${cpId}.pdf`,
                type: 'application/pdf',
            });
            console.log('Form data prepared:', formData);
            const token = await SecureStore.getItemAsync('token');

            const response = await fetch('https://noqu.co.in/db/upload-agreement', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const resultText = await response.text();
            console.log('Upload response:', resultText);

            if (response.ok) {
                Alert.alert('Success', 'Agreement uploaded successfully.');
                setLoading(false);
                setAgreementExists(true);
                setFile(null);
                fetchUser();
            } else {
                setLoading(false);
                throw new Error('Upload failed');
            }
        } catch (error) {
            setLoading(false);
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
        if (!userData.agreement_url) {
            Alert.alert('No Agreement', 'Agreement not uploaded yet.');
            return;
        }

        const fileUrl = `https://noqu.co.in/db/download-agreement/${userData.agreement_url}`;
        console.log('File URL:', fileUrl);

        router.push({
            pathname: '/PdfViewerScreen',
            params: { url: fileUrl },
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Image source={cp_logo} style={styles.logo} />
                <Text style={styles.title}>Upload Agreement</Text>
            </View>

            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={20} color="#000" />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.actionArea}>
                <TouchableOpacity style={styles.buttonOutline} onPress={handleDownloadSample}>
                    <Text style={styles.buttonOutlineText}>Download Sample Agreement</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.selectButton} onPress={pickDocument}>
                    <Text style={styles.selectText}>Select PDF File</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonWrapper} onPress={handleUpload}>
                    <LinearGradient
                        colors={['#ff7b00', '#ffb347']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonShadow}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.buttonText}>Upload</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* {agreementExists && (
                    <TouchableOpacity style={styles.buttonPrimary} onPress={handleViewAgreement}>
                        <Text style={styles.buttonPrimaryText}>View My Agreement</Text>
                    </TouchableOpacity>
                )} */}
            </View>

            <View style={styles.instructionCard}>
                <Text style={styles.instructionTitle}>Instructions</Text>
                <Text style={styles.instructionText}>• Upload the signed agreement in PDF format</Text>
                <Text style={styles.instructionText}>• Download the sample above to get started.</Text>
                <Text style={styles.instructionText}>• Your agreement will be reviewed by admin</Text>
                <Text style={styles.instructionText}>• You’ll be activated after verification.</Text>
            </View>
        </ScrollView>
    );

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        gap: 10,
    },
    logo: {
        width: 35,
        height: 35,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        marginTop: 20,
        opacity: 0.5,
    },
    backText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 6,
    },
    actionArea: {
        padding: 20,
        gap: 15,
        marginTop: 30,
    },
    buttonOutline: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    buttonOutlineText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#222',
    },
    selectButton: {
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#ff7b00',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    selectText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#ff7b00',
    },

    buttonWrapper: {
        shadowColor: '#ff9a3c',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
        borderRadius: 15,
    },

    buttonShadow: {
        borderRadius: 15,
        paddingVertical: 14,
        paddingHorizontal: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    buttonPrimary: {
        backgroundColor: '#f8f8f8',
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonPrimaryText: {
        fontSize: 15,
        fontWeight: '500',
        color: 'black',
    },
    instructionCard: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        margin: 20,
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#000',
    },
    instructionText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
        paddingBottom: 4,
    },
});

