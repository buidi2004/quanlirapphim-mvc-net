import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  FadeInDown, 
  FadeOutDown 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Theme } from '../../theme/tokens';
import * as Haptics from 'expo-haptics';

interface FloatingMascotFABProps {
  onPress?: () => void;
  message?: string;
  mascotImage?: string; // Optional image URL
}

export const FloatingMascotFAB: React.FC<FloatingMascotFABProps> = ({ 
  onPress,
  message = "Đặt Vé Tại Đây!",
  mascotImage 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 400 }),
        withTiming(0, { duration: 400 })
      ),
      -1, // Infinite repeat
      true // Reverse
    );
  }, []);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  if (!isVisible) return null;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    }
  };

  const handleClose = () => {
    Haptics.selectionAsync();
    setIsVisible(false);
  };

  return (
    <Animated.View 
      entering={FadeInDown.springify().damping(12).delay(1000)} 
      exiting={FadeOutDown}
      style={styles.container}
    >
      <Animated.View style={bounceStyle}>
      <Pressable onPress={handlePress} style={styles.content}>
        {/* Chat Bubble */}
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{message}</Text>
          <View style={styles.triangle} />
          
          {/* Close Button on the bubble */}
          <Pressable 
            onPress={handleClose} 
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={16} color="rgba(0,0,0,0.3)" />
          </Pressable>
        </View>

        {/* Mascot Character */}
        <View style={styles.mascotContainer}>
          {mascotImage ? (
            <Image source={{ uri: mascotImage }} style={styles.mascotImage} />
          ) : (
            <View style={styles.mascotPlaceholder}>
              <Ionicons name="happy" size={40} color={Theme.colors.accent} />
            </View>
          )}
        </View>
      </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 8,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bubbleText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13,
  },
  triangle: {
    position: 'absolute',
    bottom: -6,
    right: 32,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    transform: [{ rotate: '180deg' }],
  },
  closeBtn: {
    marginLeft: 4,
  },
  mascotContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: Theme.colors.accent,
  },
  mascotImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  mascotPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
  },
});
