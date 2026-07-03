import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Theme } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

export interface Concession {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  price: number;
  imageUrl: string;
  isLimited?: boolean;
}

interface Props {
  item: Concession;
  quantity: number;
  onQuantityChange: (delta: number) => void;
}

export const ConcessionItem: React.FC<Props> = ({ item, quantity, onQuantityChange }) => {
  const scale = useSharedValue(1);

  const handleQtyChange = (delta: number) => {
    onQuantityChange(delta);
    // Price bump animation
    scale.value = withSequence(
      withTiming(1.15, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {item.isLimited && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>LTD</Text>
            </View>
          )}
        </View>
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.priceRow}>
          <View>
            {item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>{item.originalPrice.toLocaleString('vi-VN')}₫</Text>
            )}
            <Animated.Text style={[styles.price, animatedStyle]}>
              {item.price.toLocaleString('vi-VN')}₫
            </Animated.Text>
          </View>
          
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.btn, quantity === 0 && styles.btnDisabled]}
              onPress={() => handleQtyChange(-1)}
              disabled={quantity === 0}
            >
              <Ionicons name="remove" size={16} color={quantity === 0 ? '#666' : '#fff'} />
            </TouchableOpacity>
            
            <Text style={styles.quantity}>{quantity}</Text>
            
            <TouchableOpacity 
              style={styles.btn}
              onPress={() => handleQtyChange(1)}
            >
              <Ionicons name="add" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: '#333',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: Theme.radius.md,
    backgroundColor: '#333',
    marginRight: Theme.spacing.md,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    backgroundColor: Theme.colors.gold,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900',
  },
  desc: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  originalPrice: {
    color: '#666',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  price: {
    color: Theme.colors.gold,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#444',
  },
  quantity: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  }
});
