import React, { useRef } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { MovieCard } from './MovieCard';
import { Movie } from '../../models/Movie';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.65; // Thẻ rộng 65% màn hình để chừa nhiều khoảng ló ra ở 2 bên

interface MoviePosterCarouselProps {
  movies: Movie[];
  onMoviePress: (id: number) => void;
}

export const MoviePosterCarousel: React.FC<MoviePosterCarouselProps> = ({ movies, onMoviePress }) => {
  const carouselRef = useRef(null);

  if (!movies || movies.length === 0) return null;

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop={true}
        width={SCREEN_WIDTH}
        height={CARD_WIDTH * 1.33} // Tỷ lệ 3:4 chuẩn, không cần chừa chỗ cho chữ
        data={movies}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.85, 
          // Pull adjacent items closer so they are spaced nicely (add to offset to pull closer)
          parallaxScrollingOffset: (SCREEN_WIDTH - CARD_WIDTH) + 12, 
        }}
        style={{ width: SCREEN_WIDTH }}
        snapEnabled={true}
        pagingEnabled={true}
        windowSize={3}
        renderItem={({ item, index }) => (
          <View style={styles.cardContainer}>
            <View style={styles.shadowWrapper}>
              <MovieCard 
                movie={item} 
                onPress={onMoviePress} 
                style={{ width: '100%', marginRight: 0 }}
                hideText={true}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CARD_WIDTH * 1.33 + 30, // Chừa thêm chút xíu margin bottom để hiển thị bóng đổ (shadow)
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
    // MovieCard width needs to match CARD_WIDTH exactly for perfect scale
    width: CARD_WIDTH,
  }
});
