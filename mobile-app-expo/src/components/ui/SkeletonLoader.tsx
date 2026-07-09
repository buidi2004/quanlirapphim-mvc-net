import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Skeleton } from 'moti/skeleton';
import { Theme } from '../../theme/tokens';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  type?: 'banner' | 'movieCard' | 'list';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'list' }) => {
  const isDark = true; // Assuming dark theme for CinemaX
  const colorMode = isDark ? 'dark' : 'light';

  if (type === 'banner') {
    return (
      <View style={styles.bannerContainer}>
        <Skeleton colorMode={colorMode} width={width} height={480} />
      </View>
    );
  }

  if (type === 'movieCard') {
    return (
      <View style={styles.cardContainer}>
        <Skeleton colorMode={colorMode} width={140} height={210} radius={Theme.radius.md} />
        <View style={styles.textSkeleton}>
          <Skeleton colorMode={colorMode} width={120} height={16} radius={4} />
          <View style={{ height: 8 }} />
          <Skeleton colorMode={colorMode} width={80} height={12} radius={4} />
        </View>
      </View>
    );
  }

  // Default 'list'
  return (
    <View style={styles.listContainer}>
      <View style={styles.headerSkeleton}>
        <Skeleton colorMode={colorMode} width={150} height={24} radius={4} />
        <Skeleton colorMode={colorMode} width={60} height={16} radius={4} />
      </View>
      <View style={styles.row}>
        {[1, 2, 3].map((key) => (
          <View key={key} style={styles.cardContainer}>
            <Skeleton colorMode={colorMode} width={140} height={210} radius={Theme.radius.md} />
            <View style={styles.textSkeleton}>
              <Skeleton colorMode={colorMode} width={120} height={16} radius={4} />
              <View style={{ height: 8 }} />
              <Skeleton colorMode={colorMode} width={80} height={12} radius={4} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    marginBottom: 20,
  },
  cardContainer: {
    marginRight: 16,
  },
  textSkeleton: {
    marginTop: 12,
  },
  listContainer: {
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  headerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
});
