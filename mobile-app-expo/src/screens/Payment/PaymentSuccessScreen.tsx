import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import QRCode from 'react-native-qrcode-svg';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Brightness from 'expo-brightness';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate, Extrapolation, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export const PaymentSuccessScreen = ({ route, navigation }: any) => {
  const { transactionId, movieTitle, room, time, seats } = route.params || {
    transactionId: 'CXN-000000',
    movieTitle: 'Unknown',
    room: 'Unknown',
    time: 'Unknown',
    seats: ''
  };

  const [flipped, setFlipped] = useState(false);
  const flipValue = useSharedValue(0); // 0 to 180

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
          Brightness.setBrightnessAsync(1);
        }
      }
    })();

    return () => {
      if (Platform.OS !== 'web') {
        Brightness.restoreSystemBrightnessAsync().catch(() => {});
      }
    };
  }, []);

  const toggleFlip = () => {
    setFlipped(!flipped);
    flipValue.value = withSpring(flipped ? 0 : 180, { damping: 12, stiffness: 90 });
  };

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 180], [0, 180], Extrapolation.CLAMP);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity: interpolate(flipValue.value, [89, 90], [1, 0], Extrapolation.CLAMP),
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 180], [180, 360], Extrapolation.CLAMP);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity: interpolate(flipValue.value, [89, 90], [0, 1], Extrapolation.CLAMP),
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      {/* Confetti */}
      <ConfettiCannon count={100} origin={{ x: width / 2, y: -10 }} fadeOut fallSpeed={3000} />

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.successHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>ĐẶT VÉ THÀNH CÔNG!</Text>
          <Text style={styles.successSubtitle}>Cảm ơn bạn đã chọn CinemaX</Text>
        </View>

        {/* 3D Flip Card */}
        <TouchableOpacity activeOpacity={0.9} onPress={toggleFlip} style={styles.cardWrapper}>
          
          {/* FRONT (Chi tiết vé) */}
          <Animated.View style={[styles.card, styles.cardFront, frontStyle]}>
            <View style={styles.cardHeader}>
              <Text style={styles.brandText}>CINEMAX E-TICKET</Text>
              <Ionicons name="ticket" size={20} color={Theme.colors.gold} />
            </View>
            
            <View style={styles.cardBody}>
              <Text style={styles.movieTitle}>{movieTitle}</Text>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Phòng chiếu</Text>
                  <Text style={styles.infoValue}>{room}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Suất chiếu</Text>
                  <Text style={styles.infoValue}>{time}</Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Ghế ngồi</Text>
                  <Text style={styles.infoValueGold}>{seats}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Mã GD</Text>
                  <Text style={styles.infoValue}>{transactionId}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.cardFooter}>
              <Ionicons name="scan" size={20} color="#666" />
              <Text style={styles.tapText}>Chạm để xem QR Code</Text>
            </View>
          </Animated.View>

          {/* BACK (Mã QR) */}
          <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
            <View style={styles.cardHeader}>
              <Text style={styles.brandText}>MÃ QR KIỂM VÉ</Text>
              <Ionicons name="qr-code" size={20} color={Theme.colors.gold} />
            </View>
            
            <View style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={JSON.stringify({ code: transactionId, v: '1' })}
                  size={180}
                  color="#000"
                  backgroundColor="#fff"
                />
              </View>
              <Text style={styles.transactionText}>{transactionId}</Text>
            </View>

            <View style={styles.cardFooter}>
              <Ionicons name="repeat" size={20} color="#666" />
              <Text style={styles.tapText}>Chạm để xem chi tiết</Text>
            </View>
          </Animated.View>
          
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('MyTickets')}>
          <Text style={styles.primaryBtnText}>VÉ CỦA TÔI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('MainDrawer')}>
          <Text style={styles.secondaryBtnText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 60,
    padding: 10,
    marginBottom: 16,
  },
  successTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successSubtitle: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
  },
  cardWrapper: {
    width: width - 40,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  cardBack: {
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  brandText: {
    color: Theme.colors.gold,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cardBody: {
    flex: 1,
    padding: 20,
  },
  movieTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  infoValueGold: {
    color: Theme.colors.gold,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    gap: 8,
  },
  tapText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  transactionText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  bottomActions: {
    padding: 20,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: Theme.colors.accent,
    paddingVertical: 14,
    borderRadius: Theme.radius.btn,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: Theme.radius.btn,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  secondaryBtnText: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
