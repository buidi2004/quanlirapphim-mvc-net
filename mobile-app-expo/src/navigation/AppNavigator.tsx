import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { RootStackParamList, MainTabParamList } from './types';
import { Theme } from '../theme/tokens';

// ── Tab Screens ──
import { HomeScreen } from '../screens/Home/HomeScreen';
import { MovieListScreen } from '../screens/Movie/MovieListScreen';
import { QuickBookScreen } from '../screens/Booking/QuickBookScreen';
import { CinemaListScreen } from '../screens/Cinema/CinemaListScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';

// ── Auth Screens ──
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/Auth/ResetPasswordScreen';

// ── Movie Flow ──
import { MovieDetailScreen } from '../screens/Movie/MovieDetailScreen';
import { MyTicketsScreen } from '../screens/Movie/MyTicketsScreen';
import { TicketDetailScreen } from '../screens/Movie/TicketDetailScreen';

// ── Booking Flow ──
import { SeatSelectionScreen } from '../screens/Booking/SeatSelectionScreen';
import { ConcessionScreen } from '../screens/Booking/ConcessionScreen';
import { ConcessionDetailScreen } from '../screens/Concession/ConcessionDetailScreen';
import { PaymentScreen } from '../screens/Payment/PaymentScreen';
import { PaymentSuccessScreen } from '../screens/Payment/PaymentSuccessScreen';

// ── Cinema Flow ──
import { CinemaDetailScreen } from '../screens/Cinema/CinemaDetailScreen';
import { GlobalShowtimesScreen } from '../screens/Cinema/GlobalShowtimesScreen';

// ── Profile Sub-screens ──
import { EditProfileScreen } from '../screens/Profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/Profile/ChangePasswordScreen';
import { TransactionHistoryScreen } from '../screens/Profile/TransactionHistoryScreen';

// ── Other Screens ──
import { SearchScreen } from '../screens/Search/SearchScreen';
import { NotificationScreen } from '../screens/Notification/NotificationScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { NewsListScreen } from '../screens/News/NewsListScreen';
import { NewsDetailScreen } from '../screens/News/NewsDetailScreen';
import { PromotionScreen } from '../screens/Promotion/PromotionScreen';
import { PromotionDetailScreen } from '../screens/Promotion/PromotionDetailScreen';
import { ContactScreen } from '../screens/Contact/ContactScreen';
import { ContactDetailScreen } from '../screens/Contact/ContactDetailScreen';

// ── Error, Splash, Onboarding ──
import { NotFoundScreen, ServerErrorScreen } from '../screens/Error/ErrorScreens';
import { SplashScreen } from '../screens/Splash/SplashScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';

// ── Experience & Static ──
import { ExperienceDetailScreen } from '../screens/Experience/ExperienceDetailScreen';
import { StaticPageScreen } from '../screens/Page/StaticPageScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ── Tab Icon Map ──
const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  HomeTab: { focused: 'home', unfocused: 'home-outline' },
  MovieTab: { focused: 'film', unfocused: 'film-outline' },
  BookingTab: { focused: 'ticket', unfocused: 'ticket-outline' },
  CinemaTab: { focused: 'business', unfocused: 'business-outline' },
  ProfileTab: { focused: 'person', unfocused: 'person-outline' },
};

const TAB_LABELS: Record<string, string> = {
  HomeTab: 'Trang chủ',
  MovieTab: 'Phim',
  BookingTab: 'Đặt vé',
  CinemaTab: 'Rạp',
  ProfileTab: 'Tài khoản',
};

// ── Floating Dock Tab Bar (macOS Dock style) ──
const FloatingDockTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const glassAvailable = isGlassEffectAPIAvailable();

  const dockContent = (
    <View style={dockStyles.innerRow}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isBooking = route.name === 'BookingTab';
        const iconSet = TAB_ICONS[route.name] || TAB_ICONS.HomeTab;
        const iconName = isFocused ? iconSet.focused : iconSet.unfocused;
        const label = TAB_LABELS[route.name] || route.name;

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

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Nút Đặt vé nổi bật giữa dock
        if (isBooking) {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.8}
              style={dockStyles.bookingBtnWrapper}
            >
              <View style={dockStyles.bookingBtn}>
                <Ionicons name={iconName} size={20} color="#fff" />
              </View>
              <Text style={[dockStyles.label, isFocused && dockStyles.labelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={label}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            style={dockStyles.tabItem}
          >
            <View style={[dockStyles.iconWrapper, isFocused && dockStyles.iconWrapperActive]}>
              <Ionicons
                name={iconName}
                size={21}
                color={isFocused ? Theme.colors.warning : '#666'}
              />
            </View>
            <Text style={[dockStyles.label, isFocused && dockStyles.labelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const dockOuterStyle = {
    bottom: Math.max(insets.bottom, 8) + 4,
  };

  if (glassAvailable) {
    return (
      <View style={[dockStyles.dockOuter, dockOuterStyle]}>
        <GlassView
          glassEffectStyle="regular"
          colorScheme="dark"
          tintColor={Theme.colors.glass.tint}
          style={dockStyles.dockContainer}
        >
          {dockContent}
        </GlassView>
      </View>
    );
  }

  // Fallback: semi-transparent dark background
  return (
    <View style={[dockStyles.dockOuter, dockOuterStyle]}>
      <View style={[dockStyles.dockContainer, dockStyles.dockFallback]}>
        {dockContent}
      </View>
    </View>
  );
};

const dockStyles = StyleSheet.create({
  dockOuter: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
  },
  dockContainer: {
    borderRadius: Theme.radius.dock,
    borderWidth: 0.5,
    borderColor: Theme.colors.glass.border,
    paddingVertical: 6,
    paddingHorizontal: 4,
    ...Theme.shadows.dock,
  },
  dockFallback: {
    backgroundColor: Theme.colors.glass.background,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(255, 193, 7, 0.12)',
  },
  bookingBtnWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    gap: 2,
  },
  bookingBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: '#555',
    marginTop: 1,
  },
  labelActive: {
    color: Theme.colors.warning,
  },
});

// ── Tab Navigator ──
const TabNavigator = () => {
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

export const AppNavigator = () => {
  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Theme.colors.warning,
      background: Theme.colors.background,
      card: '#12121e',
      text: Theme.colors.textPrimary,
      border: '#1a1a2e',
      notification: Theme.colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        {/* Main Tabs */}
        <Stack.Screen name="MainTabs" component={TabNavigator} />

        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

        {/* Movie Flow */}
        <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
        <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
        <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />

        {/* Booking Flow */}
        <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
        <Stack.Screen name="Concession" component={ConcessionScreen} />
        <Stack.Screen name="ConcessionDetail" component={ConcessionDetailScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ animation: 'fade' }} />

        {/* Cinema Flow */}
        <Stack.Screen name="CinemaDetail" component={CinemaDetailScreen} />
        <Stack.Screen name="GlobalShowtimes" component={GlobalShowtimesScreen} />

        {/* Search & Misc */}
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />

        {/* News */}
        <Stack.Screen name="NewsList" component={NewsListScreen} />
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />

        {/* Promotions */}
        <Stack.Screen name="PromotionsList" component={PromotionScreen} />
        <Stack.Screen name="PromotionDetail" component={PromotionDetailScreen} />

        {/* Contact */}
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="ContactDetail" component={ContactDetailScreen} />

        {/* Profile Sub-screens */}
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />

        {/* Error Screens */}
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
        <Stack.Screen name="ServerError" component={ServerErrorScreen} />

        {/* Onboarding & Splash */}
        <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade', gestureEnabled: false }} />

        {/* Experience */}
        <Stack.Screen name="ExperienceDetail" component={ExperienceDetailScreen} />

        {/* Static Pages */}
        <Stack.Screen name="StaticPage" component={StaticPageScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
