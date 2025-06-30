// (Keep imports the same)
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Linking, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import axiosInstance from '@/utils/axiosInstance';

export default function LeadDetailScreen() {
  const { leadId } = useLocalSearchParams();
  const [lead, setLead] = useState(null);
  const [expandedCardKey, setExpandedCardKey] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!leadId) return;
    axiosInstance.get(`/lead-detail/${leadId}`).then(res => {
      if (res.data?.lead) {
        setLead(res.data.lead);
        const current = res.data.lead.stage;
        const isDropout = current === 'dropout' || res.data.lead.details?.dropped_on || res.data.lead.details?.drop_reason;
        if (!isDropout) setExpandedCardKey(current);
      }
    }).catch(console.error);
  }, [leadId]);

  const toggleCardExpansion = (stageKey) => {
    setExpandedCardKey(prevKey => prevKey === stageKey ? null : stageKey);
  };

  const getStageContent = (stage, isExpanded) => {
    const details = lead?.details || {};
    switch (stage.key) {
      case 'follow-up':
        return isExpanded
          ? `Followed by: ${details.followed_by || 'Not assigned'}\nLast call: ${details.last_call || 'No calls made'}\nNext follow-up: ${details.next_followup || 'Not scheduled'}`
          : details.followed_by ? `Followed by ${details.followed_by}` : 'No update';
      case 'demo':
        return isExpanded
          ? `Demo by: ${details.demo_by || 'Not assigned'}\nDemo date: ${details.demo_date || 'Not scheduled'}\nDemo status: ${details.demo_status || 'Pending'}\nNotes: ${details.demo_notes || 'No notes'}`
          : details.demo_by ? `Demo by ${details.demo_by}` : 'No update';
      case 'pre-sales':
        return isExpanded
          ? `Quotation: ${details.quotation_pdf ? 'Shared' : 'Not uploaded'}\nQuoted amount: ${details.quoted_amount ? `₹${Number(details.quoted_amount).toLocaleString()}` : 'Not specified'}\nValidity: ${details.quote_validity || 'Not specified'}\nNegotiation: ${details.negotiation_status || 'Pending'}`
          : details.quotation_pdf ? 'Quotation shared' : 'No quotation uploaded';
      case 'sale-completed':
        return isExpanded
          ? `Invoice: ${details.invoice_pdf ? 'Generated' : 'Not uploaded'}\nSale amount: ${details.sale_amount ? `₹${Number(details.sale_amount).toLocaleString()}` : 'Not specified'}\nPayment status: ${details.payment_status || 'Pending'}\nDelivery: ${details.delivery_status || 'Pending'}`
          : details.invoice_pdf ? `Sale completed - ₹${Number(details.sale_amount || 0).toLocaleString()}` : 'No invoice uploaded';
      case 'dropout':
        return `Dropped on: ${details.dropped_on || 'Date not specified'}\nReason: ${details.drop_reason || 'No reason provided'}`;
      default:
        return stage.content;
    }
  };

  const getStageData = () => {
    const details = lead?.details || {};
    const currentStage = lead?.stage;
    const isDropout = currentStage === 'dropout' || !!(details.dropped_on || details.drop_reason);
    const getLastSuccessfulStage = () => {
      if (details.demo_by || details.demo_date) return 'demo';
      if (details.followed_by || details.last_call) return 'follow-up';
      return 'follow-up';
    };
    const lastSuccessfulStage = isDropout ? getLastSuccessfulStage() : null;

    const baseStages = [
      { key: 'follow-up', title: 'Follow-Up', isCurrent: currentStage === 'follow-up', isCompleted: ['demo', 'pre-sales', 'sale-completed'].includes(currentStage) || (isDropout && ['demo', 'pre-sales'].includes(lastSuccessfulStage)), isHighlight: currentStage === 'follow-up' },
      { key: 'demo', title: 'Demo Scheduled', isCurrent: currentStage === 'demo', isCompleted: ['pre-sales', 'sale-completed'].includes(currentStage) || (isDropout && lastSuccessfulStage === 'demo'), isHighlight: currentStage === 'demo' },
      { key: 'pre-sales', title: 'Pre-Sales', isCurrent: currentStage === 'pre-sales', isCompleted: ['sale-completed'].includes(currentStage), isHighlight: currentStage === 'pre-sales' },
      { key: 'sale-completed', title: 'Sale Completed', isCurrent: currentStage === 'sale-completed', isCompleted: currentStage === 'sale-completed', isHighlight: currentStage === 'sale-completed' }
    ];

    if (isDropout && (details.dropped_on || details.drop_reason)) {
      const stageOrder = ['follow-up', 'demo', 'pre-sales', 'sale-completed'];
      const insertIndex = Math.max(stageOrder.indexOf(lastSuccessfulStage) + 1, 1);
      const dropoutStage = {
        key: 'dropout',
        title: 'Lead Dropped Out',
        isCurrent: false,
        isCompleted: false,
        isHighlight: false,
        isDropout: true,
      };
      baseStages.splice(insertIndex, 0, dropoutStage);
      return baseStages.slice(0, insertIndex + 1);
    }

    return baseStages;
  };

  const renderTimelineItem = (item, index, stages) => {
    const isLast = index === stages.length - 1;
    const isBeforeDropout = !isLast && stages[index + 1]?.isDropout;
    const shouldBeExpanded = item.isDropout || expandedCardKey === item.key;
    const canExpand = !item.isDropout && (item.isCompleted || item.isHighlight);

    return (
      <View key={item.key} style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          {!isLast && <View style={[styles.timelineLine, (item.isDropout || isBeforeDropout) && styles.timelineLineDropout]} />}
          <View style={item.isCurrent ? styles.outerDotRing : null}>
            <View style={[
              styles.timelineDot,
              item.isCompleted && styles.timelineDotCompleted,
              item.isCurrent && styles.timelineDotCurrent,
              item.isDropout && styles.timelineDotDropout,
            ]}>
              {item.isCompleted && <Text style={styles.dotIcon}>✓</Text>}
              {item.isDropout && <Text style={styles.dotIcon}>✕</Text>}
            </View>
          </View>
        </View>
        <View style={styles.timelineContent}>
          <TouchableOpacity
            onPress={() => canExpand && toggleCardExpansion(item.key)}
            activeOpacity={canExpand ? 0.7 : 1}
          >
            <View style={[
              styles.timelineCard,
              shouldBeExpanded && styles.timelineCardExpanded,
              item.isHighlight && shouldBeExpanded && styles.timelineCardHighlight,
              item.isDropout && styles.timelineCardDropout,  // ⬅ keep this LAST to override others
            ]}>

              <View style={styles.cardHeader}>
                <Text style={[
                  styles.cardTitle,
                  item.isHighlight && shouldBeExpanded && styles.cardTitleHighlight,
                  item.isDropout && styles.cardTitleDropout,
                ]}>
                  {item.title}
                </Text>
                {canExpand && (
                  <TouchableOpacity onPress={() => toggleCardExpansion(item.key)}>
                    <AntDesign
                      name={shouldBeExpanded ? "up" : "down"}
                      size={16}
                      color="#666"
                    />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[
                styles.cardContent,
                item.isDropout && styles.cardContentDropout
              ]}>
                {getStageContent(item, shouldBeExpanded)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const openPDF = (url) => {
    if (!url) return;
    Linking.canOpenURL(url).then(supported => supported && Linking.openURL(url)).catch(() => Alert.alert("Invalid link"));
  };

  const renderStageDetails = () => {
    if (!lead?.details) return null;
    return (
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Stage Details</Text>
        {Object.entries(lead.details).map(([key, value]) => (
          <View key={key} style={{ marginBottom: 10 }}>
            <Text style={styles.infoText}>
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
            </Text>
            {typeof value === 'string' && value.includes('.pdf') ? (
              <TouchableOpacity onPress={() => openPDF(value)}>
                <Text style={[styles.infoText, { color: '#007AFF' }]}>📄 View PDF</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.infoText}>{String(value)}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderTimeline = () => {
    const stages = getStageData();
    return (
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineTitle}>Lead Journey</Text>
        <View style={styles.timelineList}>
          {stages.map((item, index) => renderTimelineItem(item, index, stages))}
        </View>
      </View>
    );
  };

  if (!lead) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ffbb08" />
        <Text>Loading lead details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.Nav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <AntDesign name="left" size={20} color="#27375d" />
        </TouchableOpacity>
        <Text style={styles.title}>Lead Details</Text>
      </View>

      <FlatList
        ListHeaderComponent={
          <View>
            {renderTimeline()}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Lead Information</Text>
              <Text style={styles.infoText}>Company Name: {lead.company_name}</Text>
              <Text style={styles.infoText}>Contact Person: {lead.contact_name}</Text>
              <Text style={styles.infoText}>Email: {lead.email}</Text>
              <Text style={styles.infoText}>Phone: {lead.phone}</Text>
              <Text style={styles.infoText}>Status: {lead.stage}</Text>
            </View>
            {renderStageDetails()}
          </View>
        }
        data={[]}
        keyExtractor={() => 'dummy'}
        renderItem={null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  Nav: {
    backgroundColor: '#ffbb08',
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backIcon: { marginTop: 3 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27375d',
  },
  loaderContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  timelineContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 3,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#27375d',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  timelineList: { paddingLeft: 8 },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    width: 20,
    alignItems: 'center',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 20,
    bottom: -20,
    width: 2,
    backgroundColor: '#ffbb08',
  },
  timelineLineDropout: {
    backgroundColor: '#d32f2f',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e5e5ea',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineDotCompleted: { backgroundColor: '#ffbb08' },
  timelineDotCurrent: { backgroundColor: '#ffbb08' },
  timelineDotDropout: {
    backgroundColor: '#d32f2f',
    borderWidth: 2,
    borderColor: '#ffcdd2',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dropoutIcon: {
    fontSize: 12,
    color: '#fff',
  },
  timelineContent: { flex: 1, marginLeft: 16 },
  timelineCard: {
    backgroundColor: '#fdfdfd',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    // elevation: 1,
  },
  timelineCardHighlight: {
    backgroundColor: '#fff9d6',  // premium soft yellow
    borderColor: '#ffbb08',
    borderWidth: 1.5,
    shadowColor: '#ffbb08',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  timelineCardDropout: {
    backgroundColor: '#ffebee',     // soft red tint
    borderColor: '#d32f2f',         // deep red border
    borderWidth: 1.5,
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineCardExpanded: {
    backgroundColor: '#fff9d6',  // premium soft yellow
    borderColor: '#ffbb08',
    borderWidth: 1.5,
    shadowColor: '#ffbb08',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1c1c1e' },
  cardTitleHighlight: { color: '#27375d' },
  cardTitleDropout: { color: '#d32f2f' },
  cardContent: {
    fontSize: 14,
    color: '#6d6d80',
    lineHeight: 20,
    marginTop: 4,
  },
  cardContentDropout: {
    color: '#d32f2f',
    fontWeight: '500',
  },
  infoSection: {
    margin: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27375d',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  dotIcon: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  outerDotRing: {
  width: 26,
  height: 26,
  borderRadius: 13,
  backgroundColor: '#ffbb0820', // light translucent yellow
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 2,
},
});