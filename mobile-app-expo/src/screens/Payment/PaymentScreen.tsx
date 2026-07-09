import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { Theme } from '../../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Seat } from '../../models/Booking';
import { Image } from 'expo-image';
import { GlassHeader } from '../../components/ui/GlassHeader';
import { BookingService } from '../../services/BookingService';

const PAYMENT_METHODS = [
  { id: 'momo', name: 'Ví MoMo', icon: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' },
  { id: 'zalopay', name: 'ZaloPay', icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png' },
  { id: 'vnpay', name: 'VNPay', icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png' },
  { id: 'card', name: 'Thẻ Visa/Mastercard', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png' },
];

export const PaymentScreen = ({ route, navigation }: any) => {
  const selectedSeats = route.params?.selectedSeats || [];
  const showtimeId = route.params?.showtimeId || 0;
  const ticketIds = route.params?.ticketIds || [];
  const concessions = route.params?.concessions || {};
  const seatPrice = route.params?.seatPrice || 0;
  const concessionPrice = route.params?.concessionPrice || 0;
  const insets = useSafeAreaInsets();
  
  const [timeLeft, setTimeLeft] = useState(12 * 60 + 34); // Mock 12:34
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('momo');
  const [loading, setLoading] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          Alert.alert('Hết thời gian', 'Phiên giữ ghế của bạn đã hết hạn.', [
            { text: 'Quay lại', onPress: () => navigation.navigate('MainTabs') }
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setPromoLoading(true);
    try {
      const res: any = await BookingService.applyPromo({
        code: discountCode,
        subtotal: seatPrice + concessionPrice
      });
      if (res.success && res.data) {
        setDiscountAmount(res.data.discount || 0);
        Alert.alert('Thành công', `Đã áp dụng mã giảm giá: -${(res.data.discount || 0).toLocaleString('vi-VN')}₫`);
      } else {
        setDiscountAmount(0);
        Alert.alert('Lỗi', res.message || 'Mã giảm giá không hợp lệ!');
      }
    } catch (e: any) {
      setDiscountAmount(0);
      Alert.alert('Lỗi', e.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn!');
    } finally {
      setPromoLoading(false);
    }
  };

  const totalAmount = seatPrice + concessionPrice - discountAmount;

  const handlePayment = async () => {
    if (ticketIds.length === 0) {
      Alert.alert('Lỗi', 'Không tìm thấy vé. Vui lòng quay lại chọn ghế.');
      return;
    }

    setLoading(true);
    try {
      const res: any = await BookingService.confirmBooking({
        ticketIds: ticketIds,
        paymentMethod: selectedMethod,
        totalPrice: totalAmount,
        promotionCode: discountCode || undefined
      });

      if (res.success) {
        navigation.navigate('PaymentSuccess', { 
          transactionId: res.data?.transactionId || `CXN-${Math.floor(Math.random() * 1000000)}`,
          movieTitle: 'Avengers Endgame', // Should ideally pass these from previous screens
          room: 'IMAX 3',
          time: '10/07 - 15:30',
          seats: (selectedSeats as Seat[]).map(s => s.code).join(', ')
        });
      } else {
        Alert.alert('Thanh toán thất bại', res.message || 'Có lỗi xảy ra khi thanh toán.');
      }
    } catch (e: any) {
      console.log('Payment error:', e?.message || e);
      Alert.alert('Thanh toán thất bại', e.message || 'Có lỗi xảy ra khi kết nối cổng thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      <GlassHeader
        title="XÁC NHẬN THANH TOÁN"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Timer Banner */}
        <View style={styles.timerBanner}>
          <Text style={styles.timerLabel}>Thời gian giữ ghế:</Text>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>

        {/* Order Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Chi tiết đặt vé</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Phim:</Text>
            <Text style={styles.value}>Avengers Endgame</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Suất chiếu:</Text>
            <Text style={styles.value}>10/07/2026 - 15:30</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phòng chiếu:</Text>
            <Text style={styles.value}>Phòng IMAX 3</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Số lượng:</Text>
            <Text style={styles.value}>{selectedSeats.length} vé</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ghế:</Text>
            <Text style={styles.valueGold}>{(selectedSeats as Seat[]).map(s => s.code).join(', ')}</Text>
          </View>
          
          {concessionPrice > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Bắp nước</Text>
              {Object.keys(concessions).map(key => concessions[key] > 0 && (
                <View key={key} style={styles.row}>
                  <Text style={styles.label}>{concessions[key]}x Sản phẩm</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Discount Code */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mã giảm giá</Text>
          <View style={styles.discountRow}>
            <TextInput
              style={styles.discountInput}
              placeholder="Nhập mã... (thử CINEMAX20)"
              placeholderTextColor="#666"
              value={discountCode}
              onChangeText={setDiscountCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyBtn} onPress={applyDiscount} disabled={promoLoading}>
              {promoLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.applyBtnText}>Áp dụng</Text>
              )}
            </TouchableOpacity>
          </View>
          {discountAmount > 0 && (
            <Text style={styles.discountSuccess}>✅ Giảm 20% (-{discountAmount.toLocaleString('vi-VN')}₫)</Text>
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {PAYMENT_METHODS.map(method => (
            <TouchableOpacity 
              key={method.id} 
              style={[styles.methodItem, selectedMethod === method.id && styles.methodItemActive]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.radio}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
              <Image source={{ uri: method.icon }} style={styles.methodIcon} contentFit="contain" />
              <Text style={styles.methodName}>{method.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom — Glass effect */}
      {isGlassEffectAPIAvailable() ? (
        <GlassView
          glassEffectStyle="regular"
          colorScheme="dark"
          tintColor={Theme.colors.glass.tint}
          style={[styles.stickyBottom, { paddingBottom: Math.max(insets.bottom, Theme.spacing.md) }]}
        >
          <View style={styles.summaryTotal}>
            <View>
              <Text style={styles.summaryLabel}>TỔNG CỘNG:</Text>
              <Text style={styles.totalPrice}>{totalAmount.toLocaleString('vi-VN')}₫</Text>
            </View>
            {discountAmount > 0 && (
              <Text style={styles.originalPrice}>{(seatPrice + concessionPrice).toLocaleString('vi-VN')}₫</Text>
            )}
          </View>
          <TouchableOpacity style={[styles.payBtn, loading && { opacity: 0.7 }]} onPress={handlePayment} activeOpacity={0.85} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.payBtnText}>XÁC NHẬN THANH TOÁN</Text>
            )}
          </TouchableOpacity>
        </GlassView>
      ) : (
        <View style={[styles.stickyBottom, styles.stickyBottomFallback, { paddingBottom: Math.max(insets.bottom, Theme.spacing.md) }]}>
          <View style={styles.summaryTotal}>
            <View>
              <Text style={styles.summaryLabel}>TỔNG CỘNG:</Text>
              <Text style={styles.totalPrice}>{totalAmount.toLocaleString('vi-VN')}₫</Text>
            </View>
            {discountAmount > 0 && (
              <Text style={styles.originalPrice}>{(seatPrice + concessionPrice).toLocaleString('vi-VN')}₫</Text>
            )}
          </View>
          <TouchableOpacity style={[styles.payBtn, loading && { opacity: 0.7 }]} onPress={handlePayment} activeOpacity={0.85} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.payBtnText}>XÁC NHẬN THANH TOÁN</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.md,
    paddingBottom: 40,
  },
  timerBanner: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    gap: 8,
  },
  timerLabel: {
    color: Theme.colors.textPrimary,
    fontSize: 14,
  },
  timerText: {
    color: Theme.colors.gold,
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: Theme.colors.glass.background,
    borderRadius: Theme.radius.card,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 0.5,
    borderColor: Theme.colors.glass.border,
  },
  sectionTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.md,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
  },
  value: {
    color: Theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  valueGold: {
    color: Theme.colors.gold,
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: Theme.spacing.md,
  },
  discountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  discountInput: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 0.5,
    borderColor: Theme.colors.glass.border,
    borderRadius: Theme.radius.btn,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Theme.colors.textPrimary,
    fontSize: 14,
  },
  applyBtn: {
    backgroundColor: Theme.colors.gold,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.radius.btn,
  },
  applyBtnText: {
    color: '#000',
    fontWeight: 'bold',
  },
  discountSuccess: {
    color: '#4CAF50',
    marginTop: 8,
    fontSize: 14,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
  },
  methodItemActive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Theme.colors.gold,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.gold,
  },
  methodIcon: {
    width: 30,
    height: 30,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  methodName: {
    color: Theme.colors.textPrimary,
    fontSize: 14,
  },
  stickyBottom: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Theme.colors.glass.border,
    borderTopLeftRadius: Theme.radius.xl,
    borderTopRightRadius: Theme.radius.xl,
  },
  stickyBottomFallback: {
    backgroundColor: Theme.colors.glass.background,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Theme.spacing.md,
  },
  summaryLabel: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  totalPrice: {
    color: Theme.colors.gold,
    fontSize: 24,
    fontWeight: 'bold',
  },
  originalPrice: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  payBtn: {
    backgroundColor: Theme.colors.accent,
    paddingVertical: 16,
    borderRadius: Theme.radius.btn,
    alignItems: 'center',
  },
  payBtnText: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
