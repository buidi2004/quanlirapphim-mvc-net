import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';

export const CustomDrawerContent = (props: any) => {
  const insets = useSafeAreaInsets();
  
  const menuItems = [
    { label: 'Trang chủ', icon: 'home-outline', route: 'MainTabs' },
    { label: 'Khuyến mãi', icon: 'gift-outline', route: 'PromotionsList' },
    { label: 'Tin tức điện ảnh', icon: 'newspaper-outline', route: 'NewsList' },
    { label: 'Trải nghiệm đặc biệt', icon: 'star-outline', route: 'ExperienceDetail', params: { type: 'IMAX' } },
    { label: 'Cài đặt', icon: 'settings-outline', route: 'Settings' },
    { label: 'Hỗ trợ & Liên hệ', icon: 'headset-outline', route: 'Contact' },
    { label: 'Điều khoản & Chính sách', icon: 'document-text-outline', route: 'StaticPage', params: { page: 'terms' } },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Theme.colors.background, Theme.colors.surface]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <Ionicons name="film" size={48} color={Theme.colors.warning} />
        <Text style={styles.headerTitle}>CinemaX</Text>
        <Text style={styles.headerSubtitle}>Khám phá điện ảnh đỉnh cao</Text>
      </LinearGradient>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => props.navigation.navigate(item.route, item.params)}
            activeOpacity={0.7}
          >
            <Ionicons name={item.icon as any} size={24} color={Theme.colors.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </DrawerContentScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.glass.border,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  headerSubtitle: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  scrollContent: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuLabel: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.glass.border,
    paddingTop: 16,
  },
  versionText: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  }
});
