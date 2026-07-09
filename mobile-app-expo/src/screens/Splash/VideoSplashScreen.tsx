import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  withRepeat,
  withSequence,
  runOnJS 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';

const { width, height } = Dimensions.get('window');
const BG_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1080&auto=format&fit=crop';

interface VideoSplashScreenProps {
  onFinish: () => void;
}

export const VideoSplashScreen: React.FC<VideoSplashScreenProps> = ({ onFinish }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);
  const lightPosition = useSharedValue(-width);

  useEffect(() => {
    // Logo animation
    scale.value = withSpring(1, { damping: 10 });
    opacity.value = withTiming(1, { duration: 600 });

    // Spotlight sweep animation (looping left to right)
    lightPosition.value = withRepeat(
      withTiming(width, { duration: 2500 }),
      -1,
      false
    );

    // Hide splash after 4.5 seconds (quicker than video)
    const timer = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      });
    }, 4500);

    return () => clearTimeout(timer);
  }, [scale, opacity, containerOpacity, lightPosition, onFinish]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const lightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: lightPosition.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Static Background Image */}
      <Image
        source={{ uri: BG_IMAGE }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      
      {/* Dark overlay to make it look like a dark cinema */}
      <View style={styles.overlay} />

      {/* Sweeping Spotlight Effect */}
      <Animated.View style={[styles.spotlightWrapper, lightStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.15)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View style={[styles.logoBottom, logoStyle]}>
        <Ionicons name="videocam-outline" size={40} color="#fff" />
        <Text style={styles.logoText}>CinemaX</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,10,10,0.85)', // Very dark overlay
  },
  spotlightWrapper: {
    ...StyleSheet.absoluteFill,
    width: width * 1.5, // Wider than screen for sweeping effect
    transform: [{ skewX: '-20deg' }], // Slanted spotlight
  },
  logoBottom: {
    position: 'absolute',
    bottom: height * 0.1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  logoText: {
    color: '#fff', 
    fontSize: 36, 
    fontWeight: '900',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(229,9,20,0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
});
