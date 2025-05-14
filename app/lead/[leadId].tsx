import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Linking, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Timeline from 'react-native-timeline-flatlist';
import { AntDesign } from '@expo/vector-icons';
import axiosInstance from '@/utils/axiosInstance';

export default function LeadDetailScreen() {
  const { leadId } = useLocalSearchParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLead = async () => {
      if (!leadId) {
        console.error('Lead ID is missing.');
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get(`/lead-detail/${leadId}`);
        if (res.data?.lead) {
          setLead(res.data.lead);
        } else {
          console.warn('Lead not found.');
        }
      } catch (error) {
        console.error('Error fetching lead:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId]);

  const stages = [
    { title: 'Follow-Up', description: lead?.details?.followUp || 'No follow-up details.' },
    { title: 'Demo Scheduled', description: lead?.details?.demo || 'No demo scheduled.' },
    { title: 'Pre-Sales', description: lead?.details?.quotation || 'No quotation available.' },
    { title: 'Sale Completed', description: lead?.details?.invoice || 'No invoice generated.' }
  ];

  if (loading) {
    return <ActivityIndicator size="large" color="#ffbb08" style={styles.loader} />;
  }

  if (!lead) {
    return <Text style={styles.errorText}>No lead details available.</Text>;
  }

  const openLink = (url) => {
    if (!url) {
      Alert.alert('Error', 'No URL provided.');
      return;
    }

    const validUrl = url.startsWith('http') ? url : `https://${url}`;

    Linking.canOpenURL(validUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(validUrl);
        } else {
          Alert.alert('Error', 'Cannot open link.');
        }
      })
      .catch(() => Alert.alert('Error', 'Failed to open link.'));
  };

  return (
    <>
      <View style={styles.Nav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <AntDesign name="left" size={20} color="#27375d" />
        </TouchableOpacity>
        <Text style={styles.title}>Lead Details</Text>
      </View>

      <ScrollView style={styles.container}>
        <Timeline
          data={stages}
          circleSize={20}
          circleColor="#ffbb08"
          lineColor="#27375d"
          innerCircle={'dot'}
          descriptionStyle={styles.timelineDescription}
          options={{ removeClippedSubviews: false }}
        />

        <View style={styles.leadDetails}>
          <Text style={styles.sectionTitle}>Lead Information</Text>
          <Text style={styles.detailText}>Company Name: {lead?.companyName}</Text>
          <Text style={styles.detailText}>Contact Person: {lead?.contactName}</Text>
          <Text style={styles.detailText}>Email: {lead?.email}</Text>
          <Text style={styles.detailText}>Phone: {lead?.phone}</Text>
          <Text style={styles.detailText}>Status: {lead?.status?.stage}</Text>
        </View>

        <View style={styles.stageDetails}>
          <Text style={styles.sectionTitle}>Stage Details</Text>
          {lead?.status?.details
            ? Object.entries(lead.status.details).map(([key, value]) => (
              <View key={key} style={styles.stageCard}>
                <Text style={styles.stageTitle}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}:
                </Text>
                {typeof value === 'string' ? (
                  value.startsWith('http') ? (
                    <Text style={styles.linkText} onPress={() => openLink(value)}>
                      {value.endsWith('.pdf') ? '📄 View PDF' : '🗂️ View Link'}
                    </Text>
                  ) : (
                    <Text style={styles.stageText}>{value}</Text>
                  )
                ) : value?.seconds ? (
                  <Text style={styles.stageTime}>
                    {new Date(value.seconds * 1000).toLocaleString()}
                  </Text>
                ) : (
                  <Text style={styles.stageText}>No valid value available.</Text>
                )}
              </View>
            ))
            : (
              <Text style={styles.stageText}>No stage details available.</Text>
            )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  Nav: {
    width: '100%',
    backgroundColor: '#ffbb08',
    padding: 15,
    flexDirection: 'row',
    paddingTop: 40,
    paddingBottom: 15,
    gap: 10,
  },
  backIcon: { marginTop: 3 },
  container: { flex: 1, backgroundColor: '#f8f8f8', padding: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#27375d' },
  loader: { marginTop: 100 },
  errorText: { textAlign: 'center', color: 'red', marginTop: 20 },
  leadDetails: { padding: 10, backgroundColor: '#fff', borderRadius: 10, marginVertical: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: 'black', marginBottom: 10 },
  detailText: { fontSize: 14, color: '#444', marginVertical: 3 },
  stageDetails: { padding: 10, backgroundColor: '#fff', borderRadius: 10, marginVertical: 10 },
  stageCard: { padding: 8, marginBottom: 5, backgroundColor: '#f1f1f1', borderRadius: 8 },
  stageTitle: { fontSize: 14, fontWeight: '600', color: '#27375d' },
  stageText: { fontSize: 14, color: '#555' },
  stageTime: { fontSize: 13, color: '#555', marginTop: 3 },
  timelineDescription: { color: '#666' },
  linkText: { color: '#1e90ff', textDecorationLine: 'underline' },
});
