import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StatusBar, Alert } from 'react-native';
import { BookingService } from '../../services/BookingService';
import { SeatMapResponse, Seat } from '../../models/Booking';
import { SeatItem } from '../../components/features/SeatItem';
import { styles } from './styles';
import { Theme } from '../../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Platform } from 'react-native';
import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../../api/apiClient';

const { width } = Dimensions.get('window');

export const SeatSelectionScreen = ({ route, navigation }: any) => {
  const { showtimeId } = route.params || {};
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<SeatMapResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  useEffect(() => {
    fetchSeatMap();
    
    // SignalR Connection
    const hubUrl = `${API_BASE_URL}/seathub`;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => {
      console.log('SignalR Connected');
      connection.invoke('JoinShowtimeGroup', Number(showtimeId));
    }).catch(err => console.log('SignalR Connection Error: ', err));

    connection.on('SeatHeld', (payload) => {
      // payload.seatCodes is an array of strings e.g. ["C4", "C5"]
      setData(prev => {
        if (!prev) return prev;
        const newSeats = prev.seats.map(s => 
          payload.seatCodes.includes(s.code) 
            ? { ...s, status: 'locked' } // Update status to locked
            : s
        );
        return { ...prev, seats: newSeats };
      });
    });

    connection.on('SeatReleased', (payload) => {
      setData(prev => {
        if (!prev) return prev;
        const newSeats = prev.seats.map(s => 
          payload.seatCodes.includes(s.code) 
            ? { ...s, status: 'available' } // Revert status to available
            : s
        );
        return { ...prev, seats: newSeats };
      });
    });

    return () => {
      connection.invoke('LeaveShowtimeGroup', Number(showtimeId)).catch(e => console.log(e));
      connection.stop();
    };
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

  const [holding, setHolding] = useState(false);

  const handleNext = async () => {
    if (selectedSeats.length === 0) return;
    
    setHolding(true);
    try {
      const res: any = await BookingService.holdSeats({
        showtimeId: Number(showtimeId),
        seatCodes: selectedSeats.map(s => s.code)
      });
      
      const holdResult = res.data?.holdResult;
      if (res.success && holdResult && holdResult.ticketIds) {
        navigation.navigate('Concession', { 
          selectedSeats, 
          showtimeId, 
          ticketIds: holdResult.ticketIds,
          expiryTime: holdResult.expiryTime,
          remainingSeconds: holdResult.remainingSeconds,
          movieTitle: data?.movieTitle,
          roomName: data?.roomName,
          showDate: data?.showDate,
          startTime: data?.startTime,
          cinemaName: data?.cinemaName
        });
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể giữ ghế, vui lòng thử lại.');
      }
    } catch (e: any) {
      console.log('Error holding seats:', e?.message || e);
      if (e.error && e.error.includes('401')) {
        Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập tài khoản để có thể giữ ghế và đặt vé.', [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Lỗi', e.error || 'Ghế bạn chọn có thể đã được người khác đặt hoặc đã xảy ra lỗi.');
      }
    } finally {
      setHolding(false);
    }
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

  const rows: { [key: string]: Seat[] } = {};
  (data.seats || []).forEach(seat => {
    if (!rows[seat.row]) rows[seat.row] = [];
    rows[seat.row].push(seat);
  });
  
  const rowKeys = Object.keys(rows).sort();
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{data.movieTitle}</Text>
          <Text style={styles.headerSubtitle}>
            {data.cinemaName} • {data.roomName} • {data.startTime}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <ReactNativeZoomableView
          maxZoom={2.5}
          minZoom={0.8}
          initialZoom={1}
          bindToBorders
        >
          <View style={styles.zoomContent}>
            <View style={styles.screenArea}>
              <View style={styles.screenCurve} />
              <Text style={styles.screenText}>MÀN HÌNH</Text>
            </View>

            <View style={styles.seatGrid}>
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
            </View>
          </View>
        </ReactNativeZoomableView>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: Theme.colors.surface }]} /><Text style={styles.legendText}>Trống</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: Theme.colors.accent }]} /><Text style={styles.legendText}>Đang chọn</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: '#6c757d' }]} /><Text style={styles.legendText}>Đã đặt</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendBox, { borderColor: Theme.colors.gold, borderWidth: 1.5 }]} /><Text style={styles.legendText}>VIP</Text></View>
      </View>

      {/* Sticky Bottom Order Summary */}
      <View style={[styles.stickyBottom, { paddingBottom: Math.max(insets.bottom, Theme.spacing.md) }]}>
        <View style={styles.summaryRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>Ghế:</Text>
            <Text style={styles.seatsText} numberOfLines={1}>
              {selectedSeats.length > 0 ? selectedSeats.map(s => s.code).join(', ') : 'Chưa chọn'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', flex: 1 }}>
            <Text style={styles.summaryLabel}>TỔNG CỘNG:</Text>
            <Text style={styles.priceText}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.bookButton, (selectedSeats.length === 0 || holding) && { opacity: 0.5 }]}
          disabled={selectedSeats.length === 0 || holding}
          onPress={handleNext}
        >
          {holding ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.bookButtonText}>GIỮ GHẾ (15 PHÚT)</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
