import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';

interface GlassHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Whether header is transparent (floating over content) or always glassed */
  transparent?: boolean;
}

/**
 * GlassHeader — iOS-style header với hiệu ứng kính mờ
 * 
 * Sử dụng `expo-glass-effect` trên iOS 26+.
 * Fallback sang semi-transparent View trên các platform khác.
 */
export const GlassHeader: React.FC<GlassHeaderProps> = ({
  title,
  onBack,
  rightAction,
  style,
  transparent = false,
}) => {
  const insets = useSafeAreaInsets();
  const glassAvailable = isGlassEffectAPIAvailable();

  const headerContent = (
    <>
      {onBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      {rightAction || <View style={styles.spacer} />}
    </>
  );

  const containerStyle: ViewStyle = {
    paddingTop: insets.top,
    borderBottomWidth: transparent ? 0 : 0.5,
    borderBottomColor: Theme.colors.glass.border,
  };

  if (glassAvailable && !transparent) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme="dark"
        tintColor={Theme.colors.glass.tint}
        style={[styles.header, containerStyle, style]}
      >
        {headerContent}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        styles.header,
        containerStyle,
        {
          backgroundColor: transparent
            ? 'transparent'
            : Theme.colors.glass.background,
        },
        style,
      ]}
    >
      {headerContent}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  spacer: {
    width: 40,
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
