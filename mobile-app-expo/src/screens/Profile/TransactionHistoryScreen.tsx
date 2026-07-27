import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TicketService } from '../../services/TicketService';
import { TicketHistoryItem } from '../../models/Ticket';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'paid', label: 'Đã thanh toán' },
  { id: 'holding', label: 'Đang giữ chỗ' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export const TransactionHistoryScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('all');
  const [transactions, setTransactions] = useState<TicketHistoryItem[]>([]);
  const [summary, setSummary] = useState({ year: new Date().getFullYear(), totalSpent: 0 });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const [res, summaryRes] = await Promise.all([
        TicketService.getMyTickets().catch(e => { console.log(e); return { success: false, data: [] }; }),
        TicketService.getTicketSummary().catch(e => { console.log(e); return { success: false, data: undefined }; })
      ]);
      if (res.success) {
        setTransactions(res.data);
      }
      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (error: any) {
      console.log('Error fetching transactions:', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTx = transactions.filter(tx => activeTab === 'all' || tx.status === activeTab);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <View style={[styles.statusBadge, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}><Text style={[styles.statusText, { color: '#4CAF50' }]}>✅ Đã TT</Text></View>;
      case 'holding':
        return <View style={[styles.statusBadge, { backgroundColor: 'rgba(111, 66, 193, 0.2)' }]}><Text style={[styles.statusText, { color: Theme.colors.gold }]}>⏳ Đang giữ</Text></View>;
      case 'cancelled':
        return <View style={[styles.statusBadge, { backgroundColor: 'rgba(244, 67, 54, 0.2)' }]}><Text style={[styles.statusText, { color: '#F44336' }]}>❌ Đã hủy</Text></View>;
      default:
        return null;
    }
  };

  const renderTxItem = ({ item }: { item: TicketHistoryItem }) => (
    <View style={styles.txCard}>
      <View style={styles.txHeader}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.txTitle} numberOfLines={1}>{item.movie_title}</Text>
          <Text style={styles.txSub}>📅 {item.show_date} ⏰ {item.start_time}</Text>
          <Text style={styles.txSub}>Ghế: {item.seat_code}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {renderStatusBadge(item.status)}
          <Text style={styles.txPrice}>{item.total_price.toLocaleString('vi-VN')}₫</Text>
          <Text style={styles.txDate}>{item.booked_at}</Text>
        </View>
      </View>
      <View style={styles.txFooter}>
        <Text style={styles.txId}>Mã GD: #CX{item.id.toString().padStart(6, '0')}</Text>
        <TouchableOpacity style={styles.detailBtn} onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}>
          <Text style={styles.detailBtnText}>Chi tiết</Text>
          <Ionicons name="chevron-forward" size={14} color={Theme.colors.gold} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LỊCH SỬ GIAO DỊCH</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {TABS.map(tab => (
            <TouchableOpacity 
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.summaryCard}>
        <Ionicons name="wallet-outline" size={24} color={Theme.colors.gold} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.summaryLabel}>Tổng đã chi tiêu ({summary.year})</Text>
          <Text style={styles.summaryValue}>{summary.totalSpent.toLocaleString('vi-VN')}₫</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={Theme.colors.gold} />
        </View>
      ) : filteredTx.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={60} color="#333" />
          <Text style={styles.emptyText}>Không có giao dịch nào</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTx}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 20) }]}
          showsVerticalScrollIndicator={false}
          renderItem={renderTxItem}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
  },
  tabsContent: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  tabActive: {
    backgroundColor: 'rgba(111, 66, 193, 0.1)',
    borderColor: Theme.colors.gold,
  },
  tabText: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
  },
  tabTextActive: {
    color: Theme.colors.gold,
    fontWeight: 'bold',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Theme.spacing.md,
    padding: 16,
    backgroundColor: 'rgba(111, 66, 193, 0.05)',
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(111, 66, 193, 0.2)',
  },
  summaryLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: Theme.colors.gold,
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Theme.colors.textMuted,
    marginTop: 16,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: Theme.spacing.md,
  },
  txCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
  },
  txTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  txSub: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  txPrice: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  txDate: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Theme.colors.surface,
    borderBottomLeftRadius: Theme.radius.lg,
    borderBottomRightRadius: Theme.radius.lg,
  },
  txId: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailBtnText: {
    color: Theme.colors.gold,
    fontSize: 13,
    fontWeight: 'bold',
  }
});
