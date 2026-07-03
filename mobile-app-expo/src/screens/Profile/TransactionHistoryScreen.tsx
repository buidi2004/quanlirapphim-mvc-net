import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'paid', label: 'Đã thanh toán' },
  { id: 'holding', label: 'Đang giữ chỗ' },
  { id: 'cancelled', label: 'Đã hủy' },
];

const MOCK_TX = [
  {
    id: '#CX000123',
    title: 'Avengers Endgame',
    date: '10/07',
    time: '15:30',
    room: 'Phòng 3',
    seat: 'C3',
    price: 90000,
    status: 'paid',
    createdAt: '05/07 10:30',
  },
  {
    id: '#CX000124',
    title: 'Dune: Part Two',
    date: '12/07',
    time: '19:30',
    room: 'Phòng IMAX 1',
    seat: 'E1, E2',
    price: 180000,
    status: 'holding',
    createdAt: '10/07 08:15',
  },
  {
    id: '#CX000120',
    title: 'Kung Fu Panda 4',
    date: '01/07',
    time: '10:00',
    room: 'Phòng 5',
    seat: 'A1, A2, A3',
    price: 250000,
    status: 'cancelled',
    createdAt: '28/06 14:20',
  }
];

export const TransactionHistoryScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState('all');
  const insets = useSafeAreaInsets();

  const filteredTx = MOCK_TX.filter(tx => activeTab === 'all' || tx.status === activeTab);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <View style={[styles.statusBadge, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}><Text style={[styles.statusText, { color: '#4CAF50' }]}>✅ Đã TT</Text></View>;
      case 'holding':
        return <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 193, 7, 0.2)' }]}><Text style={[styles.statusText, { color: Theme.colors.gold }]}>⏳ Đang giữ</Text></View>;
      case 'cancelled':
        return <View style={[styles.statusBadge, { backgroundColor: 'rgba(244, 67, 54, 0.2)' }]}><Text style={[styles.statusText, { color: '#F44336' }]}>❌ Đã hủy</Text></View>;
      default:
        return null;
    }
  };

  const renderTxItem = ({ item }: { item: typeof MOCK_TX[0] }) => (
    <View style={styles.txCard}>
      <View style={styles.txHeader}>
        <View>
          <Text style={styles.txTitle}>{item.title}</Text>
          <Text style={styles.txSub}>📅 {item.date} ⏰ {item.time}</Text>
          <Text style={styles.txSub}>🚪 {item.room} · Ghế {item.seat}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {renderStatusBadge(item.status)}
          <Text style={styles.txPrice}>{item.price.toLocaleString('vi-VN')}₫</Text>
          <Text style={styles.txDate}>{item.createdAt}</Text>
        </View>
      </View>
      <View style={styles.txFooter}>
        <Text style={styles.txId}>Mã GD: {item.id}</Text>
        {item.status === 'paid' && (
          <TouchableOpacity style={styles.detailBtn}>
            <Text style={styles.detailBtnText}>Xem vé</Text>
            <Ionicons name="chevron-forward" size={14} color={Theme.colors.gold} />
          </TouchableOpacity>
        )}
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
          <Text style={styles.summaryLabel}>Tổng đã chi tiêu (2026)</Text>
          <Text style={styles.summaryValue}>1.250.000₫</Text>
        </View>
      </View>

      {filteredTx.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={60} color="#333" />
          <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTx}
          keyExtractor={item => item.id}
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
    borderBottomColor: '#222',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#222',
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
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderColor: Theme.colors.gold,
  },
  tabText: {
    color: '#aaa',
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
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  summaryLabel: {
    color: '#888',
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
    color: '#666',
    marginTop: 16,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: Theme.spacing.md,
  },
  txCard: {
    backgroundColor: '#111',
    borderRadius: Theme.radius.lg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  txTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  txSub: {
    color: '#aaa',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  txDate: {
    color: '#666',
    fontSize: 12,
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    borderBottomLeftRadius: Theme.radius.lg,
    borderBottomRightRadius: Theme.radius.lg,
  },
  txId: {
    color: '#666',
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
