import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { ImageBackground } from 'expo-image';
import { IMAGE_BASE_URL } from '../../api/apiClient';
import { MovieService } from '../../services/MovieService';
import { MovieDetailResponse, ShowtimeSummary } from '../../models/Movie';
import { styles } from './styles';
import { Theme } from '../../theme/tokens';
// Chú ý: Cần expo-constants hoặc react-native-safe-area-context để xử lý notch ở insets

export const MovieDetailScreen = ({ route, navigation }: any) => {
  const { movieId } = route.params;
  
  const [data, setData] = useState<MovieDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<ShowtimeSummary | null>(null);

  useEffect(() => {
    fetchDetail();
  }, [movieId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await MovieService.getMovieDetail(movieId);
      if (res.success) {
        setData(res);
      } else {
        setError(res.error || 'Lỗi lấy thông tin phim');
      }
    } catch (e) {
      setError('Mất kết nối Internet.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={[styles.container, styles.centerContainer]}>
      <ActivityIndicator size="large" color={Theme.colors.accent} />
    </View>
  );

  if (error || !data) return (
    <View style={[styles.container, styles.centerContainer]}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  const movie = data.movie;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <ImageBackground 
          source={{ uri: movie.posterUrl?.startsWith('http') ? movie.posterUrl : `${IMAGE_BASE_URL}${movie.posterUrl}` }} 
          style={styles.posterHeader}
          contentFit="cover"
          transition={200}
        >
          <View style={styles.posterOverlay} />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.metaText}>{movie.genre} • {movie.duration} phút</Text>
            <Text style={styles.metaText}>Đạo diễn: {movie.director}</Text>
          </View>
        </ImageBackground>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Nội Dung Phim</Text>
          <Text style={styles.description}>{movie.description}</Text>

          <Text style={styles.sectionTitle}>Lịch Chiếu Hôm Nay</Text>
          {data.showtimes && data.showtimes.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={data.showtimes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.showtimeCard,
                    selectedShowtime?.id === item.id && { borderColor: Theme.colors.accent, backgroundColor: 'rgba(229, 9, 20, 0.1)' }
                  ]}
                  onPress={() => setSelectedShowtime(item)}
                >
                  <Text style={styles.timeText}>{item.startTime}</Text>
                  <Text style={styles.cinemaText}>{item.cinemaName}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.metaText}>Hiện chưa có suất chiếu.</Text>
          )}
        </View>
      </ScrollView>

      {/* Quy tắc: Sticky Order Summary (Luôn hiển thị giá/nút neo cuối màn hình) */}
      <View style={[styles.stickyBottom, { paddingBottom: 24 }]}>
        <View>
          <Text style={styles.cinemaText}>Tạm tính:</Text>
          <Text style={styles.priceText}>
            {selectedShowtime ? `${selectedShowtime.price.toLocaleString('vi-VN')}đ` : '0đ'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.bookButton, !selectedShowtime && { opacity: 0.5 }]}
          disabled={!selectedShowtime}
          onPress={() => selectedShowtime && navigation.navigate('SeatSelection', { showtimeId: selectedShowtime.id })}
        >
          <Text style={styles.bookButtonText}>Chọn Ghế</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
