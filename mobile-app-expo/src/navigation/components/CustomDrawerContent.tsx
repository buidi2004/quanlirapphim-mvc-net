import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { AuthService } from '../../services/AuthService';
import { User } from '../../models/User';
import * as SecureStore from 'expo-secure-store';

export const CustomDrawerContent = (props: any) => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);

  useFocusEffect(
    useCallback(() => {
      AuthService.getProfile().then(res => {
        if (res.success && res.data) {
          setUser(res.data.user);
        }
      }).catch(() => {});
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      console.log('Logout error', e);
    } finally {
      if (Platform.OS === 'web') {
        localStorage.removeItem('userToken');
        localStorage.removeItem('refreshToken');
      } else {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
      props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  const confirmLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: handleLogout }
    ]);
  };
  
  const menuItems = [
    { label: 'Chỉnh sửa hồ sơ', icon: 'create-outline', route: 'EditProfile' },
    { label: 'Vé của tôi', icon: 'ticket-outline', route: 'MyTickets' },
    { label: 'Lịch sử giao dịch', icon: 'receipt-outline', route: 'TransactionHistory' },
    { label: 'Đổi mật khẩu', icon: 'lock-closed-outline', route: 'ChangePassword' },
    { label: 'Cài đặt', icon: 'settings-outline', route: 'Settings' },
    { label: 'Hỗ trợ & Liên hệ', icon: 'headset-outline', route: 'Contact' },
    { label: 'Điều khoản', icon: 'document-text-outline', route: 'StaticPage', params: { page: 'terms' } },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#000000']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.profileRow}>
          <View style={styles.profileInfo}>
            <Text style={styles.headerTitle}>{user?.fullName || user?.username || 'Khách'}</Text>
            <Text style={styles.headerSubtitle}>Thành viên {user?.memberLevel || 'Standard'}</Text>
          </View>
          <Image 
            source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/300' }} 
            style={styles.avatar} 
            contentFit="cover" 
          />
        </View>
      </LinearGradient>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => props.navigation.navigate(item.route, item.params)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={16} color="#666" style={{ marginRight: 'auto' }} />
            <Text style={[styles.menuLabel, { textAlign: 'right', flex: 1, marginRight: 12 }]}>{item.label}</Text>
            <View style={styles.menuIconBg}>
              <Ionicons name={item.icon as any} size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        ))}
        
        {/* Nút Đăng xuất */}
        <TouchableOpacity
          style={[styles.menuItem, { marginTop: 10 }]}
          onPress={confirmLogout}
          activeOpacity={0.7}
        >
          <Text style={[styles.menuLabel, { color: Theme.colors.accent, textAlign: 'right', flex: 1, marginRight: 12 }]}>Đăng xuất</Text>
          <View style={[styles.menuIconBg, { backgroundColor: 'rgba(229,9,20,0.1)' }]}>
            <Ionicons name="log-out-outline" size={20} color={Theme.colors.accent} />
          </View>
        </TouchableOpacity>
      </DrawerContentScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d', // Chuẩn Dark Mode
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Theme.colors.gold,
  },
  profileInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  headerSubtitle: {
    color: Theme.colors.gold,
    fontSize: 14,
    marginTop: 2,
    textAlign: 'right',
  },
  scrollContent: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 16,
  },
  versionText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  }
});
