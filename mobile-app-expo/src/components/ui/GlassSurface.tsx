import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../theme/tokens';

export type GlassVariant = 'dock' | 'header' | 'card' | 'sheet';

interface GlassSurfaceProps {
  variant: GlassVariant;
  borderRadius?: number;
  style?: any;
  children?: React.ReactNode;
}

// Thông số blur đã canh chỉnh thủ công để match độ mờ/độ sáng của Apple Liquid Glass
// (đo bằng mắt trên thiết bị thật, không dùng số mặc định của thư viện)
const GLASS_TUNING: Record<GlassVariant, { intensity: number; iosTint: string; androidTint: 'light' | 'dark' | 'default' }> = {
  dock:   { intensity: 62, iosTint: 'systemMaterial', androidTint: 'default' },
  header: { intensity: 45, iosTint: 'systemMaterial', androidTint: 'default' },
  card:   { intensity: 38, iosTint: 'systemMaterial', androidTint: 'default' },
  sheet:  { intensity: 70, iosTint: 'systemMaterial', androidTint: 'default' },
};

export const GlassSurface = ({ variant, borderRadius = Theme.radius.card, style, children }: GlassSurfaceProps) => {
  const { isDark } = useTheme();
  const tuning = GLASS_TUNING[variant];
  const canUseNativeLiquidGlass = Platform.OS === 'ios' && isGlassEffectAPIAvailable();

  const content = (
    <>
      {/* Viền sáng hắt trên cùng — chi tiết quyết định "cảm giác kính" giống Apple */}
      <View pointerEvents="none" style={[styles.topHighlight, { borderRadius }]} />
      {children}
    </>
  );

  if (canUseNativeLiquidGlass) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme={isDark ? 'dark' : 'light'}
        tintColor={Theme.colors.glass?.tint || 'rgba(13, 13, 13, 0.4)'}
        style={[{ borderRadius, overflow: 'hidden' }, styles.border, style]}
      >
        {content}
      </GlassView>
    );
  }

  // iOS < 26 và toàn bộ Android: blur thật qua expo-blur, canh chỉnh để match Apple
  return (
    <BlurView
      intensity={tuning.intensity}
      tint={Platform.OS === 'ios' ? (isDark ? 'systemMaterialDark' : 'systemMaterialLight') : (isDark ? 'dark' : 'light')}
      style={[{ borderRadius, overflow: 'hidden' }, styles.border, style]}
    >
      {Platform.OS === 'android' && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: Theme.colors.glass.background }]} />
      )}
      {content}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  border: {
    borderWidth: 0.5,
    borderColor: Theme.colors.glass?.border || 'rgba(255, 255, 255, 0.12)',
  },
  topHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: Theme.colors.glass?.topHighlight || 'rgba(255, 255, 255, 0.35)',
  },
});
