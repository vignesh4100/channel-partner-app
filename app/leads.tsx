import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/utils/axiosInstance';

export default function LeadsScreen() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeads = async () => {
    const userId = await SecureStore.getItemAsync('cpId');
    if (!userId) return;
    setRefreshing(true);
    try {
      const response = await axiosInstance.get(`/get-leads/${userId}`);
      const leadsData = response.data.leads || [];
      setLeads(leadsData);
      setFilteredLeads(leadsData);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const onRefresh = useCallback(() => {
    fetchLeads();
  }, []);

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    if (category === 'All') {
      setFilteredLeads(leads);
    } else {
      const filtered = leads.filter(
        (lead) => lead.status?.stage?.toLowerCase() === category.toLowerCase()
      );
      setFilteredLeads(filtered);
    }
  };

  const getStatusColor = (stage) => {
    switch (stage?.toLowerCase()) {
      case 'new': return '#ffbb08';
      case 'follow-up': return '#FF9500';
      case 'demo': return '#4A90E2';
      case 'pre-sales': return '#FFD700';
      case 'sale completed': return '#34C759';
      case 'dropout': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getCount = (stage) =>
    stage === 'All'
      ? leads.length
      : leads.filter((lead) => lead.status?.stage?.toLowerCase() === stage.toLowerCase()).length;

  const renderLeadItem = ({ item }) => (
    <Link href={`/lead/${item.id}`} asChild>
      <TouchableOpacity style={styles.leadCard}>
        <View style={styles.leadHeader}>
          <Text style={styles.companyName}>{item.companyName}</Text>
          <Text style={[styles.status, { color: getStatusColor(item.status?.stage) }]}> {item.status?.stage || 'New'} </Text>
        </View>
        <Text style={styles.contactName}>{item.contactName}</Text>
        <Text style={styles.email}>{item.email}</Text>

        {item.status?.stage === 'Follow-Up' && (
          <Text style={styles.statusDetail}>
            Followed by {item.status.details.followedBy} on {new Date(item.status.details.lastCallDate).toLocaleString()}
          </Text>
        )}
        {item.status?.stage === 'Demo' && (
          <Text style={styles.statusDetail}>
            Demo by {item.status.details.demoBy} on {new Date(item.status.details.demoDate).toLocaleString()}
          </Text>
        )}
        {item.status?.stage === 'Pre-Sales' && item.status.details.quotationUrl && (
          <Text style={styles.statusDetail}>
            Quotation: <Text style={styles.link}>View PDF</Text>
          </Text>
        )}
        {item.status?.stage === 'Sale Completed' && item.status.details.invoiceUrl && (
          <Text style={styles.statusDetail}>
            Invoice: <Text style={styles.link}>Download PDF</Text>
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.date}>
            {item.createdAt?.seconds
              ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
              : 'N/A'}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <>
      <View style={styles.Nav}>
        <View style={styles.navContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#27375d" />
          </TouchableOpacity>
          <Text style={styles.title}>Your Leads</Text>
        </View>
      </View>

      <View style={styles.cardGrid}>
        {['All', 'Demo', 'Sale Completed', 'Dropout'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.card, activeCategory === cat && styles.activeCard]}
            onPress={() => handleCategorySelect(cat)}
          >
            <Text style={styles.cardLabel}>{cat === 'All' ? 'Total Leads' : cat}</Text>
            <Text style={styles.cardCount}>{getCount(cat)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.container}>
        {refreshing ? (
          <ActivityIndicator size="large" color="#ffbb08" />
        ) : (
          <FlatList
            data={filteredLeads}
            renderItem={renderLeadItem}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ffbb08']} />}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>No leads found.</Text>}
          />
        )}
      </View>
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
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27375d',
    textAlign: 'left',
    marginLeft: 20,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  activeCard: {
    borderColor: '#27375d',
  },
  cardLabel: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  cardCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27375d',
  },
  listContainer: {
    padding: 15,
  },
  leadCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffbb08',
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27375d',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusDetail: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  contactName: {
    fontSize: 16,
    color: '#4a4a4a',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  date: {
    fontSize: 12,
    color: '#8e8e93',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
