import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Modal, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, interpolate,
} from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import { Theme } from '../../theme/tokens';
import { TicketService } from '../../services/TicketService';
import { TicketDetail } from '../../models/Ticket';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useRef } from 'react';
import { apiClient } from '../../api/apiClient';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const TicketDetailScreen = ({ navigation, route }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotateY = useSharedValue(0);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [qrType, setQrType] = useState<'ticket' | 'concession'>('ticket');
  const viewShotRef = useRef<any>(null);

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const flipCard = (type?: 'ticket' | 'concession') => {
    if (type) setQrType(type);
    const nextFlipped = !isFlipped;
    rotateY.value = withTiming(nextFlipped ? 180 : 0, { duration: 600 });
    setIsFlipped(nextFlipped);
  };

  const shareTicket = async () => {
    try {
      setIsSharing(true);
      // Wait for React to hide the buttons
      setTimeout(async () => {
        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture();
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Chia sẻ vé xem phim',
            UTI: 'public.png'
          });
        }
        setIsSharing(false);
      }, 100);
    } catch (e) {
      console.log('Share error', e);
      setIsSharing(false);
    }
  };

  const submitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung đánh giá');
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await apiClient.post(`/movies/${ticket?.movieId}/reviews`, { rating, comment });
      if (res.data?.success) {
        Alert.alert('Thành công', 'Cảm ơn bạn đã đánh giá phim!');
        setReviewModalVisible(false);
      }
    } catch (e) {
      console.log('Error submitting review', e);
      Alert.alert('Lỗi', 'Không thể gửi đánh giá lúc này.');
    } finally {
      setSubmittingReview(false);
    }
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
          <TouchableOpacity onPress={() => flipCard('ticket')} activeOpacity={0.9}>
            <ViewShot ref={viewShotRef} style={styles.cardWrapper} options={{ format: 'png', quality: 1 }}>
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
                {!isSharing && (
                  <View style={styles.flipHint}>
                    <TouchableOpacity style={styles.flipBtn} onPress={() => flipCard('ticket')}>
                      <Ionicons name="qr-code-outline" size={16} color={Theme.colors.warning} />
                      <Text style={styles.flipHintText}>Mã Vé Cửa</Text>
                    </TouchableOpacity>
                    <View style={styles.flipDivider} />
                    <TouchableOpacity style={styles.flipBtn} onPress={() => flipCard('concession')}>
                      <Ionicons name="fast-food-outline" size={16} color={Theme.colors.warning} />
                      <Text style={styles.flipHintText}>Mã Bắp Nước</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>

              {/* BACK - QR Side */}
              <Animated.View style={[styles.ticketCard, styles.ticketCardBack, backStyle]}>
                <Text style={styles.qrTitle}>{qrType === 'concession' ? 'MÃ BẮP NƯỚC' : 'MÃ VÉ ĐIỆN TỬ'}</Text>
                <Text style={styles.qrSubtitle}>Đưa mã này cho nhân viên kiểm soát</Text>

                <View style={styles.qrBox}>
                  <QRCode
                    value={JSON.stringify({ 
                      type: qrType,
                      code: ticket.ticketCode || ticket.id, 
                      ts: Date.now(), 
                      v: '1' 
                    })}
                    size={180}
                    color="#000000"
                    backgroundColor="#ffffff"
                  />
                </View>

                <View style={styles.ticketCodeRow}>
                  <Text style={styles.ticketCode}>#CX{ticket.id.toString().padStart(6, '0')}</Text>
                </View>

                {!isSharing && (
                  <TouchableOpacity style={[styles.flipHint, { borderTopWidth: 0 }]} onPress={() => flipCard()}>
                    <Ionicons name="card-outline" size={16} color={Theme.colors.warning} />
                    <Text style={styles.flipHintText}>🔄 Chạm để lật lại</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
            </ViewShot>
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
          {ticket.status === 'used' && (
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Theme.colors.badgeC13, marginBottom: 12 }]} onPress={() => setReviewModalVisible(true)}>
              <Ionicons name="star" size={18} color="#fff" />
              <Text style={[styles.primaryBtnText, { color: '#fff' }]}>Đánh giá phim</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.primaryBtn} onPress={shareTicket}>
            <Ionicons name="share-social-outline" size={18} color="#000" />
            <Text style={styles.primaryBtnText}>Chia sẻ vé (Lưu ảnh)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('MyTickets')}>
            <Ionicons name="ticket-outline" size={18} color={Theme.colors.warning} />
            <Text style={styles.secondaryBtnText}>Về danh sách vé</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đánh giá phim</Text>
            <Text style={styles.modalSubtitle}>{ticket.movieTitle}</Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons name={star <= rating ? "star" : "star-outline"} size={32} color={Theme.colors.warning} style={{ marginHorizontal: 4 }} />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalCancelBtn]} onPress={() => setReviewModalVisible(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalSubmitBtn]} onPress={submitReview} disabled={submittingReview}>
                {submittingReview ? <ActivityIndicator color="#000" /> : <Text style={styles.modalSubmitText}>Gửi Đánh Giá</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderTopWidth: 1, borderTopColor: '#2d2d44', paddingTop: 12,
  },
  flipBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  flipDivider: {
    width: 1, height: 20, backgroundColor: '#2d2d44',
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

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: Theme.colors.surface, width: '100%', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Theme.colors.cardBorder },
  modalTitle: { color: Theme.colors.textPrimary, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  modalSubtitle: { color: Theme.colors.warning, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  reviewInput: {
    backgroundColor: '#111', color: '#fff', borderRadius: 12, padding: 16,
    height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', marginBottom: 20
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalCancelBtn: { backgroundColor: '#333' },
  modalCancelText: { color: '#fff', fontWeight: 'bold' },
  modalSubmitBtn: { backgroundColor: Theme.colors.warning },
  modalSubmitText: { color: '#000', fontWeight: 'bold' },
});
