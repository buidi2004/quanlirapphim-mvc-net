import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Platform, ToastAndroid } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PromotionDetailScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { promo } = route.params || { promo: { 
    id: '1', code: 'GIAM20', title: 'Giảm 20% giá vé', discount: '20%', expiry: '30/12/2026', remaining: 45, image: 'https://cdn.galaxycine.vn/media/2023/12/27/1125x400_1703648589278.jpg' 
  }};

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const copyPromoCode = async () => {
    await Clipboard.setStringAsync(promo.code);
    setCopied(true);
    if (Platform.OS === 'android') {
      ToastAndroid.show(`Đã copy mã: ${promo.code}`, ToastAndroid.SHORT);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: 90 + insets.bottom }}>
        {/* Hero Image */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: promo.image }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient colors={['transparent', Theme.colors.background]} style={styles.heroOverlay} />
          
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <View style={styles.backBtnBg}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.promoBadge}>
            <Text style={styles.promoBadgeText}>{promo.discount}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{promo.title}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="calendar-outline" size={20} color={Theme.colors.gold} />
              <Text style={styles.statLabel}>Hạn sử dụng</Text>
              <Text style={styles.statValue}>{promo.expiry}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Ionicons name="people-outline" size={20} color={Theme.colors.gold} />
              <Text style={styles.statLabel}>Lượt dùng</Text>
              <Text style={styles.statValue}>Còn {promo.remaining}</Text>
            </View>
          </View>

          {/* Code Copy Box */}
          <TouchableOpacity 
            style={[styles.copyBox, copied && styles.copyBoxSuccess]} 
            onPress={copyPromoCode}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.copyLabel}>MÃ ƯU ĐÃI CỦA BẠN</Text>
              <Text style={[styles.codeText, copied && { color: '#4CAF50' }]}>{promo.code}</Text>
            </View>
            <View style={[styles.copyIconWrapper, copied && { backgroundColor: '#4CAF50' }]}>
              <Ionicons name={copied ? "checkmark" : "copy-outline"} size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.htmlContent}>
            <Text style={styles.sectionTitle}>Điều kiện áp dụng:</Text>
            <Text style={styles.paragraph}>• Áp dụng cho mọi giao dịch mua vé trên ứng dụng CinemaX.</Text>
            <Text style={styles.paragraph}>• Không áp dụng cùng lúc với các chương trình khuyến mãi khác.</Text>
            <Text style={styles.paragraph}>• Số lượng có hạn, chương trình có thể kết thúc sớm hơn dự kiến.</Text>
            <Text style={styles.paragraph}>• Mỗi tài khoản chỉ được sử dụng tối đa 1 lần trong suốt thời gian diễn ra chương trình.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom */}
      <View style={[styles.stickyBottom, { paddingBottom: insets.bottom + Theme.spacing.lg }]}>
        <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('MainTabs')}>
          <Ionicons name="ticket-outline" size={20} color="#000" style={{ marginRight: 8 }} />
          <Text style={styles.bookBtnText}>Dùng khi đặt vé ngay</Text>
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
  heroWrapper: {
    position: 'relative',
    height: 250,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 16,
  },
  backBtnBg: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Theme.colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '-5deg' }],
  },
  promoBadgeText: {
    color: Theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },
  content: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    lineHeight: 32,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Theme.colors.cardBorder,
    marginHorizontal: 16,
  },
  statLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    color: Theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  copyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(111, 66, 193, 0.1)',
    borderRadius: Theme.radius.lg,
    padding: 20,
    borderWidth: 2,
    borderColor: Theme.colors.gold,
    borderStyle: 'dashed',
    marginBottom: 30,
  },
  copyBoxSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
  },
  copyLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  codeText: {
    color: Theme.colors.gold,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
  },
  copyIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Theme.colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  htmlContent: {
    marginTop: 10,
  },
  sectionTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paragraph: {
    color: '#bbb',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.cardBorder,
  },
  bookBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.gold,
    paddingVertical: 14,
    borderRadius: Theme.radius.btn,
  },
  bookBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
