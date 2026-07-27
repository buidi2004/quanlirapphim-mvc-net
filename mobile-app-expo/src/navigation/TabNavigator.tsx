import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Theme } from '../theme/tokens';
import { FloatingDockTabBar } from './components/FloatingDockTabBar';

// ── Tab Screens ──
import { HomeScreen } from '../screens/Home/HomeScreen';
import { MovieListScreen } from '../screens/Movie/MovieListScreen';
import { QuickBookScreen } from '../screens/Booking/QuickBookScreen';
import { CinemaListScreen } from '../screens/Cinema/CinemaListScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingDockTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Theme.colors.background },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="MovieTab" component={MovieListScreen} />
      <Tab.Screen name="BookingTab" component={QuickBookScreen} />
      <Tab.Screen name="CinemaTab" component={CinemaListScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
