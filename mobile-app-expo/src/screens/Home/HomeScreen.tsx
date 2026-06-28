import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MovieService } from '../../services/MovieService';
import { Movie } from '../../models/Movie';
import { MovieCard, MOVIE_CARD_WIDTH } from '../../components/features/MovieCard';
import { Theme } from '../../theme/tokens';
import { styles } from './styles';

export const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [nowShowing, setNowShowing] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      // Gọi API song song cho Phim Đang Chiếu và Sắp Chiếu
      const [nowRes, soonRes] = await Promise.all([
        MovieService.getMovies('now_showing', 1),
        MovieService.getMovies('coming_soon', 1)
      ]);
      setNowShowing(nowRes.data || []);
      setComingSoon(soonRes.data || []);
    } catch (err: any) {
      setError('Mất kết nối Internet hoặc Lỗi máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleMoviePress = (id: number) => {
    // Điều hướng tới màn hình Chi tiết Phim
    navigation.navigate('MovieDetail', { movieId: id });
  };

  // Render một Danh sách trượt ngang (FlatList horizontal)
  const renderSection = (title: string, data: Movie[]) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MovieCard movie={item} onPress={handleMoviePress} />}
        contentContainerStyle={styles.listContent}
        // snapToInterval giúp vuốt mượt mà dừng lại đúng 1 card
        snapToInterval={MOVIE_CARD_WIDTH + Theme.spacing.md}
        decelerationRate="fast"
      />
    </View>
  );

  return (
    // Đổi từ SafeAreaView thành View thường, vì ta sẽ tự đẩy khoảng cách bằng insets!
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />

      {/* Header Logo & Icons với paddingTop bằng độ cao tai thỏ + 16px */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.logo}>CinemaX</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarButton}>
            <Ionicons name="person-circle" size={32} color={Theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Fallback & Loading States */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchMovies}>
            <Text style={styles.retryButton}>Thử lại ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Nội dung chính: FlatList dọc chứa các Section ngang */
        <FlatList
          showsVerticalScrollIndicator={false}
          data={[
            { id: 'now', title: 'Phim Đang Chiếu', data: nowShowing },
            
            { id: 'soon', title: 'Phim Sắp Chiếu', data: comingSoon }
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderSection(item.title, item.data)}
          

        />
      )}
    </View>
  );
};
