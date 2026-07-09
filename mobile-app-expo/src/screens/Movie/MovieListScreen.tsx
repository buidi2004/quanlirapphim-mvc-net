import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Theme } from '../../theme/tokens';
import { MovieService } from '../../services/MovieService';
import { Movie } from '../../models/Movie';
import { IMAGE_BASE_URL } from '../../api/apiClient';

const STATUS_TABS = [
  { id: 'now_showing', title: 'Đang Chiếu' },
  { id: 'coming_soon', title: 'Sắp Chiếu' },
  { id: 'stopped', title: 'Đã Dừng Chiếu' },
];

const GENRES = ['Tất cả', 'Hành động', 'Kinh dị', 'Tình cảm', 'Hài hước', 'Khoa học viễn tưởng'];

export const MovieListScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState('now_showing');
  const [activeGenre, setActiveGenre] = useState('Tất cả');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async (status: string, genre: string, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      
      const genreParam = genre === 'Tất cả' ? undefined : genre;
      const res = await MovieService.getMovies(status as any, 1, genreParam);
      
      setMovies(res.data || []);
    } catch (e) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMovies(activeTab, activeGenre);
  }, [activeTab, activeGenre]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMovies(activeTab, activeGenre, true);
  };

  const renderMovieCard = ({ item }: { item: Movie }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
    >
      <View style={styles.posterWrapper}>
        <Image 
          source={{ uri: item.posterUrl?.startsWith('http') ? item.posterUrl : `${IMAGE_BASE_URL}${item.posterUrl}` }} 
          style={styles.poster}
          contentFit="cover"
        />
        <View style={styles.badgeAge}>
          <Text style={styles.badgeAgeText}>C18</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.genre} numberOfLines={1}>{item.genre}</Text>
        <Text style={styles.duration}>{item.durationMinutes} phút</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DANH SÁCH PHIM</Text>
      </View>

      <View style={styles.filterContainer}>
        {/* Status Tabs */}
        <View style={styles.statusTabs}>
          {STATUS_TABS.map(tab => (
            <TouchableOpacity 
              key={tab.id}
              style={[styles.statusTab, activeTab === tab.id && styles.statusTabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.statusTabText, activeTab === tab.id && styles.statusTabTextActive]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Genre Slider */}
        <View style={styles.genreWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={GENRES}
            keyExtractor={item => item}
            contentContainerStyle={styles.genreList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.genreChip, activeGenre === item && styles.genreChipActive]}
                onPress={() => setActiveGenre(item)}
              >
                <Text style={[styles.genreChipText, activeGenre === item && styles.genreChipTextActive]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.gold} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchMovies(activeTab, activeGenre)}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="videocam-outline" size={60} color="#444" />
          <Text style={styles.emptyText}>Chưa có phim nào trong danh mục này.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setActiveTab('now_showing'); setActiveGenre('Tất cả'); }}>
            <Text style={styles.retryBtnText}>Xem phim đang chiếu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.gold} />
          }
          renderItem={renderMovieCard}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
    alignItems: 'center',
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
  },
  statusTabs: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    gap: 8,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  statusTabActive: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderColor: Theme.colors.gold,
  },
  statusTabText: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusTabTextActive: {
    color: Theme.colors.gold,
  },
  genreWrapper: {
    marginBottom: Theme.spacing.md,
  },
  genreList: {
    paddingHorizontal: Theme.spacing.md,
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  genreChipActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  genreChipText: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
  },
  genreChipTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  gridContent: {
    padding: Theme.spacing.md,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  card: {
    width: '48%',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.card,
    overflow: 'hidden',
  },
  posterWrapper: {
    position: 'relative',
    height: 220,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  badgeAge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e50914',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeAgeText: {
    color: Theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  info: {
    padding: 8,
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  genre: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  duration: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  errorText: {
    color: Theme.colors.accent,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: Theme.colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#000',
    fontWeight: 'bold',
  }
});
