import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { 
  SlideInDown, 
  SlideOutDown 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface SupportBottomBarProps {
  onPress: () => void;
  message?: string;
}

export const SupportBottomBar: React.FC<SupportBottomBarProps> = ({ 
  onPress,
  message = "Bạn cần hỗ trợ gì?"
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleClose = () => {
    Haptics.selectionAsync();
    setIsVisible(false);
  };

  return (
    <Animated.View 
      entering={SlideInDown.springify().damping(15)} 
      exiting={SlideOutDown}
      style={styles.container}
    >
      <Pressable onPress={handlePress} style={styles.bar}>
        <View style={styles.content}>
          <Ionicons name="chatbubbles" size={24} color={Theme.colors.accent} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Hỗ trợ trực tuyến</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
        </View>
        
        <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={15}>
          <Ionicons name="close" size={20} color={Theme.colors.textSecondary} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Above the tab bar
    alignSelf: 'center',
    width: width * 0.9,
    zIndex: 998, // Below mascot (999)
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    color: Theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  message: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  }
});
