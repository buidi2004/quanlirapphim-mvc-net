import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Nhắc lịch xem phim',
    message: 'Dune: Part Two sẽ chiếu trong 2 giờ nữa tại CinemaX Landmark 81. Vui lòng đến sớm 15 phút.',
    time: '2 giờ trước',
    type: 'reminder',
    isRead: false,
  },
  {
    id: '2',
    title: 'Điểm thưởng cập nhật',
    message: 'Bạn vừa được cộng 5,000 điểm từ giao dịch #CX000123.',
    time: '1 ngày trước',
    type: 'reward',
    isRead: false,
  },
  {
    id: '3',
    title: 'Khuyến mãi đặc biệt',
    message: 'Tặng bạn mã GIAM20 - Giảm ngay 20% cho phim mới ra mắt.',
    time: '3 ngày trước',
    type: 'promo',
    isRead: true,
  }
];

export const NotificationScreen = ({ navigation }: any) => {

  const getIcon = (type: string) => {
    switch (type) {
      case 'reminder': return { name: 'ticket', color: '#ff9800', bg: 'rgba(255, 152, 0, 0.1)' };
      case 'reward': return { name: 'star', color: '#2196f3', bg: 'rgba(33, 150, 243, 0.1)' };
      case 'promo': return { name: 'pricetag', color: '#e91e63', bg: 'rgba(233, 30, 99, 0.1)' };
      default: return { name: 'notifications', color: Theme.colors.textPrimary, bg: '#333' };
    }
  };

  const renderItem = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => {
    const iconConfig = getIcon(item.type);

    return (
      <TouchableOpacity style={[styles.notificationCard, !item.isRead && styles.unreadCard]}>
        <View style={[styles.iconBox, { backgroundColor: iconConfig.bg }]}>
          <Ionicons name={iconConfig.name as any} size={24} color={iconConfig.color} />
        </View>
        <View style={styles.contentBox}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>THÔNG BÁO</Text>
        <TouchableOpacity style={styles.markReadBtn}>
          <Ionicons name="checkmark-done-outline" size={24} color={Theme.colors.gold} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>Bạn không có thông báo nào mới</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  markReadBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  listContent: {
    paddingTop: Theme.spacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  unreadCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: Theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  unreadTitle: {
    color: Theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.accent,
    marginLeft: 8,
  },
  message: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    color: Theme.colors.textMuted,
    fontSize: 11,
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: Theme.colors.textMuted,
    marginTop: 16,
    fontSize: 15,
  }
});
