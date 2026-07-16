import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { GlassHeader } from '../../components/ui/GlassHeader';
import { NotificationService } from '../../services/NotificationService';
import { AppService } from '../../services/AppService';
import { Alert } from 'react-native';

export const NotificationScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchNotifications();

    // Listen to push notifications while app is open to refresh list
    const subscription = Notifications.addNotificationReceivedListener(() => {
      fetchNotifications();
    });

    return () => subscription.remove();
  }, []);

  // Animation for unread dot
  const pulse = useSharedValue(1);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(0.4, { duration: 1000 }), -1, true);
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: pulse.value }]
  }));

  const fetchNotifications = async () => {
    try {
      if (!refreshing) setLoading(true);
      const res = await AppService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.map((x: any) => ({
          id: x.id?.toString(),
          title: x.title,
          message: x.message,
          time: x.time || x.createdAt,
          type: x.type || 'system',
          isRead: x.isRead
        })));
      }
    } catch (e) {
      console.log('Error fetching notifications', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const getIcon = (type: string) => {
    switch (type) {
      case 'reminder': return { name: 'ticket', color: '#ff9800', bg: 'rgba(255, 152, 0, 0.1)' };
      case 'reward': return { name: 'star', color: '#2196f3', bg: 'rgba(33, 150, 243, 0.1)' };
      case 'promo': return { name: 'pricetag', color: '#e91e63', bg: 'rgba(233, 30, 99, 0.1)' };
      default: return { name: 'notifications', color: Theme.colors.textPrimary, bg: '#333' };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const iconConfig = getIcon(item.type);

    return (
      <Animated.View entering={FadeInUp.delay(item.index * 100).springify()}>
        <TouchableOpacity style={[styles.notificationCard, !item.isRead && styles.unreadCard]} activeOpacity={0.7}>
          <View style={[styles.iconBox, { backgroundColor: iconConfig.bg }]}>
            <Ionicons name={iconConfig.name as any} size={24} color={iconConfig.color} />
          </View>
          <View style={styles.contentBox}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
              {!item.isRead && <Animated.View style={[styles.unreadDot, dotStyle]} />}
            </View>
            <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      <GlassHeader 
        title="THÔNG BÁO" 
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity 
            style={{ width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' }}
            onPress={() => {
              NotificationService.scheduleTestNotification();
              Alert.alert('Thành công', 'Thông báo Push sẽ xuất hiện sau 5 giây. Vui lòng thoát ra màn hình chính (hoặc khóa màn hình) để kiểm tra!');
            }}
          >
            <Ionicons name="paper-plane-outline" size={20} color="#fff" />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <Text style={{color: '#fff', textAlign: 'center', marginTop: 20}}>Đang tải thông báo...</Text>
      ) : (
        <FlatList
          data={notifications.map((n, index) => ({ ...n, index }))}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={60} color="#333" />
              <Text style={styles.emptyText}>Bạn không có thông báo nào mới</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  listContent: {
    paddingTop: Theme.spacing.md,
    paddingBottom: 40,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  unreadCard: {
    backgroundColor: 'rgba(111, 66, 193, 0.05)',
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
