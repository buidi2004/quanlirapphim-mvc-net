import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

import { useFocusEffect } from '@react-navigation/native';
import { AuthService } from '../../services/AuthService';
import { User } from '../../models/User';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const ProfileScreen = ({ navigation }: any) => {

  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await AuthService.getProfile();
      if (res.success && res.data) {
        setUser(res.data.user);
      } else {
        navigation.navigate('Login');
      }
    } catch (e) {
      console.log('Error loading profile', e);
      navigation.navigate('Login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      console.log('Logout error on server', e);
    } finally {
      if (Platform.OS === 'web') {
        localStorage.removeItem('userToken');
        localStorage.removeItem('refreshToken');
      } else {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
      navigation.navigate('Login');
    }
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
         <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
         <Text style={{color: '#fff'}}>Đang tải hồ sơ...</Text>
      </SafeAreaView>
    );
  }

  const nextLevelPoints = user.memberLevel === 'Platinum' ? 0 : 500000;
  const progress = nextLevelPoints > 0 ? user.loyaltyPoints / (user.loyaltyPoints + nextLevelPoints) : 1;
  const nextLevelName = user.memberLevel === 'Platinum' ? 'Diamond' : 'Platinum';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HỒ SƠ CÁ NHÂN</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Loyalty Card */}
        <LinearGradient
          colors={['#1a1a2e', '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loyaltyCard}
        >
          <View style={styles.loyaltyHeader}>
            <View>
              <Text style={styles.loyaltyBrand}>CINEMAX REWARDS</Text>
              <Text style={styles.loyaltyLevel}>Thành viên {user.memberLevel || 'Standard'}</Text>
            </View>
            <Ionicons name="trophy" size={28} color={Theme.colors.gold} />
          </View>

          <View style={styles.loyaltyBody}>
            <View style={styles.loyaltyUser}>
              <Image source={{ uri: user.avatarUrl || 'https://i.pravatar.cc/300' }} style={styles.avatar} contentFit="cover" />
              <View>
                <Text style={styles.loyaltyName}>{user.fullName || user.username}</Text>
                <Text style={styles.loyaltyId}>ID: {user.id.toString().padStart(8, '0')}</Text>
              </View>
            </View>

            <View style={styles.qrContainer}>
              <View style={styles.qrBg}>
                <QRCode value={`CXN-${user.id}`} size={60} color="#000" backgroundColor="#fff" />
              </View>
              <Text style={styles.qrText}>Mã tích điểm</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.levelText}>{user.memberLevel || 'Standard'}</Text>
            <Text style={styles.levelText}>{nextLevelName}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressHint}>
            Còn <Text style={{color: Theme.colors.gold, fontWeight: 'bold'}}>{nextLevelPoints > 0 ? nextLevelPoints.toLocaleString('vi-VN') : 0}₫</Text> để lên {nextLevelName}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.floor(user.totalSpent / 100000) || 0}</Text>
            <Text style={styles.statLabel}>Vé đã mua</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.loyaltyPoints}</Text>
            <Text style={styles.statLabel}>Điểm tích luỹ</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {(user.role === 'admin' || user.role === 'cinema_manager' || user.role === 'staff') && (
            <MenuItem icon="qr-code-outline" title="Quét Vé Cửa (Staff)" onPress={() => navigation.navigate('Scanner')} />
          )}
          <MenuItem icon="create-outline" title="Chỉnh sửa hồ sơ" onPress={() => navigation.navigate('EditProfile')} />
          <MenuItem icon="ticket-outline" title="Vé của tôi" onPress={() => navigation.navigate('MyTickets')} />
          <MenuItem icon="receipt-outline" title="Lịch sử giao dịch" onPress={() => navigation.navigate('TransactionHistory')} />
          <MenuItem icon="lock-closed-outline" title="Đổi mật khẩu" onPress={() => navigation.navigate('ChangePassword')} />
          <MenuItem icon="notifications-outline" title="Thông báo" onPress={() => navigation.navigate('Notification')} />
          <MenuItem icon="settings-outline" title="Cài đặt" onPress={() => navigation.navigate('Settings')} />
          <MenuItem icon="headset-outline" title="Liên hệ & Hỗ trợ" onPress={() => navigation.navigate('Contact')} />
          <MenuItem icon="log-out-outline" title="Đăng xuất" isDestructive onPress={handleLogout} />
        </View>


      </ScrollView>
    </SafeAreaView>
  );
};

const MenuItem = ({ icon, title, onPress, isDestructive }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <View style={[styles.menuIconBg, isDestructive && { backgroundColor: 'rgba(229,9,20,0.1)' }]}>
        <Ionicons name={icon} size={20} color={isDestructive ? Theme.colors.accent : '#fff'} />
      </View>
      <Text style={[styles.menuTitle, isDestructive && { color: Theme.colors.accent }]}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#666" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsBtn: {
    position: 'absolute',
    right: Theme.spacing.md,
    padding: 8,
  },
  scrollContent: {
    padding: Theme.spacing.md,
    paddingBottom: 40,
  },
  loyaltyCard: {
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#333',
    elevation: 10,
    shadowColor: Theme.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  loyaltyBrand: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  loyaltyLevel: {
    color: Theme.colors.gold,
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  loyaltyBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  loyaltyUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: Theme.colors.gold,
  },
  loyaltyName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  loyaltyId: {
    color: '#888',
    fontSize: 12,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrBg: {
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  qrText: {
    color: '#aaa',
    fontSize: 10,
  },
  progressContainer: {
    marginBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.gold,
  },
  progressHint: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#222',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
  },
  menuContainer: {
    backgroundColor: '#222',
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  }
});
