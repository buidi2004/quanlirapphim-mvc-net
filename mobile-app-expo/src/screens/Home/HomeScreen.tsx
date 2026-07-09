import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  StatusBar, TouchableOpacity, Pressable, ScrollView, Modal, TouchableWithoutFeedback, Dimensions, Animated, StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MovieService } from '../../services/MovieService';
import { Movie } from '../../models/Movie';
import { MovieCard, MOVIE_CARD_WIDTH } from '../../components/features/MovieCard';
import { TopAdsBanner } from '../../components/features/TopAdsBanner';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { MoviePosterCarousel } from '../../components/features/MoviePosterCarousel';
import { FloatingMascotFAB } from '../../components/features/FloatingMascotFAB';
import { PromoModal } from '../../components/features/PromoModal';
import { SupportBottomBar } from '../../components/features/SupportBottomBar';
import { VideoSplashScreen } from '../Splash/VideoSplashScreen';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Theme } from '../../theme/tokens';
import { styles } from './styles';

const PROMOTION_BANNERS = [
  { id: '1', iconName: 'gift-outline' as const, text: 'Mua 2 vé tặng 1 combo bắp nước', bg: 'rgba(255,193,7,0.12)', border: '#ffc107' },
  { id: '2', iconName: 'people-outline' as const, text: 'Thứ 3 Vui Vẻ — Giảm 30% tất cả vé', bg: 'rgba(229,9,20,0.1)', border: '#e50914' },
];


export const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [nowShowing, setNowShowing] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => { fetchMovies(); }, []);

  useEffect(() => {
    // Hide the tab bar while the video splash screen is showing
    navigation.setOptions({
      tabBarStyle: { display: showSplash ? 'none' : 'flex' }
    });
  }, [navigation, showSplash]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const [nowRes, soonRes] = await Promise.all([
        MovieService.getMovies('now_showing', 1),
        MovieService.getMovies('coming_soon', 1),
      ]);
      setNowShowing(nowRes.data || []);
      setComingSoon(soonRes.data || []);
    } catch {
      setError('Mất kết nối Internet hoặc Lỗi máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleMoviePress = useCallback((id: number) => {
    navigation.navigate('MovieDetail', { movieId: id });
  }, [navigation]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
    setShowPromoModal(true);
  }, []);

  const topAdsMovies = useMemo(() => nowShowing.slice(0, 5), [nowShowing]);

  const renderSection = (title: string, data: Movie[], navigateTo?: string) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={() => navigateTo && navigation.navigate(navigateTo)}>
          <Text style={styles.seeAllText}>Xem tất cả →</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <MovieCard movie={item} onPress={handleMoviePress} />}
        contentContainerStyle={styles.listContent}
        snapToInterval={MOVIE_CARD_WIDTH + Theme.spacing.md}
        decelerationRate="fast"
      />
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Floating Header */}
      <LinearGradient 
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
        style={[styles.floatingHeader, { paddingTop: Math.max(insets.top, 40) }]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 4 }}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.logo}>CinemaX</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notification')}
          >
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {/* Notification dot */}
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <Ionicons name="person-circle" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Spacer for Floating Header */}
        <View style={{ height: Math.max(insets.top, 40) + 60 }} />
        
        <TopAdsBanner movies={topAdsMovies} onPress={handleMoviePress} />

        {/* Promotion Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoStrip}
        >
          {PROMOTION_BANNERS.map(p => (
            <Pressable
              key={p.id}
              onPress={() => navigation.navigate('PromotionsList')}
              style={({ pressed }) => [pressed && { transform: [{ scale: 0.96 }] }]}
            >
              <GlassSurface variant="card" style={[styles.promoChip, { borderColor: p.border, backgroundColor: p.bg }]} borderRadius={12}>
                <Ionicons name={p.iconName} size={18} color={p.border} style={{ marginRight: 6 }} />
                <Text style={styles.promoText}>{p.text}</Text>
              </GlassSurface>
            </Pressable>
          ))}
        </ScrollView>

        {/* Content */}
        {loading ? (
          <View style={{ paddingTop: 20 }}>
            <SkeletonLoader type="list" />
            <SkeletonLoader type="list" />
          </View>
        ) : error ? (
          <View style={[styles.centerContainer, { height: 300 }]}>
            <Ionicons name="wifi-outline" size={48} color="#444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchMovies}>
              <Ionicons name="refresh-outline" size={16} color={Theme.colors.textPrimary} />
              <Text style={styles.retryButton}>Thử lại ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.contentPadding}>
            {nowShowing.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Phim Đang Chiếu</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('MovieTab')}>
                    <Text style={styles.seeAllText}>Xem tất cả →</Text>
                  </TouchableOpacity>
                </View>
                <MoviePosterCarousel movies={nowShowing} onMoviePress={handleMoviePress} />
              </View>
            )}
            {comingSoon.length > 0 && renderSection('Phim Sắp Chiếu', comingSoon, 'MovieTab')}

            {/* Quick Links */}
            <View style={styles.quickLinks}>
              <Pressable
                onPress={() => navigation.navigate('GlobalShowtimes')}
                style={({ pressed }) => [{ flex: 1 }, pressed && { transform: [{ scale: 0.96 }] }]}
              >
                <GlassSurface variant="card" style={styles.quickLink} borderRadius={16}>
                  <View style={styles.quickLinkIcon}>
                    <Ionicons name="calendar-outline" size={22} color={Theme.colors.warning} />
                  </View>
                  <Text style={styles.quickLinkText}>Lịch chiếu</Text>
                </GlassSurface>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('CinemaTab')}
                style={({ pressed }) => [{ flex: 1 }, pressed && { transform: [{ scale: 0.96 }] }]}
              >
                <GlassSurface variant="card" style={styles.quickLink} borderRadius={16}>
                  <View style={styles.quickLinkIcon}>
                    <Ionicons name="business-outline" size={22} color={Theme.colors.warning} />
                  </View>
                  <Text style={styles.quickLinkText}>Hệ thống rạp</Text>
                </GlassSurface>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('PromotionsList')}
                style={({ pressed }) => [{ flex: 1 }, pressed && { transform: [{ scale: 0.96 }] }]}
              >
                <GlassSurface variant="card" style={styles.quickLink} borderRadius={16}>
                  <View style={styles.quickLinkIcon}>
                    <Ionicons name="pricetag-outline" size={22} color={Theme.colors.warning} />
                  </View>
                  <Text style={styles.quickLinkText}>Khuyến mãi</Text>
                </GlassSurface>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('NewsList')}
                style={({ pressed }) => [{ flex: 1 }, pressed && { transform: [{ scale: 0.96 }] }]}
              >
                <GlassSurface variant="card" style={styles.quickLink} borderRadius={16}>
                  <View style={styles.quickLinkIcon}>
                    <Ionicons name="newspaper-outline" size={22} color={Theme.colors.warning} />
                  </View>
                  <Text style={styles.quickLinkText}>Tin tức</Text>
                </GlassSurface>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Promotion Modal */}
      <PromoModal 
        visible={showPromoModal} 
        onClose={() => setShowPromoModal(false)} 
      />

      {/* FIXED: Prevent infinite re-render loop by using memoized callback */}
      {showSplash && <VideoSplashScreen onFinish={handleSplashFinish} />}

      {/* Support Bottom Bar */}
      <SupportBottomBar onPress={() => navigation.navigate('Contact')} />

      {/* Mascot FAB */}
      <FloatingMascotFAB onPress={() => navigation.navigate('MovieTab')} />
    </View>
  );
};
