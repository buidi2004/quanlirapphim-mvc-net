import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Animated, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../../theme/tokens';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    iconName: "videocam-outline" as const,
    title: 'Khám phá phim hot nhất',
    subtitle: 'Cập nhật liên tục các phim bom tấn mới ra mắt, trailer độc quyền và review chuyên sâu.',
    color: '#e50914',
    bg: 'rgba(229,9,20,0.08)',
  },
  {
    id: '2',
    iconName: "ticket-outline" as const,
    title: 'Đặt vé siêu nhanh',
    subtitle: 'Chọn ghế yêu thích, đặt bắp nước và thanh toán chỉ trong 60 giây. Không cần xếp hàng!',
    color: '#6f42c1',
    bg: 'rgba(111,66,193,0.08)',
  },
  {
    id: '3',
    iconName: "gift-outline" as const,
    title: 'Tích điểm, đổi quà',
    subtitle: 'Mỗi vé là một điểm thưởng. Tích đủ điểm để lên hạng Gold, Platinum và nhận vé miễn phí.',
    color: '#FFD700',
    bg: 'rgba(255,215,0,0.08)',
  },
];

export const OnboardingScreen = ({ navigation }: any) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goToNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    } else {
      handleStart();
    }
  };

  const handleStart = async () => {
    await AsyncStorage.setItem('@onboarding_done', 'true');
    navigation.replace('MainDrawer');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('@onboarding_done', 'true');
    navigation.replace('MainDrawer');
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />

      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: item.bg, borderColor: item.color + '40' }]}>
              <Ionicons name={item.iconName} size={72} color={item.color} />
              {/* Glow ring */}
              <View style={[styles.glowRing, { borderColor: item.color + '30' }]} />
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Bottom area */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
            const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: SLIDES[activeIndex].color }]}
              />
            );
          })}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: SLIDES[activeIndex].color }]}
          onPress={goToNext}
        >
          <Text style={styles.ctaBtnText}>
            {isLast ? 'BẮT ĐẦU NGAY' : 'Tiếp theo'}
          </Text>
          {!isLast && <Ionicons name="arrow-forward" size={18} color="#000" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  skipBtn: {
    position: 'absolute', top: 56, right: 24, zIndex: 10,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Theme.radius.pill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  skipText: { color: Theme.colors.textSecondary, fontSize: 13 },

  slide: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, paddingBottom: 80,
  },
  iconCircle: {
    width: 160, height: 160, borderRadius: 80,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, marginBottom: 40, position: 'relative',
  },
  slideIcon: { fontSize: 72 },
  glowRing: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 1,
  },
  slideTitle: {
    color: Theme.colors.textPrimary, fontSize: 26, fontWeight: '800',
    textAlign: 'center', marginBottom: 16, lineHeight: 32,
  },
  slideSubtitle: {
    color: Theme.colors.textSecondary, fontSize: 15, textAlign: 'center',
    lineHeight: 24, maxWidth: 300,
  },

  bottom: { paddingHorizontal: 32, paddingBottom: 48, alignItems: 'center', gap: 28 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { height: 8, borderRadius: 4 },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', paddingVertical: 16, borderRadius: Theme.radius.pill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  ctaBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});
