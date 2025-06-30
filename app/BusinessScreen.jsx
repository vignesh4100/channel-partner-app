import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/utils/axiosInstance';
import formatINR from '@/utils/formatINR';
import cp_business from '@/assets/images/cp_business.png';
import cp_logo from '@/assets/images/cp_logo.png'; // Update if your logo is elsewhere

export default function BusinessScreen() {
  const router = useRouter();
  const [commissions, setCommissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const cpId = await SecureStore.getItemAsync('cpId');
    if (!cpId) return;
    setRefreshing(true);
    try {
      const res = await axiosInstance.get(`/get-commissions/${cpId}`);
      const data = res.data || [];
      setCommissions(data);
      setFiltered(data);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    fetchData();
  }, []);

  const handleFilter = (status) => {
    setActiveCategory(status);
    if (status === 'All') setFiltered(commissions);
    else setFiltered(commissions.filter(item => item.status === status));
  };

  const getTotalCommission = () => {
    const list = activeCategory === 'All'
      ? commissions
      : commissions.filter(item => item.status === activeCategory.toLowerCase());

    return list.reduce((sum, item) => sum + Number(item.commission_amount || 0), 0);
  };

  const renderItem = ({ item }) => (
    <Link href={`/lead/${item.lead_id}`} asChild>
      <TouchableOpacity style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.company}>{item.company_name}</Text>
          <Text
            style={[
              styles.statusChip,
              item.status === 'paid' ? styles.statusPaid : styles.statusPending,
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.amount}>Commission: {formatINR(item.commission_amount)}</Text>
        <View style={styles.footer}>
          <Text style={styles.sale}>Sale: {formatINR(item.amount)}</Text>
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
        <Text style={styles.headerTitle}>Business</Text>
      </View>


      <View style={styles.heroSection}>

        <View style={styles.heroText}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#27375d" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.totalLabel}>Total Commission</Text>
          <Text style={styles.totalValue}>{formatINR(getTotalCommission())}</Text>
        </View>
        <Image source={cp_business} style={styles.heroImage} resizeMode="contain" />
      </View>

      <View style={styles.filterRow}>
        {['All', 'paid', 'pending'].map((label) => (
          <TouchableOpacity
            key={label}
            onPress={() => handleFilter(label)}
            style={[styles.filterPill, activeCategory === label && styles.activeFilter]}
          >
            <Text style={styles.filterText}>
              {label === 'All' ? 'All' : label.charAt(0).toUpperCase() + label.slice(1)}
            </Text>
            <Text style={styles.filterCount}>
              {label === 'All'
                ? commissions.length
                : commissions.filter((c) => c.status === label).length}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item, i) => i.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ffbb08']} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No commissions found.</Text>}
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingLeft: 20,
    marginBottom: 20,
    marginTop: 10,
    opacity: 0.5,
  },
  backText: {
    color: '#27375d',
    fontSize: 16,
    marginLeft: 4,
  },
  heroSection: {
    // borderWidth: 1,
    marginTop: 10,
    flexDirection: 'row',
    paddingLeft: 20,
    // justifyContent: 'space-between',
    // alignItems: 'flex-start',
    // paddingHorizontal: 10,
  },
  heroText: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 17,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 10,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7B00',
    paddingLeft: 10,
  },
  heroImage: {
    width: 220,
    height: 120,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterPill: {
    borderWidth: 1,
    width: '30%',
    borderColor: '#FF7B00',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 15,
  },
  activeFilter: {
    backgroundColor: '#fff7eb',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  filterCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27375d',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7B00',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  company: {
    fontSize: 15,
    fontWeight: '600',
    color: 'black',
  },
  statusChip: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusPaid: {
    backgroundColor: '#e8f9e4',
    color: '#2ecc71',
  },
  statusPending: {
    backgroundColor: '#fff4e0',
    color: '#e67e22',
  },
  amount: {
    fontSize: 15,
    marginVertical: 2,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sale: {
    fontSize: 13,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#aaa',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#888',
  },
});
