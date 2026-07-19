import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  requestPermissionsAsync: async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } else {
      return false; // Physical device is required for push notifications
    }
  },

  scheduleShowtimeReminder: async (movieTitle: string, showDateStr: string, startTimeStr: string, roomName: string) => {
    // Expected format: showDateStr="YYYY-MM-DD", startTimeStr="HH:mm" or "HH:mm:ss"
    const hasPermission = await NotificationService.requestPermissionsAsync();
    if (!hasPermission) return;

    if (!showDateStr || !startTimeStr) return;

    const [year, month, day] = showDateStr.split('T')[0].split('-').map(Number);
    const [hour, minute] = startTimeStr.split(':').map(Number);
    
    if (!year || hour === undefined) return;

    const showtimeDate = new Date(year, month - 1, day, hour, minute, 0);
    const reminderDate = new Date(showtimeDate.getTime() - 30 * 60000); // 30 minutes before

    // Only schedule if reminder is in the future
    if (reminderDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎬 Phim sắp bắt đầu!',
          body: `Phim "${movieTitle}" tại ${roomName} sẽ bắt đầu sau 30 phút nữa. Vui lòng di chuyển đến rạp.`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
        },
      });
    }
  },

  scheduleTestNotification: async () => {
    const hasPermission = await NotificationService.requestPermissionsAsync();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Thông báo thử nghiệm',
        body: 'Hệ thống Push Notification của CinemaX đang hoạt động hoàn hảo!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
  }
};
