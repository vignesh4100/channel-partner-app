import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/utils/axiosInstance';
import cp_leads_background from '@/assets/images/cp_leads_background.png';
import cp_logo from '@/assets/images/cp_logo.png'; // Replace with your logo path

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
      const filtered = leads.filter((lead) => {
        const stage = (lead.stage || '').toLowerCase().trim();
        const details = typeof lead.details === 'string' ? JSON.parse(lead.details) : lead.details;
        if (category.toLowerCase() === 'dropout') {
          return stage === 'dropout' || (!!details?.dropped_on || !!details?.drop_reason);
        }
        if (category.toLowerCase() === 'demo') {
          return stage === 'demo' || stage === 'pre-sales';
        }
        return stage === category.toLowerCase();
      });
      setFilteredLeads(filtered);
    }
  };

  const getStatusColor = (stage) => {
    switch ((stage || '').toLowerCase()) {
      case 'new': return '#34C759';
      case 'follow-up': return '#FF9500';
      case 'demo': return '#4A90E2';
      case 'pre-sales': return '#FFD700';
      case 'sale-completed': return '#34C759';
      case 'dropout': return '#FF3B30';
      default: return '#ccc';
    }
  };

  const getCount = (stage) => {
    if (stage === 'All') return leads.length;
    return leads.filter((lead) => {
      const stageVal = (lead.stage || '').toLowerCase().trim();
      const details = typeof lead.details === 'string' ? JSON.parse(lead.details) : lead.details;
      if (stage.toLowerCase() === 'dropout') {
        return stageVal === 'dropout' || (!!details?.dropped_on || !!details?.drop_reason);
      }
      if (stage.toLowerCase() === 'demo') {
        return stageVal === 'demo' || stageVal === 'pre-sales';
      }
      return stageVal === stage.toLowerCase();
    }).length;
  };

  const renderLeadItem = ({ item }) => (
    <Link href={`/lead/${item.id}`} asChild>
      <TouchableOpacity style={styles.leadCard}>
        <View style={styles.leadCardHeader}>
          <Text style={styles.company}>{item.company_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.stage) + '22' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.stage) }]}>
              {(item.stage || 'New').charAt(0).toUpperCase() + (item.stage || 'New').slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{item.contact_name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <View style={styles.dateInfo}>
          <Text style={styles.meta}>Demo by on invalid date</Text>
          <Text style={styles.date}>
            {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Image source={cp_logo} style={styles.logo} />
        <Text style={styles.headerTitle}>Leads</Text>
      </View>

      <View style={styles.backgroundWrapper}>
        <Image source={cp_leads_background} style={styles.bgImage} resizeMode="cover" />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#27375d"/>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.cardGrid}>
          {['All', 'Demo-completed', 'Sale-completed', 'Dropout'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.card, activeCategory === cat && styles.activeCard]}
              onPress={() => handleCategorySelect(cat)}
            >
              <Text style={styles.cardLabel}>
                {cat === 'All' ? 'Total Leads' : cat.replace('-', ' ')}
              </Text>
              <Text style={styles.cardCount}>{getCount(cat)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredLeads}
        renderItem={renderLeadItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF7B00']} />
        }
        contentContainerStyle={{ padding: 15 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'semibold',
    color: 'black',
  },
  backgroundWrapper: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: 235,
    opacity: 0.4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    opacity: 0.5,
  },
  backText: {
    color: 'black',
    fontSize: 16,
    marginLeft: 4,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    paddingBottom: 10,
  },
  card: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF7B00',
    borderRadius: 10,
    padding: 12,
    paddingRight: 16,
    backgroundColor: '#fff',
  },
  activeCard: {
    backgroundColor: '#fff7eb',
  },
  cardLabel: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  cardCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27375d',
  },
  leadCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  leadCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  company: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    // marginTop: 2,
  },
  email: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
  },
  meta: {
    fontSize: 12,
    color: '#999',
  },
  date: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
  },
});
