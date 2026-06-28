import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from './types';
import { Theme } from '../theme/tokens';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { MovieDetailScreen } from '../screens/Movie/MovieDetailScreen';
import { SeatSelectionScreen } from '../screens/Booking/SeatSelectionScreen';

import { View, Text } from 'react-native';
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background }}>
    <Text style={{ color: Theme.colors.textPrimary }}>{name}</Text>
  </View>
);

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Theme.colors.surface,
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: Theme.colors.accent,
        tabBarInactiveTintColor: Theme.colors.textMuted,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="CinemasTab" children={() => <PlaceholderScreen name="Rạp chiếu" />} options={{ tabBarLabel: 'Rạp' }} />
      <Tab.Screen name="TicketsTab" children={() => <PlaceholderScreen name="Vé của tôi" />} options={{ tabBarLabel: 'Vé' }} />
      <Tab.Screen name="ProfileTab" children={() => <PlaceholderScreen name="Tài khoản" />} options={{ tabBarLabel: 'Cá nhân' }} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer theme={{
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: Theme.colors.accent,
        background: Theme.colors.background,
        card: Theme.colors.surface,
        text: Theme.colors.textPrimary,
        border: '#333',
        notification: Theme.colors.accent,
      }
    }}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Theme.colors.background } }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
        <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
        {/* Additional screens will map here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
