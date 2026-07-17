import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { Concession, ConcessionItem } from '../../components/features/ConcessionItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Seat } from '../../models/Booking';

import { BookingService } from '../../services/BookingService';

export const ConcessionScreen = ({ route, navigation }: any) => {
  const showtimeId = route.params?.showtimeId || 0;
  const selectedSeats = route.params?.selectedSeats || [];
  const ticketIds = route.params?.ticketIds || [];
  const insets = useSafeAreaInsets();
  
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [timeLeft, setTimeLeft] = useState(route.params?.remainingSeconds || 15 * 60);
  const [concessions, setConcessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConcessions();
  }, []);

  const fetchConcessions = async () => {
    try {
      setLoading(true);
      const res = await BookingService.getConcessions();
      if (res.success && res.data) {
        setConcessions(res.data.map((x: any) => ({
          id: x.id.toString(),
          name: x.name,
          description: x.description,
          price: x.price,
          originalPrice: x.price,
          imageUrl: x.imageUrl
        })));
      }
    } catch (e) {
      console.log('Error fetching concessions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer);
          Alert.alert('Hết thời gian', 'Phiên giữ ghế của bạn đã hết hạn.', [
            {
              text: 'Về trang chủ',
              onPress: () => navigation.reset({ index: 0, routes: [{ name: 'MainDrawer' }] }),
            }
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const totalConcessionPrice = concessions.reduce((sum, item) => {
    return sum + (item.price * (quantities[item.id] || 0));
  }, 0);

  const seatPrice = (selectedSeats as Seat[]).reduce((sum, seat) => sum + seat.price, 0);
  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleNext = () => {
    // Build name map: { [id]: name } để PaymentScreen hiển thị tên sản phẩm
    const concessionNames: { [key: string]: string } = {};
    concessions.forEach((item: any) => {
      concessionNames[item.id] = item.name;
    });

    navigation.navigate('Payment', {
      selectedSeats,
      showtimeId,
      ticketIds,
      concessions: quantities,
      concessionNames,
      seatPrice,
      concessionPrice: totalConcessionPrice,
      remainingSeconds: timeLeft,
      movieTitle: route.params?.movieTitle,
      roomName: route.params?.roomName,
      showDate: route.params?.showDate,
      startTime: route.params?.startTime,
      cinemaName: route.params?.cinemaName
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHỌN BẮP NƯỚC</Text>
        <View style={styles.timerBadge}>
          <Ionicons name="time-outline" size={16} color={Theme.colors.gold} />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={{color: '#fff', textAlign: 'center'}}>Đang tải danh sách bắp nước...</Text>
        ) : (
          concessions.map(item => (
            <ConcessionItem 
              key={item.id}
              item={item}
              quantity={quantities[item.id] || 0}
              onQuantityChange={(delta) => handleQuantityChange(item.id, delta)}
            />
          ))
        )}
      </ScrollView>

      {/* Sticky Bottom */}
      <View style={[styles.stickyBottom, { paddingBottom: Math.max(insets.bottom, Theme.spacing.md) }]}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Ghế ({selectedSeats.length}):</Text>
            <Text style={styles.priceText}>{seatPrice.toLocaleString('vi-VN')}₫</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.summaryLabel}>Bắp nước ({totalItems}):</Text>
            <Text style={styles.priceText}>{totalConcessionPrice.toLocaleString('vi-VN')}₫</Text>
          </View>
        </View>
        
        <View style={styles.actionRow}>
          {totalConcessionPrice === 0 ? (
            <TouchableOpacity style={styles.skipBtn} onPress={handleNext}>
              <Text style={styles.skipBtnText}>BỎ QUA</Text>
              <Ionicons name="arrow-forward" size={16} color="#aaa" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>TIẾP TỤC THANH TOÁN</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
    flex: 1,
    textAlign: 'center',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(111, 66, 193, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(111, 66, 193, 0.3)',
  },
  timerText: {
    color: Theme.colors.gold,
    fontWeight: 'bold',
    fontSize: 12,
  },
  scrollContent: {
    padding: Theme.spacing.md,
  },
  stickyBottom: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.cardBorder,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  summaryLabel: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  priceText: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  skipBtnText: {
    color: Theme.colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  nextBtn: {
    backgroundColor: Theme.colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: Theme.radius.btn,
    alignItems: 'center',
    flex: 1,
  },
  nextBtnText: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
