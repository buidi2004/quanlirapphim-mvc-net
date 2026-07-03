import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar,
} from 'react-native';
import { Theme } from '../../theme/tokens';

const { width, height } = Dimensions.get('window');

export const SplashScreen = ({ onFinish }: { onFinish?: () => void }) => {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Fade in logo
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      ]),
      // Loading bar
      Animated.timing(barWidth, { toValue: width * 0.6, duration: 1200, useNativeDriver: false }),
    ]).start(() => {
      setTimeout(() => onFinish?.(), 300);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Background glow */}
      <View style={styles.glow} />

      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Text style={styles.logoIcon}>🎬</Text>
        <Text style={styles.logoText}>CinemaX</Text>
        <Text style={styles.logoTagline}>Trải nghiệm điện ảnh đỉnh cao</Text>
      </Animated.View>

      {/* Loading bar */}
      <View style={styles.barContainer}>
        <Animated.View style={[styles.barFill, { width: barWidth }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Theme.colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(229,9,20,0.06)',
    top: height / 2 - 180,
  },
  logoWrap: { alignItems: 'center', gap: 8 },
  logoIcon: { fontSize: 64, marginBottom: 8 },
  logoText: {
    color: '#fff', fontSize: 42, fontWeight: '900',
    letterSpacing: -1,
    textShadowColor: 'rgba(229,9,20,0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  logoTagline: { color: '#888', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' },

  barContainer: {
    position: 'absolute', bottom: 80,
    width: width * 0.6, height: 3,
    backgroundColor: '#222', borderRadius: 2, overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Theme.colors.accent,
    borderRadius: 2,
  },
});
