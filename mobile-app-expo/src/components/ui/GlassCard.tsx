import React from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { Theme } from '../../theme/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Glass intensity: 'light' for subtle, 'regular' for standard */
  intensity?: 'light' | 'regular';
  /** Whether the card has a visible border */
  bordered?: boolean;
  /** Custom border radius override */
  borderRadius?: number;
}

/**
 * GlassCard — Kính mờ component kiểu iOS
 * 
 * Sử dụng `expo-glass-effect` GlassView trên iOS 26+.
 * Fallback sang semi-transparent View với backdrop mờ trên các platform khác.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 'regular',
  bordered = true,
  borderRadius = Theme.radius.card,
}) => {
  const glassAvailable = isGlassEffectAPIAvailable();

  const containerStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
    ...(bordered && {
      borderWidth: 1,
      borderColor: intensity === 'light'
        ? Theme.colors.glass.borderLight
        : Theme.colors.glass.border,
    }),
    ...Theme.shadows.glass,
  };

  if (glassAvailable) {
    return (
      <GlassView
        glassEffectStyle={intensity === 'light' ? 'clear' : 'regular'}
        colorScheme="dark"
        tintColor={Theme.colors.glass.tint}
        style={[containerStyle, styles.padding, style]}
      >
        {children}
      </GlassView>
    );
  }

  // Fallback: Semi-transparent dark background
  return (
    <View
      style={[
        containerStyle,
        styles.padding,
        {
          backgroundColor: intensity === 'light'
            ? Theme.colors.glass.backgroundLight
            : Theme.colors.glass.background,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  padding: {
    padding: Theme.spacing.lg,
  },
});
