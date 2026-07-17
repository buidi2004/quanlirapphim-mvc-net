import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSequence } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Seat } from '../../models/Booking';
import { Theme } from '../../theme/tokens';

interface Props {
  seat: Seat;
  isSelected: boolean;
  onSelect: (seat: Seat) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SeatItem: React.FC<Props> = ({ seat, isSelected, onSelect }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 150 }), 
        withTiming(1, { duration: 150 })
      );
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const isUnavailable = seat.status === 'paid' || seat.status === 'holding' || seat.status === 'maintenance';
  const isVip = seat.type === 'VIP';
  const isSweetbox = seat.type === 'Sweetbox';

  const handlePress = () => {
    if (isUnavailable) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(seat);
  };

  const getContainerStyle = () => {
    let baseStyles: any[] = [styles.seat];
    if (isSweetbox) baseStyles.push(styles.seatSweetbox);
    if (isVip) baseStyles.push(styles.seatVip);
    if (isUnavailable) baseStyles.push(styles.seatUnavailable);
    if (isSelected) baseStyles.push(styles.seatSelected);
    return baseStyles;
  };

  const renderContent = () => {
    if (isSweetbox && !isUnavailable && !isSelected) {
      return (
        <LinearGradient colors={['#ff4b2b', '#ff416c']} style={styles.sweetboxGradient}>
          <Text style={[styles.seatText, { color: '#fff' }]}>{seat.code}</Text>
        </LinearGradient>
      );
    }
    return (
      <Text style={[styles.seatText, isSelected && styles.seatTextSelected, isVip && !isSelected && !isUnavailable && { color: Theme.colors.gold }]}>
        {seat.code}
      </Text>
    );
  };

  return (
    <AnimatedPressable
      style={[getContainerStyle(), animatedStyle]}
      onPress={handlePress}
      onPressIn={() => !isUnavailable && (scale.value = withTiming(0.9, { duration: 100 }))}
      onPressOut={() => !isUnavailable && (scale.value = withTiming(1, { duration: 100 }))}
      disabled={isUnavailable}
    >
      {renderContent()}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  seat: {
    width: 36,
    height: 36,
    backgroundColor: Theme.colors.surface,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden',
  },
  seatVip: {
    borderColor: Theme.colors.gold,
    borderWidth: 1.5,
  },
  seatSweetbox: {
    width: 76, // 36*2 + 4 margin
    borderColor: '#ff416c',
  },
  sweetboxGradient: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatUnavailable: {
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
    opacity: 0.5,
  },
  seatSelected: {
    backgroundColor: Theme.colors.accent,
    borderColor: Theme.colors.accent,
  },
  seatText: {
    color: Theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  seatTextSelected: {
    color: '#fff',
  }
});
