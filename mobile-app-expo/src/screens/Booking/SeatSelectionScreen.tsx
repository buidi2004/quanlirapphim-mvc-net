import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { BookingService } from '../../services/BookingService';
import { SeatMapResponse, Seat } from '../../models/Booking';
import { SeatItem } from '../../components/features/SeatItem';
import { styles } from './styles';
import { Theme } from '../../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SeatSelectionScreen = ({ route, navigation }: any) => {
  const { showtimeId } = route.params;
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<SeatMapResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  useEffect(() => {
    fetchSeatMap();
  }, [showtimeId]);

  const fetchSeatMap = async () => {
    try {
      setLoading(true);
      const res = await BookingService.getSeatMap(showtimeId);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || 'Lỗi lấy sơ đồ ghế');
      }
    } catch (e) {
      setError('Mất kết nối Internet.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seat: Seat) => {
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.code === seat.code);
      if (exists) {
        return prev.filter(s => s.code !== seat.code);
      } else {
        return [...prev, seat];
      }
    });
  };

  const handleNext = () => {
    if (selectedSeats.length === 0) return;
    // Đi tiếp màn hình Bắp nước hoặc Thanh toán
    alert(`Đã giữ ghế thành công: ${selectedSeats.map(s => s.code).join(', ')}. Đang chuyển sang Thanh toán...`);
  };

  if (loading) return (
    <View style={[styles.container, styles.centerContainer]}>
      <ActivityIndicator size="large" color={Theme.colors.accent} />
    </View>
  );

  if (error || !data) return (
    <View style={[styles.container, styles.centerContainer]}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  // Group seats by row for rendering
  const rows: { [key: string]: Seat[] } = {};
  data.seats.forEach(seat => {
    if (!rows[seat.row]) rows[seat.row] = [];
    rows[seat.row].push(seat);
  });
  
  // Sort rows alphabetically (A, B, C...)
  const rowKeys = Object.keys(rows).sort();

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{data.movieTitle}</Text>
        <Text style={styles.headerSubtitle}>
          {data.cinemaName} • {data.roomName} • {data.startTime}
        </Text>
      </View>

      <View style={styles.mapContainer}>
        {/* SKILL: Scroll ngang và dọc để lướt sơ đồ 2D trên mobile hẹp */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Đồ họa Màn hình chiếu */}
            <View style={styles.screenArea}>
              <View style={styles.screenLine} />
              <Text style={styles.screenText}>MÀN HÌNH</Text>
            </View>

            {/* Render ma trận ghế */}
            {rowKeys.map(row => (
              <View key={row} style={styles.rowContainer}>
                <Text style={styles.rowLabel}>{row}</Text>
                {rows[row].sort((a, b) => a.col - b.col).map(seat => (
                  <SeatItem 
                    key={seat.code}
                    seat={seat}
                    isSelected={selectedSeats.some(s => s.code === seat.code)}
                    onSelect={toggleSeat}
                  />
                ))}
                <Text style={styles.rowLabel}>{row}</Text>
              </View>
            ))}

          </ScrollView>
        </ScrollView>
      </View>

      {/* SKILL: Sticky Bottom Order Summary */}
      <View style={[styles.stickyBottom, { paddingBottom: Math.max(insets.bottom, Theme.spacing.md) }]}>
        <View style={styles.summaryRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>Ghế đang chọn:</Text>
            <Text style={styles.seatsText} numberOfLines={1}>
              {selectedSeats.length > 0 ? selectedSeats.map(s => s.code).join(', ') : 'Chưa chọn'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', flex: 1 }}>
            <Text style={styles.summaryLabel}>Tổng cộng:</Text>
            <Text style={styles.priceText}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.bookButton, selectedSeats.length === 0 && { opacity: 0.5 }]}
          disabled={selectedSeats.length === 0}
          onPress={handleNext}
        >
          <Text style={styles.bookButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
