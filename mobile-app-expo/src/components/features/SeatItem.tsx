import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSequence } from 'react-native-reanimated';
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

  // Hiệu ứng scale popup nhẹ khi chọn hoặc bỏ chọn ghế
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

  const handlePress = () => {
    if (isUnavailable) return;
    onSelect(seat);
  };

  return (
    <AnimatedPressable
      style={[
        styles.seat,
        isUnavailable && styles.seatUnavailable,
        isSelected && styles.seatSelected
      ]}
      onPress={handlePress}
      onPressIn={() => !isUnavailable && (scale.value = withTiming(0.9, { duration: 100 }))}
      onPressOut={() => !isUnavailable && (scale.value = withTiming(1, { duration: 100 }))}
      disabled={isUnavailable}
    >
      <Text style={[styles.seatText, isSelected && styles.seatTextSelected]}>
        {seat.code}
      </Text>
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
