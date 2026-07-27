import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Theme } from '../theme/tokens';
import { CustomDrawerContent } from './components/CustomDrawerContent';
import { TabNavigator } from './TabNavigator';

const Drawer = createDrawerNavigator();

export const MainDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerPosition: 'right',
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
