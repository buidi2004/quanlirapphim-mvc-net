import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TicketService } from '../../services/TicketService';
import { TicketHistoryItem } from '../../models/Ticket';

export const MyTicketsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = React.useState<TicketHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await TicketService.getMyTickets();
      if (res.success) {
        setTickets(res.data);
      }
    } catch (error: any) {
      console.log('Error fetching tickets:', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const renderTicket = ({ item }: { item: TicketHistoryItem }) => (
    <TouchableOpacity style={styles.ticketCard} onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}>
      <View style={styles.cardHeader}>
        <View style={styles.brandRow}>
          <Ionicons name="ticket" size={16} color={Theme.colors.gold} />
          <Text style={styles.brandText}>CinemaX Ticket</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status === 'paid' ? '✅ Đã TT' : '⏳ Chờ TT'}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.movieTitle}>{item.movie_title}</Text>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Ngày chiếu</Text>
            <Text style={styles.infoValue}>📅 {item.show_date}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Giờ chiếu</Text>
            <Text style={styles.infoValue}>⏰ {item.start_time}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Ghế</Text>
            <Text style={styles.infoValueGold}>💺 {item.seat_code}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Giá vé</Text>
            <Text style={styles.infoValue}>💰 {item.total_price.toLocaleString('vi-VN')}₫</Text>
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
          <Text style={styles.footerValue}>#CX{item.id.toString().padStart(6, '0')}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.footerLabel}>Mua lúc:</Text>
          <Text style={styles.footerValue}>{item.booked_at}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.invoiceBtn}
        onPress={() => {}}
      >
        <Ionicons name="document-text-outline" size={16} color={Theme.colors.textPrimary} />
        <Text style={styles.invoiceText}>Yêu cầu Hóa đơn</Text>
      </TouchableOpacity>
    </TouchableOpacity>
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

      {loading ? (
        <View style={styles.emptyContainer}>
           <Text style={{color: '#fff'}}>Đang tải...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="ticket-outline" size={80} color="#444" />
          <Text style={styles.emptyText}>Bạn chưa mua vé nào</Text>
          <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('MainDrawer')}>
            <Text style={styles.bookBtnText}>Đặt Vé Ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={item => item.id.toString()}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: Theme.colors.textSecondary,
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
    backgroundColor: Theme.colors.surface,
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
    color: Theme.colors.textMuted,
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
    color: Theme.colors.textSecondary,
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
