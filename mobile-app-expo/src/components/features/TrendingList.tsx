import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '../../models/Movie';
import { Theme } from '../../theme/tokens';
import { IMAGE_BASE_URL } from '../../api/apiClient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TRENDING_CARD_WIDTH = width * 0.75;

interface Props {
  movies: Movie[];
  onPress: (id: number) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TrendingList: React.FC<Props> = ({ movies, onPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Phim Thịnh Hành</Text>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={movies.slice(0, 5)}
        keyExtractor={(item) => item.id.toString()}
        snapToInterval={TRENDING_CARD_WIDTH + Theme.spacing.md}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: Theme.spacing.md }}
        renderItem={({ item, index }) => <TrendingCard movie={item} rank={index + 1} onPress={onPress} />}
      />
    </View>
  );
};

const TrendingCard = ({ movie, rank, onPress }: { movie: Movie, rank: number, onPress: (id: number) => void }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <AnimatedPressable
      style={[styles.cardContainer, animatedStyle]}
      onPress={() => onPress(movie.id)}
      onPressIn={() => scale.value = withTiming(0.96, { duration: 150 })}
      onPressOut={() => scale.value = withTiming(1, { duration: 150 })}
    >
      <Image 
        source={{ uri: movie?.posterUrl?.startsWith('http') ? movie.posterUrl : `${IMAGE_BASE_URL}${movie?.posterUrl}` }} 
        style={styles.poster} 
        contentFit="cover" 
      />
      <LinearGradient 
        colors={['transparent', 'rgba(0,0,0,0.95)']} 
        style={styles.overlay}
      >
        <Text style={styles.rank}>#{rank}</Text>
        <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
        
        <View style={styles.ratingRow}>
          <View style={styles.ratingChip}>
            <Ionicons name="star" size={12} color="#ffc107" />
            <Text style={styles.ratingText}>4.8/5</Text>
          </View>
          <Text style={styles.genre}>{movie.genre}</Text>
        </View>

        <View style={styles.btn}>
          <Text style={styles.btnText}>ĐẶT VÉ</Text>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.xl,
  },
  header: {
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardContainer: {
    width: TRENDING_CARD_WIDTH,
    height: TRENDING_CARD_WIDTH * 1.4,
    marginRight: Theme.spacing.md,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
  },
  poster: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: Theme.spacing.md,
  },
  rank: {
    color: Theme.colors.gold,
    fontSize: 48,
    fontWeight: '900',
    fontStyle: 'italic',
    position: 'absolute',
    top: -20,
    right: 10,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  genre: {
    color: '#ccc',
    fontSize: 12,
  },
  btn: {
    backgroundColor: Theme.colors.accent,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  }
});
