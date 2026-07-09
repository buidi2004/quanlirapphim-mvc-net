import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity,
  FlatList, Dimensions, StatusBar, Share, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IMAGE_BASE_URL } from '../../api/apiClient';
import { MovieService } from '../../services/MovieService';
import { MovieDetailResponse, ShowtimeSummary } from '../../models/Movie';
import { styles } from './styles';
import { Theme } from '../../theme/tokens';
import Animated, {
  useAnimatedScrollHandler, useSharedValue,
  useAnimatedStyle, interpolate, Extrapolation,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.55;
const AnimatedImage = Animated.createAnimatedComponent(Image);

// Generate real dates from today
const getNext7Days = () => {
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateString: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Hôm nay' : dayNames[d.getDay()],
      dayNumber: String(d.getDate()),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      isToday: i === 0,
    };
  });
};

const MOCK_CAST = [
  { name: 'Robert Downey Jr.', role: 'Tony Stark', avatar: 'https://i.pravatar.cc/80?img=1' },
  { name: 'Chris Evans', role: 'Steve Rogers', avatar: 'https://i.pravatar.cc/80?img=2' },
  { name: 'Scarlett Johansson', role: 'Black Widow', avatar: 'https://i.pravatar.cc/80?img=5' },
  { name: 'Mark Ruffalo', role: 'Bruce Banner', avatar: 'https://i.pravatar.cc/80?img=3' },
  { name: 'Thor Hemsworth', role: 'Thor', avatar: 'https://i.pravatar.cc/80?img=4' },
];

const GENRE_CHIPS = ['Hành động', 'Khoa học', 'Siêu anh hùng', 'Phiêu lưu'];

export const MovieDetailScreen = ({ route, navigation }: any) => {
  const { movieId } = route.params || {};
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<MovieDetailResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0].dateString);
  const [selectedShowtime, setSelectedShowtime] = useState<ShowtimeSummary | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const scrollY = useSharedValue(0);
  const DATES = getNext7Days();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { scrollY.value = event.contentOffset.y; },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-100, 0, HEADER_HEIGHT], [0, 0, HEADER_HEIGHT * 0.5], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [-100, 0], [1.2, 1], Extrapolation.CLAMP) },
    ],
  }));

  const toolbarOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HEADER_HEIGHT * 0.75, HEADER_HEIGHT], [0, 1], Extrapolation.CLAMP),
  }));

  const floatingHeaderOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HEADER_HEIGHT * 0.5, HEADER_HEIGHT * 0.75], [1, 0], Extrapolation.CLAMP),
  }));

  useEffect(() => { fetchDetail(); }, [movieId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await MovieService.getMovieDetail(movieId);
      if (res.success && res.data) { setData(res.data); }
      else { setError(res.error || 'Lỗi lấy thông tin phim'); }
    } catch { setError('Mất kết nối Internet.'); }
    finally { setLoading(false); }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: data?.movie?.title || 'CinemaX',
        message: `🎬 Xem phim "${data?.movie?.title}" tại CinemaX! Đặt vé: https://cinemax.vn/movie/${movieId}`,
      });
    } catch {}
  };

  const handleBookNow = () => {
    if (!selectedShowtime) {
      Alert.alert('Chọn suất chiếu', 'Vui lòng chọn một suất chiếu trước khi đặt vé.');
      return;
    }
    navigation.navigate('SeatSelection', { showtimeId: selectedShowtime.id });
  };

  if (loading) return (
    <View style={[styles.container, styles.centerContainer, { justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color={Theme.colors.accent} />
    </View>
  );

  if (error || !data) return (
    <View style={[styles.container, styles.centerContainer, { justifyContent: 'center' }]}>
      <Ionicons name="wifi-outline" size={48} color="#444" />
      <Text style={[styles.errorText, { textAlign: 'center', paddingHorizontal: 20 }]}>{error}</Text>
      <TouchableOpacity
        style={{ backgroundColor: Theme.colors.warning, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 8 }}
        onPress={fetchDetail}
      >
        <Text style={{ color: '#000', fontWeight: 'bold' }}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const movie = data.movie;
  const posterUrl = movie.posterUrl?.startsWith('http')
    ? movie.posterUrl
    : `${IMAGE_BASE_URL}${movie.posterUrl}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Animated Sticky Header (appears on scroll) */}
      <Animated.View style={[{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 200,
        backgroundColor: 'rgba(13,13,13,0.95)',
        paddingTop: insets.top, paddingBottom: 10,
        paddingHorizontal: Theme.spacing.md,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderBottomWidth: 1, borderBottomColor: Theme.colors.cardBorder,
      }, toolbarOpacity]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: Theme.colors.textPrimary, fontSize: 15, fontWeight: 'bold', flex: 1, textAlign: 'center' }} numberOfLines={1}>
          {movie.title}
        </Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Floating Back Button (visible when near top) */}
      <Animated.View style={[styles.headerActions, { top: insets.top + 10 }, floatingHeaderOpacity]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsFavorited(!isFavorited)}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorited ? Theme.colors.accent : '#fff'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Poster */}
        <View style={{ height: HEADER_HEIGHT }}>
          <Animated.View style={[styles.posterHeader, headerAnimatedStyle]}>
            <AnimatedImage 
              source={{ uri: posterUrl }} 
              // @ts-ignore: sharedTransitionTag is injected by Reanimated
              sharedTransitionTag={`poster-${movieId}`}
              style={styles.posterImage} 
              contentFit="cover" 
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.7)', '#0d0d0d']}
              locations={[0, 0.55, 1]}
              style={styles.posterOverlay}
            />
          </Animated.View>

          <View style={styles.heroInfo}>
            {/* Age + Genre Chips */}
            <View style={styles.badgesRow}>
              <View style={[styles.badgeAge, { backgroundColor: Theme.colors.badgeC18 }]}>
                <Text style={styles.badgeAgeText}>C18</Text>
              </View>
              {GENRE_CHIPS.slice(0, 2).map(g => (
                <View key={g} style={genreChipStyle}>
                  <Text style={genreChipTextStyle}>{g}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>

            <View style={styles.badgesRow}>
              <View style={styles.ratingChip}>
                <Ionicons name="star" size={14} color={Theme.colors.gold} />
                <Text style={styles.ratingText}>4.8/5 (328 lượt)</Text>
              </View>
              <Text style={styles.metaText}>{movie.durationMinutes} phút</Text>
              <View style={styles.statusChip}>
                <Text style={styles.statusText}>Đang chiếu</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.trailerBtn}
              onPress={() => Alert.alert('Trailer', 'Đang mở trailer...')}
            >
              <Ionicons name="play-circle" size={20} color="#fff" />
              <Text style={styles.trailerBtnText}>▶ Xem Trailer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>

          {/* Description */}
          <Text style={styles.sectionTitle}>MÔ TẢ PHIM</Text>
          <Text
            style={styles.description}
            numberOfLines={descExpanded ? undefined : 4}
          >
            {movie.description}
          </Text>
          <TouchableOpacity onPress={() => setDescExpanded(!descExpanded)}>
            <Text style={{ color: Theme.colors.warning, fontSize: 13, marginTop: -8, marginBottom: 16 }}>
              {descExpanded ? '▲ Thu gọn' : '▼ Xem thêm'}
            </Text>
          </TouchableOpacity>

          {/* Cast */}
          {movie.cast && (
            <>
              <Text style={styles.sectionTitle}>DIỄN VIÊN</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={movie.cast.split(',').map(s => s.trim()).filter(s => s)}
                keyExtractor={item => item}
                contentContainerStyle={{ gap: 12, marginBottom: 20 }}
                renderItem={({ item }) => <ActorCard name={item} />}
              />
            </>
          )}

          {/* Showtimes */}
          <Text style={styles.sectionTitle}>LỊCH CHIẾU & SUẤT CHIẾU</Text>

          {/* Date Slider */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={DATES}
            keyExtractor={item => item.dateString}
            contentContainerStyle={styles.dateSlider}
            renderItem={({ item }) => {
              const isActive = item.dateString === selectedDate;
              return (
                <TouchableOpacity
                  onPress={() => { setSelectedDate(item.dateString); setSelectedShowtime(null); }}
                  style={[styles.dateChip, isActive && styles.dateChipActive]}
                >
                  <Text style={[styles.dayName, isActive && styles.dateTextActive]}>
                    {item.dayName}
                  </Text>
                  <Text style={[styles.dayNumber, isActive && styles.dateTextActive]}>
                    {item.dayNumber}
                  </Text>
                  <Text style={[styles.monthLabel, isActive && styles.dateTextActive]}>
                    Th{item.month}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* Showtimes Grid */}
          {data.showtimes && data.showtimes.length > 0 ? (
            <View style={styles.cinemaGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Ionicons name="business-outline" size={16} color={Theme.colors.warning} />
                <Text style={styles.cinemaName}>CinemaX Landmark 81</Text>
              </View>
              <Text style={styles.cinemaLocation}>Tầng 10, Landmark 81, Bình Thạnh, TP.HCM</Text>
              <View style={styles.showtimesGrid}>
                {data.showtimes.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.showtimeCard, selectedShowtime?.id === item.id && styles.showtimeCardActive]}
                    onPress={() => setSelectedShowtime(item)}
                  >
                    <Text style={[styles.timeText, selectedShowtime?.id === item.id && styles.timeTextActive]}>
                      {item.startTime}
                    </Text>
                    <Text style={{ color: Theme.colors.textSecondary, fontSize: 10, marginTop: 2 }}>2D</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 30, gap: 10 }}>
              <Ionicons name="calendar-outline" size={40} color="#333" />
              <Text style={{ color: Theme.colors.textMuted, fontSize: 14 }}>Chưa có suất chiếu trong ngày này.</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Sticky Bottom */}
      <View style={[styles.stickyBottom, { paddingBottom: insets.bottom || 20 }]}>
        <View>
          <Text style={styles.cinemaText}>
            {selectedShowtime ? `${selectedShowtime.startTime} • CinemaX` : 'Chọn suất chiếu'}
          </Text>
          <Text style={styles.priceText}>
            {selectedShowtime ? `${selectedShowtime.price.toLocaleString('vi-VN')}đ` : '---'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, !selectedShowtime && { opacity: 0.5 }]}
          onPress={handleBookNow}
        >
          <Ionicons name="ticket-outline" size={18} color="#000" />
          <Text style={styles.bookButtonText}>Đặt Vé Ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Inline styles for cast & genre (không cần StyleSheet vì chỉ dùng 1 lần)
const genreChipStyle = {
  backgroundColor: 'rgba(255,255,255,0.15)',
  paddingHorizontal: 8, paddingVertical: 3,
  borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
};
const genreChipTextStyle = { color: Theme.colors.textSecondary, fontSize: 11 };

const castCardStyle = {
  width: 90, alignItems: 'center' as const, gap: 6,
};
const castAvatarStyle = {
  width: 60, height: 60, borderRadius: 30,
  borderWidth: 2, borderColor: Theme.colors.cardBorder,
  backgroundColor: Theme.colors.surface,
  justifyContent: 'center' as const, alignItems: 'center' as const,
};
const castNameStyle = {
  color: '#ddd', fontSize: 10, fontWeight: '600' as const,
  textAlign: 'center' as const, lineHeight: 13,
};
const castRoleStyle = {
  color: Theme.colors.textSecondary, fontSize: 9, textAlign: 'center' as const,
};

// Global cache to prevent infinite fetching loops across renders and components
const globalActorImageCache: Record<string, string> = {};

// --- Custom Actor Card Component to fetch Real Images ---
const ActorCard = React.memo(({ name }: { name: string }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(globalActorImageCache[name] || null);

  useEffect(() => {
    // Nếu ảnh đã có trong cache thì không gọi API nữa, tránh lỗi vòng lặp gọi API (DDoS ẩn)
    if (globalActorImageCache[name]) {
      if (imageUrl !== globalActorImageCache[name]) {
        setImageUrl(globalActorImageCache[name]);
      }
      return;
    }

    let isMounted = true;
    const fetchWikiImage = async () => {
      try {
        // Try Vietnamese Wiki first
        let res = await fetch(`https://vi.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(name)}&gsrlimit=1&prop=pageimages&pithumbsize=200&format=json`);
        let json = await res.json();
        let pages = json.query?.pages;
        
        let img: string | undefined;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          img = pages[pageId]?.thumbnail?.source;
        }

        // Fallback to English Wiki
        if (!img) {
          res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(name)}&gsrlimit=1&prop=pageimages&pithumbsize=200&format=json`);
          json = await res.json();
          pages = json.query?.pages;
          if (pages) {
            const pageId = Object.keys(pages)[0];
            img = pages[pageId]?.thumbnail?.source;
          }
        }

        if (img) {
          globalActorImageCache[name] = img; // Lưu vào cache toàn cục
          if (isMounted) setImageUrl(img);
        }
      } catch (e) {
        // Silent fail to fallback
      }
    };
    
    // Đảm bảo không gọi song song quá nhiều request bằng cách setTimeout nhỏ hoặc chỉ gọi khi đang render
    fetchWikiImage();
    
    return () => { isMounted = false; };
  }, [name]);

  return (
    <View style={castCardStyle}>
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={castAvatarStyle}
          contentFit="cover" 
        />
      ) : (
        <View style={[castAvatarStyle, { backgroundColor: '#333', borderColor: '#444' }]}>
          <Ionicons name="person" size={32} color="#666" />
        </View>
      )}
      <Text style={castNameStyle} numberOfLines={2}>{name}</Text>
      <Text style={castRoleStyle} numberOfLines={1}>Diễn viên</Text>
    </View>
  );
});
