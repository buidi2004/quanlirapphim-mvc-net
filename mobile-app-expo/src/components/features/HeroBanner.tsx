import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  TouchableOpacity, ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// react-native-reanimated available for future enhancements
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 480;

const BANNERS = [
  {
    id: '1',
    movieId: 1,
    title: 'AVENGERS: ENDGAME',
    genre: 'Hành động · 181 phút · C13',
    status: '🔥 ĐANG CHIẾU',
    statusColor: Theme.colors.badgeNow,
    image: 'https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    rating: '4.9',
    trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
  },
  {
    id: '2',
    movieId: 2,
    title: 'DUNE: PART TWO',
    genre: 'Khoa học viễn tưởng · 166 phút · C13',
    status: '⚡ SẮP CHIẾU',
    statusColor: Theme.colors.badgeSoon,
    image: 'https://image.tmdb.org/t/p/original/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
    rating: '4.7',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
  },
  {
    id: '3',
    movieId: 3,
    title: 'DEADPOOL & WOLVERINE',
    genre: 'Hành động · Hài hước · C18',
    status: '🔥 HOT',
    statusColor: Theme.colors.accent,
    image: 'https://image.tmdb.org/t/p/original/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    rating: '4.8',
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
  },
];

const AUTO_SCROLL_INTERVAL = 4500;

export const HeroBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation<any>();
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll
  useEffect(() => {
    autoScrollTimer.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % BANNERS.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
    return () => { if (autoScrollTimer.current) clearInterval(autoScrollTimer.current); };
  }, []);

  const onViewableChange = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index as number);
    }
  }, []);

  const handleBook = (movieId: number) => {
    navigation.navigate('MovieDetail', { movieId });
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={BANNERS}
        keyExtractor={item => item.id}
        onViewableItemsChanged={onViewableChange}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item, index }) => (
          <View style={{ width: SCREEN_WIDTH }}>
            {/* Poster */}
            <Image
              source={{ uri: item.image }}
              style={styles.heroImage}
              contentFit="cover"
              transition={400}
            />

            {/* Gradient overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.55)', 'rgba(13,13,13,0.97)']}
              locations={[0, 0.5, 1]}
              style={styles.heroOverlay}
            >
              {/* Status Badge */}
              <View style={[styles.statusBadge, { backgroundColor: item.statusColor + 'CC' }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>

              {/* Title */}
              <Text style={styles.heroTitle} numberOfLines={2}>{item.title}</Text>

              {/* Meta */}
              <View style={styles.metaRow}>
                <Ionicons name="star" size={13} color={Theme.colors.gold} />
                <Text style={styles.metaRating}>{item.rating}/5</Text>
                <View style={styles.metaDot} />
                <Text style={styles.metaGenre} numberOfLines={1}>{item.genre}</Text>
              </View>

              {/* CTA Buttons */}
              <View style={styles.heroActions}>
                <TouchableOpacity
                  style={styles.btnBook}
                  onPress={() => handleBook(item.movieId)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="ticket" size={17} color="#000" />
                  <Text style={styles.btnBookText}>ĐẶT VÉ NGAY</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnInfo}
                  onPress={() => navigation.navigate('MovieDetail', { movieId: item.movieId })}
                  activeOpacity={0.85}
                >
                  <Ionicons name="information-circle-outline" size={17} color="#fff" />
                  <Text style={styles.btnInfoText}>Chi tiết</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}
      />

      {/* Progress Dots */}
      <View style={styles.dotsRow}>
        {BANNERS.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index: i, animated: true });
              setActiveIndex(i);
            }}
          >
            <View style={[
              styles.dot,
              i === activeIndex && styles.dotActive,
            ]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    backgroundColor: Theme.colors.background,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: Theme.spacing.lg,
    paddingBottom: 48,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.pill,
    marginBottom: 10,
  },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  heroTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 8,
    lineHeight: 36,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: -0.5,
  },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 4 },
  metaRating: { color: Theme.colors.gold, fontSize: 13, fontWeight: 'bold', marginLeft: 2 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#666', marginHorizontal: 6 },
  metaGenre: { color: '#bbb', fontSize: 12, flex: 1 },

  heroActions: { flexDirection: 'row', gap: 10 },
  btnBook: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Theme.colors.warning,
    paddingVertical: 13, paddingHorizontal: 20,
    borderRadius: Theme.radius.pill,
    flex: 1, justifyContent: 'center',
    shadowColor: Theme.colors.warning,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  btnBookText: { color: '#000', fontWeight: '800', fontSize: 13, letterSpacing: 0.3 },

  btnInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderColor: 'rgba(255,255,255,0.4)', borderWidth: 1.5,
    paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: Theme.radius.pill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  btnInfoText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  dotsRow: {
    position: 'absolute', bottom: 16, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    width: 20, height: 6, borderRadius: 3,
    backgroundColor: Theme.colors.warning,
  },
});
