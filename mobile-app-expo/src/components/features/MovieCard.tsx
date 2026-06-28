import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Movie } from '../../models/Movie';
import { Theme } from '../../theme/tokens';
import { IMAGE_BASE_URL } from '../../api/apiClient';

const { width } = Dimensions.get('window');
// Hiển thị 2.5 thẻ phim trên màn hình để user biết có thể vuốt ngang
export const MOVIE_CARD_WIDTH = width * 0.4;

interface Props {
  movie: Movie;
  onPress: (id: number) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MovieCard: React.FC<Props> = ({ movie, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <AnimatedPressable 
      style={[styles.container, animatedStyle]}
      onPress={() => onPress(movie.id)}
      onPressIn={() => scale.value = withTiming(0.96, { duration: 150 })}
      onPressOut={() => scale.value = withTiming(1, { duration: 150 })}
    >
      <View style={styles.imageContainer}>
        {/* Ảnh Poster với Placeholder background */}
        <Image 
          source={{ uri: movie.posterUrl?.startsWith('http') ? movie.posterUrl : `${IMAGE_BASE_URL}${movie.posterUrl}` }} 
          style={styles.poster}
          resizeMode="cover"
        />
        {/* Badge Cảnh báo & Trạng thái nằm đè lên góc trái */}
        <View style={[styles.badge, movie.status === 'now_showing' ? styles.badgeNow : styles.badgeSoon]}>
          <Text style={styles.badgeText}>
            {movie.status === 'now_showing' ? 'ĐANG CHIẾU' : 'SẮP CHIẾU'}
          </Text>
        </View>
      </View>
      {/* Tiêu đề in đậm, tối đa 2 dòng */}
      <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
      <Text style={styles.genre} numberOfLines={1}>{movie.genre}</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: MOVIE_CARD_WIDTH,
    marginRight: Theme.spacing.md,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: Theme.radius.card,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
  },
  poster: {
    width: '100%',
    aspectRatio: 2/3,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 0,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
  },
  badgeNow: {
    backgroundColor: Theme.colors.badgeNow,
  },
  badgeSoon: {
    backgroundColor: Theme.colors.accent,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  genre: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  }
});
