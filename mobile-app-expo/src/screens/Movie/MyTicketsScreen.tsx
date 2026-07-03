import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_TICKETS = [
  {
    id: '#CX000123',
    movieTitle: 'Avengers Endgame',
    date: '10/07',
    time: '15:30',
    seat: 'C3',
    price: 90000,
    status: 'paid',
    purchaseTime: '09/07 10:30',
  },
  {
    id: '#CX000124',
    movieTitle: 'Dune: Part Two',
    date: '12/07',
    time: '19:30',
    seat: 'E1, E2',
    price: 180000,
    status: 'paid',
    purchaseTime: '10/07 08:15',
  }
];

export const MyTicketsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const renderTicket = ({ item }: { item: typeof MOCK_TICKETS[0] }) => (
    <View style={styles.ticketCard}>
      <View style={styles.cardHeader}>
        <View style={styles.brandRow}>
          <Ionicons name="ticket" size={16} color={Theme.colors.gold} />
          <Text style={styles.brandText}>CinemaX Ticket</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>✅ Đã TT</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.movieTitle}>{item.movieTitle}</Text>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Ngày chiếu</Text>
            <Text style={styles.infoValue}>📅 {item.date}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Giờ chiếu</Text>
            <Text style={styles.infoValue}>⏰ {item.time}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Ghế</Text>
            <Text style={styles.infoValueGold}>💺 {item.seat}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Giá vé</Text>
            <Text style={styles.infoValue}>💰 {item.price.toLocaleString('vi-VN')}₫</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider}>
        <View style={styles.cutoutLeft} />
        <View style={styles.dashedLine} />
        <View style={styles.cutoutRight} />
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.footerLabel}>Mã Giao Dịch:</Text>
          <Text style={styles.footerValue}>{item.id}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.footerLabel}>Mua lúc:</Text>
          <Text style={styles.footerValue}>{item.purchaseTime}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.invoiceBtn}
        onPress={() => {}}
      >
        <Ionicons name="document-text-outline" size={16} color={Theme.colors.textPrimary} />
        <Text style={styles.invoiceText}>Yêu cầu Hóa đơn</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VÉ CỦA TÔI</Text>
        <View style={{ width: 40 }} />
      </View>

      {MOCK_TICKETS.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="ticket-outline" size={80} color="#444" />
          <Text style={styles.emptyText}>Bạn chưa mua vé nào</Text>
          <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.bookBtnText}>Đặt Vé Ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={MOCK_TICKETS}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 20) }]}
          showsVerticalScrollIndicator={false}
          renderItem={renderTicket}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  bookBtn: {
    backgroundColor: Theme.colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Theme.radius.btn,
  },
  bookBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    padding: Theme.spacing.md,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: Theme.radius.lg,
    marginBottom: Theme.spacing.lg,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#222',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    color: Theme.colors.gold,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statusBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 16,
    backgroundColor: '#fff',
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoValueGold: {
    color: '#d4af37', // Darker gold for white bg
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    backgroundColor: '#fff',
    position: 'relative',
  },
  cutoutLeft: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Theme.colors.background,
    position: 'absolute',
    left: -15,
    zIndex: 1,
  },
  cutoutRight: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Theme.colors.background,
    position: 'absolute',
    right: -15,
    zIndex: 1,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    marginHorizontal: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  footerLabel: {
    color: '#888',
    fontSize: 10,
    marginBottom: 2,
  },
  footerValue: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#eee',
    gap: 8,
  },
  invoiceText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
  }
});
