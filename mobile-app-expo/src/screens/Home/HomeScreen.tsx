import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  StatusBar, TouchableOpacity, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MovieService } from '../../services/MovieService';
import { Movie } from '../../models/Movie';
import { MovieCard, MOVIE_CARD_WIDTH } from '../../components/features/MovieCard';
import { HeroBanner } from '../../components/features/HeroBanner';
import { QuickBookingBar } from '../../components/features/QuickBookingBar';
import { TrendingList } from '../../components/features/TrendingList';
import { Theme } from '../../theme/tokens';
import { styles } from './styles';

const PROMOTION_BANNERS = [
  { id: '1', icon: '🎁', text: 'Mua 2 vé tặng 1 combo bắp nước', bg: 'rgba(255,193,7,0.12)', border: '#ffc107' },
  { id: '2', icon: '👥', text: 'Thứ 3 Vui Vẻ — Giảm 30% tất cả vé', bg: 'rgba(229,9,20,0.1)', border: '#e50914' },
];

export const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [nowShowing, setNowShowing] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchMovies(); }, []);

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

  const handleMoviePress = (id: number) => {
    navigation.navigate('MovieDetail', { movieId: id });
  };

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
      <View style={[styles.floatingHeader, { paddingTop: insets.top }]}>
        <Text style={styles.logo}>🎬 CinemaX</Text>
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
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <HeroBanner />
        <QuickBookingBar />

        {/* Promotion Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoStrip}
        >
          {PROMOTION_BANNERS.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[styles.promoChip, { backgroundColor: p.bg, borderColor: p.border }]}
              onPress={() => navigation.navigate('PromotionsList')}
            >
              <Text style={styles.promoIcon}>{p.icon}</Text>
              <Text style={styles.promoText}>{p.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        {loading ? (
          <View style={[styles.centerContainer, { height: 300 }]}>
            <ActivityIndicator size="large" color={Theme.colors.accent} />
            <Text style={styles.loadingText}>Đang tải phim...</Text>
          </View>
        ) : error ? (
          <View style={[styles.centerContainer, { height: 300 }]}>
            <Ionicons name="wifi-outline" size={48} color="#444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchMovies}>
              <Ionicons name="refresh-outline" size={16} color="#000" />
              <Text style={styles.retryButton}>Thử lại ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.contentPadding}>
            {nowShowing.length > 0 && (
              <TrendingList movies={nowShowing} onPress={handleMoviePress} />
            )}
            {nowShowing.length > 0 && renderSection('🎬 Phim Đang Chiếu', nowShowing, 'MovieTab')}
            {comingSoon.length > 0 && renderSection('📅 Phim Sắp Chiếu', comingSoon, 'MovieTab')}

            {/* Quick Links */}
            <View style={styles.quickLinks}>
              <TouchableOpacity
                style={styles.quickLink}
                onPress={() => navigation.navigate('GlobalShowtimes')}
              >
                <View style={styles.quickLinkIcon}>
                  <Ionicons name="calendar-outline" size={22} color={Theme.colors.warning} />
                </View>
                <Text style={styles.quickLinkText}>Lịch chiếu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickLink}
                onPress={() => navigation.navigate('CinemaTab')}
              >
                <View style={styles.quickLinkIcon}>
                  <Ionicons name="business-outline" size={22} color={Theme.colors.warning} />
                </View>
                <Text style={styles.quickLinkText}>Hệ thống rạp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickLink}
                onPress={() => navigation.navigate('PromotionsList')}
              >
                <View style={styles.quickLinkIcon}>
                  <Ionicons name="pricetag-outline" size={22} color={Theme.colors.warning} />
                </View>
                <Text style={styles.quickLinkText}>Khuyến mãi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickLink}
                onPress={() => navigation.navigate('NewsList')}
              >
                <View style={styles.quickLinkIcon}>
                  <Ionicons name="newspaper-outline" size={22} color={Theme.colors.warning} />
                </View>
                <Text style={styles.quickLinkText}>Tin tức</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
