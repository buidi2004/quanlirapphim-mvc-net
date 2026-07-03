import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Platform } from 'react-native';
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

const TAB_BAR_STYLE = {
  backgroundColor: '#12121e',
  borderTopColor: '#1a1a2e',
  borderTopWidth: 1,
  paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  paddingTop: 8,
  height: Platform.OS === 'ios' ? 82 : 60,
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
        tabBarActiveTintColor: Theme.colors.warning,
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          const s = size - 2;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MovieTab') {
            iconName = focused ? 'film' : 'film-outline';
          } else if (route.name === 'BookingTab') {
            iconName = focused ? 'ticket' : 'ticket-outline';
          } else if (route.name === 'CinemaTab') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={s} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="MovieTab"
        component={MovieListScreen}
        options={{ tabBarLabel: 'Phim' }}
      />
      <Tab.Screen
        name="BookingTab"
        component={QuickBookScreen}
        options={{
          tabBarLabel: 'Đặt vé',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 50, height: 50, borderRadius: 25,
              backgroundColor: Theme.colors.accent,
              justifyContent: 'center', alignItems: 'center',
              marginBottom: Platform.OS === 'ios' ? 20 : 8,
              shadowColor: Theme.colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <Ionicons name={focused ? 'ticket' : 'ticket-outline'} size={22} color="#fff" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="CinemaTab"
        component={CinemaListScreen}
        options={{ tabBarLabel: 'Rạp' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Tài khoản' }}
      />
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
