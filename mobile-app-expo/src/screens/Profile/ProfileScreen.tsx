import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

const MOCK_USER = {
  displayName: 'Nguyễn Văn A',
  avatarUrl: 'https://i.pravatar.cc/300?img=11',
  memberLevel: 'Gold',
  id: 1234,
  points: 1500000,
  nextLevel: 'Platinum',
  pointsToNext: 500000,
  ticketsBought: 12,
  moviesWatched: 8,
};

export const ProfileScreen = ({ navigation }: any) => {

  const progress = MOCK_USER.points / (MOCK_USER.points + MOCK_USER.pointsToNext);

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
              <Text style={styles.loyaltyLevel}>Thành viên {MOCK_USER.memberLevel}</Text>
            </View>
            <Ionicons name="trophy" size={28} color={Theme.colors.gold} />
          </View>

          <View style={styles.loyaltyBody}>
            <View style={styles.loyaltyUser}>
              <Image source={{ uri: MOCK_USER.avatarUrl }} style={styles.avatar} contentFit="cover" />
              <View>
                <Text style={styles.loyaltyName}>{MOCK_USER.displayName}</Text>
                <Text style={styles.loyaltyId}>ID: {MOCK_USER.id.toString().padStart(8, '0')}</Text>
              </View>
            </View>

            <View style={styles.qrContainer}>
              <View style={styles.qrBg}>
                <QRCode value={`CXN-${MOCK_USER.id}`} size={60} color="#000" backgroundColor="#fff" />
              </View>
              <Text style={styles.qrText}>Mã tích điểm</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.levelText}>{MOCK_USER.memberLevel}</Text>
            <Text style={styles.levelText}>{MOCK_USER.nextLevel}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressHint}>
            Còn <Text style={{color: Theme.colors.gold, fontWeight: 'bold'}}>{MOCK_USER.pointsToNext.toLocaleString('vi-VN')}₫</Text> để lên {MOCK_USER.nextLevel}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{MOCK_USER.ticketsBought}</Text>
            <Text style={styles.statLabel}>Vé đã mua</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{MOCK_USER.moviesWatched}</Text>
            <Text style={styles.statLabel}>Phim đã xem</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <MenuItem icon="create-outline" title="Chỉnh sửa hồ sơ" onPress={() => navigation.navigate('EditProfile')} />
          <MenuItem icon="ticket-outline" title="Vé của tôi" onPress={() => navigation.navigate('MyTickets')} />
          <MenuItem icon="receipt-outline" title="Lịch sử giao dịch" onPress={() => navigation.navigate('TransactionHistory')} />
          <MenuItem icon="lock-closed-outline" title="Đổi mật khẩu" onPress={() => navigation.navigate('ChangePassword')} />
          <MenuItem icon="notifications-outline" title="Thông báo" onPress={() => navigation.navigate('Notification')} />
          <MenuItem icon="settings-outline" title="Cài đặt" onPress={() => navigation.navigate('Settings')} />
          <MenuItem icon="headset-outline" title="Liên hệ & Hỗ trợ" onPress={() => navigation.navigate('Contact')} />
          <MenuItem icon="log-out-outline" title="Đăng xuất" isDestructive onPress={() => {}} />
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
