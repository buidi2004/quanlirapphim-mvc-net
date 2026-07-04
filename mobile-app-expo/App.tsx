import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Theme } from './src/theme/tokens';

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
