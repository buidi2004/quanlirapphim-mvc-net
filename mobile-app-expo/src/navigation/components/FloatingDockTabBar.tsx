import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { Theme } from '../../theme/tokens';

const TAB_ICONS: Record<string, { outline: keyof typeof Ionicons.glyphMap, filled: keyof typeof Ionicons.glyphMap }> = {
  HomeTab: { outline: 'home-outline', filled: 'home' },
  MovieTab: { outline: 'film-outline', filled: 'film' },
  BookingTab: { outline: 'ticket-outline', filled: 'ticket' },
  CinemaTab: { outline: 'location-outline', filled: 'location' },
  ProfileTab: { outline: 'person-outline', filled: 'person' },
};

export const FloatingDockTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  
  // We only show the 4 main routes in this specific bar
  const mainRoutes = state.routes.filter(r => r.name !== 'BookingTab');

  const focusedRoute = state.routes[state.index];
  const { options } = descriptors[focusedRoute.key];
  if (options.tabBarStyle && (options.tabBarStyle as any).display === 'none') {
    return null;
  }

  return (
    <View style={[dockStyles.navContainer, { bottom: Math.max(insets.bottom, 24) }]}>
      <GlassSurface variant="dock" style={dockStyles.mainNav} borderRadius={40}>
        {mainRoutes.map((route, index) => {
          const isFocused = state.index === state.routes.indexOf(route);
          const icons = TAB_ICONS[route.name] || { outline: 'home-outline', filled: 'home' };
          const iconName = isFocused ? icons.filled : icons.outline;
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity 
              key={route.key} 
              style={[dockStyles.iconButton, isFocused && dockStyles.activeTab]} 
              onPress={onPress} 
              activeOpacity={0.8}
            >
              <Ionicons 
                name={iconName} 
                size={22} 
                color={isFocused ? '#000' : Theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          );
        })}
      </GlassSurface>
    </View>
  );
};

const dockStyles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    alignSelf: 'center',
    width: 320,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  mainNav: {
    flexDirection: 'row',
    height: 64, // 48px icons + 16px padding
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Theme.colors.glass.border,
    backgroundColor: 'transparent',
  },
  iconButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  activeTab: {
    backgroundColor: Theme.colors.warning, // system yellow
    shadowColor: Theme.colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  }
});
