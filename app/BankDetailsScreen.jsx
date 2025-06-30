import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Modal,
    ScrollView, Alert,
    Image
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axiosInstance from '@/utils/axiosInstance';
import * as SecureStore from 'expo-secure-store';
import cp_logo from '@/assets/images/cp_logo.png';


export default function BankDetailsScreen() {
    const [loading, setLoading] = useState(true);
    const [existingMethods, setExistingMethods] = useState([]);
    const [method, setMethod] = useState('');
    const [upiId, setUpiId] = useState('');
    const [bankDetails, setBankDetails] = useState({
        accountHolder: '',
        accountNumber: '',
        ifsc: '',
        bankName: '',
        branch: '',
    });
    const [consent, setConsent] = useState(false);
    const [showPolicy, setShowPolicy] = useState(false);
    const [editing, setEditing] = useState(false);
    const router = useRouter();

    const fetchBankDetails = async () => {
        const cpId = await SecureStore.getItemAsync('cpId');
        try {
            const res = await axiosInstance.get(`/cp-bank-details/${cpId}`);
            setExistingMethods(res.data || []);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBankDetails();
    }, []);

    const handleSubmit = async () => {
        if (!consent) return Alert.alert('Please agree to the privacy policy.');

        const cpId = await SecureStore.getItemAsync('cpId');
        if (!cpId) return Alert.alert('Missing CP ID');

        if (method === 'upi' && !upiId.trim()) {
            return Alert.alert('Please enter your UPI ID.');
        }

        if (
            method === 'bank' &&
            (!bankDetails.accountHolder.trim() ||
                !bankDetails.accountNumber.trim() ||
                !bankDetails.ifsc.trim() ||
                !bankDetails.bankName.trim())
        ) {
            return Alert.alert('Please fill all required bank details.');
        }

        const payload = {
            cp_id: cpId,
            payment_method: method,
            upi_id: method === 'upi' ? upiId : null,
            account_holder_name: method === 'bank' ? bankDetails.accountHolder : null,
            account_number: method === 'bank' ? bankDetails.accountNumber : null,
            ifsc_code: method === 'bank' ? bankDetails.ifsc : null,
            bank_name: method === 'bank' ? bankDetails.bankName : null,
            branch: method === 'bank' ? bankDetails.branch : null,
        };




        try {
            const url = editing ? '/cp-bank-details/update' : '/cp-bank-details';
            const res = await axiosInstance.post(url, payload);
            Alert.alert('Success', `${editing ? 'Updated' : 'Saved'} successfully`);
            setEditing(false);
            setMethod('');
            setUpiId('');
            setBankDetails({ accountHolder: '', accountNumber: '', ifsc: '', bankName: '', branch: '' });
            fetchBankDetails();
        } catch (err) {
            console.error('Submit error:', err);
            Alert.alert('Error', 'Failed to submit details');
        }
    };

    const startEdit = (type) => {
        setMethod(type);
        setEditing(true);
        setConsent(true);
        if (type === 'upi') {
            const upi = existingMethods.find((e) => e.payment_method === 'upi');
            setUpiId(upi?.upi_id || '');
        } else {
            const bank = existingMethods.find((e) => e.payment_method === 'bank');
            setBankDetails({
                accountHolder: bank?.account_holder_name || '',
                accountNumber: bank?.account_number || '',
                ifsc: bank?.ifsc_code || '',
                bankName: bank?.bank_name || '',
                branch: bank?.branch || '',
            });
        }
    };

    if (loading) {
        return (
            <>
                <View style={styles.header}>
                    <Image source={cp_logo} style={styles.logo} />
                    <Text style={styles.title}>Upload Agreement</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading bank details...</Text>
                </View>
            </>
        );
    }

    return (
        <>

                <View style={styles.header}>
                    <Image source={cp_logo} style={styles.logo} />
                    <Text style={styles.title}>Upload Agreement</Text>
                </View>

            <ScrollView style={styles.container}>
                {existingMethods.length > 0 && (
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={20} color="#666" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                )}

                {/* Existing Methods */}
                {existingMethods.map((item) => (
                    <View key={item.payment_method} style={styles.methodCard}>
                        <View style={styles.methodHeader}>
                            <Text style={styles.methodTitle}>
                                {item.payment_method === 'upi' ? 'UPI ID' : 'Bank Account'}
                            </Text>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => startEdit(item.payment_method)}
                            >
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                        </View>

                        {item.payment_method === 'upi' ? (
                            <Text style={styles.methodValue}>{item.upi_id}</Text>
                        ) : (
                            <View style={styles.bankDetails}>
                                <Text style={styles.methodValue}>{item.account_holder_name}</Text>
                                <Text style={styles.methodSubValue}>A/C</Text>
                                <Text style={styles.methodSubValue}>Bank Name</Text>
                                <Text style={styles.methodSubValue}>IFSC</Text>
                                {item.branch && <Text style={styles.methodSubValue}>Location</Text>}
                            </View>
                        )}
                    </View>
                ))}

                {/* Add New Method Section */}
                {existingMethods.length < 2 && (
                    <>
                        <Text style={styles.sectionTitle}>
                            Select Payment method to {editing ? 'Edit' : 'add'}
                        </Text>

                        <View style={styles.methodButtons}>
                            {existingMethods.every((m) => m.payment_method !== 'upi') && (
                                <LinearGradient
                                    colors={method === 'upi' ? ['#FF6B35', '#FF8E53'] : ['transparent', 'transparent']}
                                    style={[
                                        styles.methodButton,
                                        method === 'upi' && styles.methodButtonActive
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={styles.methodButtonInner}
                                        onPress={() => setMethod('upi')}
                                    >
                                        <Text style={[
                                            styles.methodButtonText,
                                            method === 'upi' && styles.methodButtonTextActive
                                        ]}>
                                            UPI
                                        </Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            )}

                            {existingMethods.every((m) => m.payment_method !== 'bank') && (
                                <LinearGradient
                                    colors={method === 'bank' ? ['#FF6B35', '#FF8E53'] : ['transparent', 'transparent']}
                                    style={[
                                        styles.methodButton,
                                        method === 'bank' && styles.methodButtonActive
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={styles.methodButtonInner}
                                        onPress={() => setMethod('bank')}
                                    >
                                        <Text style={[
                                            styles.methodButtonText,
                                            method === 'bank' && styles.methodButtonTextActive
                                        ]}>
                                            Bank Transfer
                                        </Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            )}
                        </View>

                        {/* UPI Form */}
                        {method === 'upi' && (
                            <View style={styles.formSection}>
                                <Text style={styles.formLabel}>UPI ID</Text>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder="UPI Payment"
                                    value={upiId}
                                    onChangeText={setUpiId}
                                />
                            </View>
                        )}

                        {/* Bank Form */}
                        {method === 'bank' && (
                            <View style={styles.formSection}>
                                {[
                                    { key: 'accountHolder', label: 'Account Holder Name' },
                                    { key: 'accountNumber', label: 'Account Number' },
                                    { key: 'ifsc', label: 'IFSC Code' },
                                    { key: 'bankName', label: 'Bank Name' },
                                    { key: 'branch', label: 'Branch (Optional)' },
                                ].map((field) => (
                                    <View key={field.key} style={styles.inputGroup}>
                                        <Text style={styles.formLabel}>{field.label}</Text>
                                        <TextInput
                                            style={styles.formInput}
                                            value={bankDetails[field.key]}
                                            onChangeText={(text) =>
                                                setBankDetails({ ...bankDetails, [field.key]: text })
                                            }
                                            placeholder=""
                                        />
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Consent Checkbox */}
                        {method && (
                            <>
                                <View style={styles.consentContainer}>
                                    <Checkbox
                                        value={consent}
                                        onValueChange={setConsent}
                                        color={consent ? '#FF6B35' : '#ccc'}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.consentText}>I agree to the </Text>
                                    <TouchableOpacity onPress={() => setShowPolicy(true)}>
                                        <Text style={styles.privacyLink}>Privacy Policy</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Submit Button */}
                                <LinearGradient
                                    colors={['#FF6B35', '#FF8E53']}
                                    style={styles.submitButtonGradient}
                                >
                                    <TouchableOpacity
                                        style={styles.submitButton}
                                        onPress={handleSubmit}
                                    >
                                        <Text style={styles.submitButtonText}>
                                            {editing ? 'Update' : 'Submit'}
                                        </Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </>
                        )}
                    </>
                )}

                {/* Privacy Policy Modal */}
                <Modal visible={showPolicy} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Privacy Policy</Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowPolicy(false)}
                                >
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalScroll}>
                                <Text style={styles.modalText}>
                                    We value your privacy. Your banking information is encrypted and stored securely.
                                    We do not share your data with third parties. For full terms, visit our website.
                                </Text>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    navbar: {
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    navContent: {
        flexDirection: 'row',
        alignItems: 'center',
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

    brandText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 5,
    },
    methodCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    methodHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    methodTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    editButton: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FF6B35',
    },
    editButtonText: {
        fontSize: 14,
        color: '#FF6B35',
        fontWeight: '500',
    },
    methodValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    bankDetails: {
        gap: 4,
    },
    methodSubValue: {
        fontSize: 14,
        color: '#666',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 10,
    },
    methodButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 30,
    },
    methodButton: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    methodButtonActive: {
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 0,
    },
    methodButtonInactive: {
        backgroundColor: '#f8f9fa',
        borderColor: '#FF6B35',
        borderWidth: 1,
    },
    methodButtonInner: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    methodButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6B35',
        textAlign: 'center',
        // paddingVertical: 16,
    },
    methodButtonTextActive: {
        color: '#fff',
    },
    methodButtonTextInactive: {
        color: '#FF6B35',
    },
    formSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    formInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    consentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 30,
        flexWrap: 'wrap',
    },
    checkbox: {
        marginRight: 8,
    },
    consentText: {
        fontSize: 14,
        color: '#666',
    },
    privacyLink: {
        fontSize: 14,
        color: '#FF6B35',
        textDecorationLine: 'underline',
    },
    submitButtonGradient: {
        marginHorizontal: 20,
        borderRadius: 12,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        marginBottom: 30,
    },
    submitButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    modalScroll: {
        padding: 20,
    },
    modalText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});