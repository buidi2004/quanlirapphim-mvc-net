import React, { useCallback, useEffect } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Theme } from './src/theme/tokens';

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
  'SafeAreaView has been deprecated'
]);

export default function App() {
  const onLayoutRootView = useCallback(async () => {
    // This tells the native splash screen to hide.
    // Our VideoSplashScreen will then take over as the UI layer splash.
    await SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: Theme.colors.background }} onLayout={onLayoutRootView}>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
