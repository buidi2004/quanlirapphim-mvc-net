import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';
import { Theme } from '../../theme/tokens';
import { Movie } from '../../models/Movie';
import { IMAGE_BASE_URL } from '../../api/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 180;
const ITEM_WIDTH = SCREEN_WIDTH / 1.15; // Exact 1.15 slides per view

interface TopAdsBannerProps {
  movies?: Movie[];
  onPress: (id: number) => void;
}

export const TopAdsBanner: React.FC<TopAdsBannerProps> = ({ movies = [], onPress }) => {
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={ITEM_WIDTH}
        height={BANNER_HEIGHT}
        style={{ width: SCREEN_WIDTH }}
        autoPlay={true}
        autoPlayInterval={3000} // 3 seconds as requested
        data={movies}
        scrollAnimationDuration={1000}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 40,
        }}
        renderItem={({ item }) => {
          const imageUrl = item.posterUrl?.startsWith('http') 
            ? item.posterUrl 
            : `${IMAGE_BASE_URL}${item.posterUrl}`;

          return (
            <TouchableOpacity 
              activeOpacity={0.9}
              style={styles.slideContainer}
              onPress={() => onPress(item.id)}
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.bannerImage}
                contentFit="cover"
                transition={200}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    marginVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  slideContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Theme.colors.surface,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  }
});
