import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, interpolate,
} from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import { Theme } from '../../theme/tokens';
import { TicketService } from '../../services/TicketService';
import { TicketDetail } from '../../models/Ticket';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const TicketDetailScreen = ({ navigation, route }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotateY = useSharedValue(0);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchTicket();
  }, [route.params?.ticketId]);

  const fetchTicket = async () => {
    const ticketId = route.params?.ticketId;
    if (!ticketId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await TicketService.getTicketDetail(ticketId);
      if (res.success) {
        setTicket(res.data);
      }
    } catch (error: any) {
      console.log('Error fetching ticket detail:', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const flipCard = () => {
    const nextFlipped = !isFlipped;
    rotateY.value = withTiming(nextFlipped ? 180 : 0, { duration: 600 });
    setIsFlipped(nextFlipped);
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotateY.value}deg` },
    ],
    backfaceVisibility: 'hidden',
    opacity: interpolate(rotateY.value, [0, 90, 180], [1, 0, 0]),
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotateY.value + 180}deg` },
    ],
    backfaceVisibility: 'hidden',
    opacity: interpolate(rotateY.value, [0, 90, 180], [0, 0, 1]),
    position: 'absolute',
    top: 0, left: 0, right: 0,
  }));

  if (loading || !ticket) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
           <Text style={{color: Theme.colors.textPrimary}}>{loading ? 'Đang tải...' : 'Không tìm thấy vé'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHI TIẾT VÉ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 3D Flip Card */}
        <View style={styles.cardContainer}>
          <TouchableOpacity onPress={flipCard} activeOpacity={0.9}>
            <View style={styles.cardWrapper}>
              {/* FRONT */}
              <Animated.View style={[styles.ticketCard, frontStyle]}>
                {/* Card Header */}
                <View style={styles.ticketHeader}>
                  <View>
                    <Text style={styles.ticketBrand}>CinemaX</Text>
                    <Text style={styles.ticketSubBrand}>Electronic Ticket</Text>
                  </View>
                  <View style={styles.paidBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={Theme.colors.success} />
                    <Text style={styles.paidText}>Đã TT</Text>
                  </View>
                </View>

                {/* Tear Line */}
                <View style={styles.tearLine}>
                  <View style={styles.tearCircleLeft} />
                  <View style={styles.tearDash} />
                  <View style={styles.tearCircleRight} />
                </View>

                {/* Movie Info */}
                <View style={styles.movieSection}>
                  <Text style={styles.movieTitleTicket}>{ticket.movieTitle}</Text>
                  <View style={styles.movieBadgesRow}>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>{ticket.ageRating}</Text>
                    </View>
                    <Text style={styles.durationText}>{ticket.durationMinutes} phút</Text>
                  </View>
                </View>

                {/* Ticket Details Grid */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color="#888" />
                    <Text style={styles.detailLabel}>Ngày</Text>
                    <Text style={styles.detailValue}>{ticket.showDate}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={14} color="#888" />
                    <Text style={styles.detailLabel}>Giờ</Text>
                    <Text style={styles.detailValue}>{ticket.startTime}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={14} color="#888" />
                    <Text style={styles.detailLabel}>Rạp</Text>
                    <Text style={styles.detailValue} numberOfLines={2}>{ticket.cinemaName.replace('CinemaX ', '')}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="tv-outline" size={14} color="#888" />
                    <Text style={styles.detailLabel}>Phòng</Text>
                    <Text style={styles.detailValue}>{ticket.roomName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="grid-outline" size={14} color="#888" />
                    <Text style={styles.detailLabel}>Ghế</Text>
                    <Text style={[styles.detailValue, { color: Theme.colors.gold }]}>{ticket.seatCode}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={14} color="#888" />
                    <Text style={styles.detailLabel}>Giá</Text>
                    <Text style={[styles.detailValue, { color: Theme.colors.warning }]}>
                      {ticket.totalPrice.toLocaleString('vi-VN')}₫
                    </Text>
                  </View>
                </View>

                {/* Flip Hint */}
                <TouchableOpacity style={styles.flipHint} onPress={flipCard}>
                  <Ionicons name="qr-code-outline" size={16} color={Theme.colors.warning} />
                  <Text style={styles.flipHintText}>🔄 Chạm để xem mã QR</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* BACK - QR Side */}
              <Animated.View style={[styles.ticketCard, styles.ticketCardBack, backStyle]}>
                <Text style={styles.qrTitle}>MÃ VÉ ĐIỆN TỬ</Text>
                <Text style={styles.qrSubtitle}>Đưa mã này cho nhân viên kiểm soát</Text>

                <View style={styles.qrBox}>
                  <QRCode
                    value={JSON.stringify({ code: ticket.ticketCode || ticket.id, ts: Date.now(), v: '1' })}
                    size={180}
                    color="#000000"
                    backgroundColor="#ffffff"
                  />
                </View>

                <View style={styles.ticketCodeRow}>
                  <Text style={styles.ticketCode}>#CX{ticket.id.toString().padStart(6, '0')}</Text>
                </View>

                <TouchableOpacity style={styles.flipHint} onPress={flipCard}>
                  <Ionicons name="card-outline" size={16} color={Theme.colors.warning} />
                  <Text style={styles.flipHintText}>🔄 Chạm để lật lại</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </TouchableOpacity>
        </View>



        {/* Purchase Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin giao dịch</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã giao dịch</Text>
            <Text style={styles.infoValue}>#CX{ticket.id.toString().padStart(6, '0')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày mua</Text>
            <Text style={styles.infoValue}>{ticket.bookedAt}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('MyTickets')}>
            <Ionicons name="ticket-outline" size={18} color={Theme.colors.warning} />
            <Text style={styles.secondaryBtnText}>Về danh sách vé</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn}>
            <Ionicons name="document-text-outline" size={18} color="#000" />
            <Text style={styles.primaryBtnText}>Yêu cầu Hóa đơn VAT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1, borderBottomColor: Theme.colors.cardBorder,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: Theme.colors.textPrimary, fontSize: 16, fontWeight: 'bold' },

  cardContainer: { paddingHorizontal: Theme.spacing.md, paddingTop: Theme.spacing.xl },
  cardWrapper: { height: 430, position: 'relative' },

  ticketCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    padding: 20,
    height: 430,
    ...Theme.shadows.strong,
  },
  ticketCardBack: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  ticketBrand: { color: Theme.colors.textPrimary, fontSize: 18, fontWeight: '800' },
  ticketSubBrand: { color: Theme.colors.textMuted, fontSize: 11 },
  paidBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Theme.colors.successLight, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Theme.radius.pill,
  },
  paidText: { color: Theme.colors.success, fontSize: 11, fontWeight: 'bold' },

  tearLine: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  tearCircleLeft: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Theme.colors.background, marginLeft: -20,
  },
  tearDash: {
    flex: 1, height: 1,
    borderStyle: 'dashed', borderWidth: 1, borderColor: Theme.colors.cardBorder,
    marginHorizontal: 8,
  },
  tearCircleRight: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Theme.colors.background, marginRight: -20,
  },

  movieSection: { marginBottom: 16 },
  movieTitleTicket: { color: Theme.colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  movieBadgesRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingBadge: { backgroundColor: Theme.colors.badgeC13, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  ratingText: { color: Theme.colors.textPrimary, fontSize: 10, fontWeight: 'bold' },
  durationText: { color: Theme.colors.textSecondary, fontSize: 12 },

  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  detailItem: { width: '30%', gap: 3 },
  detailLabel: { color: Theme.colors.textMuted, fontSize: 10 },
  detailValue: { color: Theme.colors.textPrimary, fontSize: 13, fontWeight: '600' },

  flipHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderTopWidth: 1, borderTopColor: '#2d2d44', paddingTop: 12,
  },
  flipHintText: { color: Theme.colors.warning, fontSize: 12 },

  // QR Back
  qrTitle: { color: Theme.colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  qrSubtitle: { color: Theme.colors.textSecondary, fontSize: 12, marginBottom: 24, textAlign: 'center' },
  qrBox: {
    backgroundColor: '#fff', padding: 16, borderRadius: 12,
    marginBottom: 20,
  },
  ticketCodeRow: { marginBottom: 20 },
  ticketCode: {
    color: Theme.colors.warning, fontSize: 18, fontWeight: '800',
    letterSpacing: 3, textAlign: 'center',
  },

  section: {
    marginHorizontal: Theme.spacing.md, marginTop: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 16, borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  sectionTitle: { color: Theme.colors.warning, fontSize: 14, fontWeight: 'bold', marginBottom: 12 },

  concessionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  concessionName: { flex: 1, color: '#ddd', fontSize: 14 },
  concessionPrice: { color: Theme.colors.warning, fontSize: 14, fontWeight: 'bold' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  infoLabel: { color: Theme.colors.textSecondary, fontSize: 13 },
  infoValue: { color: Theme.colors.textPrimary, fontSize: 13, fontWeight: '600' },

  actions: { paddingHorizontal: Theme.spacing.md, marginTop: Theme.spacing.xl, gap: 12 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Theme.colors.warning, borderRadius: Theme.radius.lg, paddingVertical: 16,
  },
  primaryBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: Theme.colors.warning, borderRadius: Theme.radius.lg, paddingVertical: 14,
  },
  secondaryBtnText: { color: Theme.colors.warning, fontWeight: 'bold', fontSize: 15 },
});
