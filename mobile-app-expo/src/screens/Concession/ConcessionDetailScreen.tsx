import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RELATED_ITEMS = [
  {
    id: 'r1',
    name: 'Bắp Ngọt Cỡ Lớn',
    price: 59000,
    imageUrl: 'https://cdn.galaxycine.vn/media/2021/11/03/bap-ngot_1635921867140.png',
  },
  {
    id: 'r2',
    name: 'Nước Ngọt Cỡ Vừa',
    price: 39000,
    imageUrl: 'https://cdn.galaxycine.vn/media/2021/5/26/nuoc-ngot-vua_1622021793888.png',
  },
  {
    id: 'r3',
    name: 'Combo Snack Mix',
    price: 79000,
    imageUrl: 'https://cdn.galaxycine.vn/media/2021/5/26/nuoc-ngot-vua_1622021793888.png',
  },
];

const NUTRITION_INFO = [
  { label: 'Calo', value: '480 kcal' },
  { label: 'Chất béo', value: '22g' },
  { label: 'Đường', value: '18g' },
  { label: 'Muối', value: '520mg' },
];

export const ConcessionDetailScreen = ({ route, navigation }: any) => {
  const {
    item = {
      id: 'c1',
      name: 'Combo Couple',
      description: 'Combo dành cho cặp đôi lý tưởng! 2 Nước ngọt cỡ lớn + 1 Bắp rang bơ phô mai cỡ lớn thơm ngon, giúp buổi xem phim thêm trọn vẹn và lãng mạn hơn bao giờ hết.',
      originalPrice: 130000,
      price: 109000,
      imageUrl: 'https://cdn.galaxycine.vn/media/2023/12/28/combo-2-big_1703746684074.png',
      isLimited: false,
      contains: ['2 Nước ngọt cỡ lớn (600ml)', '1 Bắp rang bơ phô mai cỡ lớn'],
    },
  } = route.params || {};

  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(0);
  const quantityScale = useSharedValue(1);

  const quantityAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: quantityScale.value }],
  }));

  const handleQtyChange = (delta: number) => {
    const next = Math.max(0, quantity + delta);
    setQuantity(next);
    if (next > 0) {
      quantityScale.value = withSequence(
        withTiming(1.25, { duration: 120 }),
        withTiming(1, { duration: 120 })
      );
    }
  };

  const handleCTA = () => {
    if (quantity === 0) {
      handleQtyChange(1);
      return;
    }
    navigation.navigate('MainTabs');
  };

  const discount = item.originalPrice > item.price
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Floating Back */}
      <TouchableOpacity
        style={[styles.floatingBack, { top: insets.top + 12 }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        bounces={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)', Theme.colors.background]}
            style={StyleSheet.absoluteFill}
          />

          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}

          <View style={styles.heroContent}>
            {item.isLimited && (
              <View style={styles.limitedBadge}>
                <Ionicons name="flame" size={12} color="#000" />
                <Text style={styles.limitedText}>LIMITED</Text>
              </View>
            )}
            <Text style={styles.heroTitle}>{item.name}</Text>
            <View style={styles.priceRow}>
              {item.originalPrice > item.price && (
                <Text style={styles.originalPrice}>
                  {item.originalPrice.toLocaleString('vi-VN')}₫
                </Text>
              )}
              <Text style={styles.currentPrice}>
                {item.price.toLocaleString('vi-VN')}₫
              </Text>
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>

          {/* Quantity Selector */}
          <View style={styles.quantityCard}>
            <View>
              <Text style={styles.qtyLabel}>Số lượng</Text>
              <Animated.Text style={[styles.qtyTotal, quantityAnimStyle]}>
                {quantity > 0
                  ? `${(item.price * quantity).toLocaleString('vi-VN')}₫`
                  : 'Chưa chọn'}
              </Animated.Text>
            </View>
            <View style={styles.qtyControls}>
              <TouchableOpacity
                style={[styles.qtyBtn, quantity === 0 && styles.qtyBtnDisabled]}
                onPress={() => handleQtyChange(-1)}
                disabled={quantity === 0}
              >
                <Ionicons name="remove" size={18} color={quantity === 0 ? '#555' : '#fff'} />
              </TouchableOpacity>
              <Text style={styles.qtyNumber}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyBtnAccent} onPress={() => handleQtyChange(1)}>
                <Ionicons name="add" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.descText}>{item.description}</Text>
          </View>

          {/* Contains */}
          {item.contains && item.contains.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Combo bao gồm</Text>
              {item.contains.map((c: string, i: number) => (
                <View key={i} style={styles.containRow}>
                  <View style={styles.containDot} />
                  <Text style={styles.containText}>{c}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Nutrition */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin dinh dưỡng</Text>
            <View style={styles.nutritionGrid}>
              {NUTRITION_INFO.map((n, i) => (
                <View key={i} style={styles.nutritionBox}>
                  <Text style={styles.nutritionValue}>{n.value}</Text>
                  <Text style={styles.nutritionLabel}>{n.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Note */}
          <View style={styles.noteBox}>
            <Ionicons name="information-circle-outline" size={16} color={Theme.colors.gold} />
            <Text style={styles.noteText}>
              Combo chỉ có thể đặt kết hợp khi mua vé xem phim tại CinemaX.
            </Text>
          </View>

          {/* Related */}
          <Text style={styles.sectionTitle}>Sản phẩm khác</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 4 }}
          >
            {RELATED_ITEMS.map((r) => (
              <TouchableOpacity key={r.id} style={styles.relatedCard} activeOpacity={0.8}>
                <Image source={{ uri: r.imageUrl }} style={styles.relatedImage} contentFit="cover" />
                <Text style={styles.relatedName} numberOfLines={2}>{r.name}</Text>
                <Text style={styles.relatedPrice}>{r.price.toLocaleString('vi-VN')}₫</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Sticky Bottom */}
      <View style={[styles.stickyBottom, { paddingBottom: Math.max(insets.bottom, Theme.spacing.md) }]}>
        <TouchableOpacity
          style={[styles.ctaBtn, quantity === 0 && styles.ctaBtnOutline]}
          onPress={handleCTA}
          activeOpacity={0.85}
        >
          <Ionicons
            name={quantity === 0 ? 'add-circle-outline' : 'cart'}
            size={20}
            color={quantity === 0 ? Theme.colors.gold : '#fff'}
          />
          <Text style={[styles.ctaBtnText, quantity === 0 && styles.ctaBtnTextOutline]}>
            {quantity === 0
              ? 'THÊM VÀO GIỎ HÀNG'
              : `MUA KÈM VÉ NGAY  (${quantity} × ${item.price.toLocaleString('vi-VN')}₫)`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  floatingBack: {
    position: 'absolute', left: 16, zIndex: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.9,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  discountBadge: {
    position: 'absolute', top: 60, right: 20,
    backgroundColor: Theme.colors.accent,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, transform: [{ rotate: '-5deg' }],
    borderWidth: 2, borderColor: '#fff',
  },
  discountText: { color: Theme.colors.textPrimary, fontWeight: '900', fontSize: 20 },
  heroContent: { padding: Theme.spacing.lg, paddingBottom: Theme.spacing.xl },
  limitedBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.gold, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Theme.radius.pill, gap: 4, marginBottom: 8,
  },
  limitedText: { color: '#000', fontSize: 10, fontWeight: '900' },
  heroTitle: {
    color: Theme.colors.textPrimary, fontSize: 28, fontWeight: '900', marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  originalPrice: { color: Theme.colors.textSecondary, fontSize: 16, textDecorationLine: 'line-through' },
  currentPrice: { color: Theme.colors.gold, fontSize: 26, fontWeight: '900' },

  body: { padding: Theme.spacing.lg },

  quantityCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md, marginBottom: Theme.spacing.lg,
    borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  qtyLabel: { color: Theme.colors.textMuted, fontSize: 12, marginBottom: 4 },
  qtyTotal: { color: Theme.colors.gold, fontSize: 18, fontWeight: 'bold' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1, borderColor: Theme.colors.cardBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnDisabled: { borderColor: '#2a2a2a' },
  qtyBtnAccent: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Theme.colors.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyNumber: { color: Theme.colors.textPrimary, fontSize: 20, fontWeight: 'bold', minWidth: 28, textAlign: 'center' },

  section: { marginBottom: Theme.spacing.xl },
  sectionTitle: {
    color: Theme.colors.warning, fontSize: 15, fontWeight: 'bold',
    marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  descText: { color: Theme.colors.textSecondary, fontSize: 15, lineHeight: 24 },
  containRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  containDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.colors.gold },
  containText: { color: '#ddd', fontSize: 14 },

  nutritionGrid: { flexDirection: 'row', gap: 10 },
  nutritionBox: {
    flex: 1, backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  nutritionValue: { color: Theme.colors.textPrimary, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  nutritionLabel: { color: Theme.colors.textSecondary, fontSize: 10 },

  noteBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(255,193,7,0.08)', borderRadius: Theme.radius.md,
    padding: 12, marginBottom: Theme.spacing.xl,
    borderWidth: 1, borderColor: 'rgba(255,193,7,0.2)',
  },
  noteText: { color: Theme.colors.textSecondary, fontSize: 13, lineHeight: 20, flex: 1 },

  relatedCard: {
    width: 130, backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  relatedImage: { width: 130, height: 100 },
  relatedName: { color: Theme.colors.textPrimary, fontSize: 12, fontWeight: 'bold', padding: 8, paddingBottom: 4 },
  relatedPrice: { color: Theme.colors.gold, fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingBottom: 8 },

  stickyBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.md,
    borderTopWidth: 1, borderTopColor: Theme.colors.cardBorder,
    elevation: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Theme.colors.accent, paddingVertical: 15, borderRadius: Theme.radius.btn,
  },
  ctaBtnOutline: {
    backgroundColor: 'transparent', borderWidth: 2, borderColor: Theme.colors.gold,
  },
  ctaBtnText: { color: Theme.colors.textPrimary, fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },
  ctaBtnTextOutline: { color: Theme.colors.gold },
});
