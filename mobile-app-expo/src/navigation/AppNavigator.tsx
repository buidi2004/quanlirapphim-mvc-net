import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons, Feather } from '@expo/vector-icons';
import { View, Text, Platform, TouchableOpacity, StyleSheet, ImageBackground, useColorScheme, Appearance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassSurface } from '../components/ui/GlassSurface';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList, MainTabParamList } from './types';
import { Theme } from '../theme/tokens';
import { CustomDrawerContent } from './components/CustomDrawerContent';

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

// ── Staff ──
import { ScannerScreen } from '../screens/Staff/ScannerScreen';

// ── Experience & Static ──
import { ExperienceDetailScreen } from '../screens/Experience/ExperienceDetailScreen';
import { StaticPageScreen } from '../screens/Page/StaticPageScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const Drawer = createDrawerNavigator();

// ── Tab Icon Map (Using Ionicons for Premium Look) ──
const TAB_ICONS: Record<string, { outline: keyof typeof Ionicons.glyphMap, filled: keyof typeof Ionicons.glyphMap }> = {
  HomeTab: { outline: 'home-outline', filled: 'home' },
  MovieTab: { outline: 'film-outline', filled: 'film' },
  BookingTab: { outline: 'ticket-outline', filled: 'ticket' },
  CinemaTab: { outline: 'location-outline', filled: 'location' },
  ProfileTab: { outline: 'person-outline', filled: 'person' },
};

const TAB_LABELS: Record<string, string> = {
  HomeTab: 'Trang chủ',
  MovieTab: 'Phim',
  BookingTab: 'Đặt vé',
  CinemaTab: 'Rạp',
  ProfileTab: 'Tài khoản',
};

// ── Floating Pill Tab Bar (Tailwind HTML style) ──
const FloatingDockTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
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

// ── Drawer Navigator ──
const MainDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: Theme.colors.background,
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="MainTabsDrawer" component={TabNavigator} />
    </Drawer.Navigator>
  );
};

export const AppNavigator = () => {
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  
  const navTheme = {
    ...(isLight ? DefaultTheme : DarkTheme),
    colors: {
      ...(isLight ? DefaultTheme.colors : DarkTheme.colors),
      primary: Theme.colors.warning,
      background: Theme.colors.background,
      card: Theme.colors.card,
      text: Theme.colors.textPrimary,
      border: Theme.colors.cardBorder,
      notification: Theme.colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Theme.colors.background },
          animation: 'slide_from_right', // #1 Default
        }}
      >
        {/* Main Drawer (Wraps Tabs) */}
        <Stack.Screen name="MainTabs" component={MainDrawerNavigator} />

        {/* ======================= */}
        {/* DEFAULT SLIDE GROUP     */}
        {/* ======================= */}
        <Stack.Group>
          {/* Auth (Except Login which is modal) */}
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

          {/* Movie Flow (#3 Shared Element enabled by default with react-native-reanimated) */}
          <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
          <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
          <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />

          {/* Booking Flow */}
          <Stack.Screen name="Concession" component={ConcessionScreen} />
          <Stack.Screen name="ConcessionDetail" component={ConcessionDetailScreen} />

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

          {/* Experience */}
          <Stack.Screen name="ExperienceDetail" component={ExperienceDetailScreen} />

          {/* Static Pages */}
          <Stack.Screen name="StaticPage" component={StaticPageScreen} />

          {/* Staff */}
          <Stack.Screen name="Scanner" component={ScannerScreen} />
        </Stack.Group>

        {/* ======================= */}
        {/* MODAL GROUP             */}
        {/* ======================= */}
        <Stack.Group screenOptions={{ presentation: 'modal', animation: 'slide_from_bottom' }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
        </Stack.Group>

        {/* ======================= */}
        {/* FADE GROUP              */}
        {/* ======================= */}
        <Stack.Group screenOptions={{ animation: 'fade' }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
        </Stack.Group>

      </Stack.Navigator>
    </NavigationContainer>
  );
};
