import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';

export const SettingsScreen = ({ navigation }: any) => {
  const [darkMode, setDarkMode] = useState(true);
  const [systemTheme, setSystemTheme] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [emailPromo, setEmailPromo] = useState(false);
  const [remindMovie, setRemindMovie] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Xác nhận xóa tài khoản',
      'Bạn có chắc chắn muốn xóa tài khoản không? Hành động này không thể hoàn tác và mọi điểm thưởng, lịch sử giao dịch sẽ bị xóa.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa tài khoản', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Thành công', 'Tài khoản của bạn đã được đánh dấu xóa. Bạn sẽ bị đăng xuất.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CÀI ĐẶT</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Section: Giao diện */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GIAO DIỆN</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="moon-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>Chế độ Dark Mode</Text>
              </View>
              <Switch 
                value={darkMode} 
                onValueChange={setDarkMode}
                trackColor={{ false: '#333', true: Theme.colors.gold }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="color-palette-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>Theo hệ thống</Text>
              </View>
              <Switch 
                value={systemTheme} 
                onValueChange={setSystemTheme}
                trackColor={{ false: '#333', true: Theme.colors.gold }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Section: Thông báo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>THÔNG BÁO</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="notifications-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>Thông báo đẩy (Push)</Text>
              </View>
              <Switch 
                value={pushNotif} 
                onValueChange={setPushNotif}
                trackColor={{ false: '#333', true: Theme.colors.gold }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="mail-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>Email Khuyến mãi</Text>
              </View>
              <Switch 
                value={emailPromo} 
                onValueChange={setEmailPromo}
                trackColor={{ false: '#333', true: Theme.colors.gold }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="ticket-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>Nhắc lịch xem phim</Text>
              </View>
              <Switch 
                value={remindMovie} 
                onValueChange={setRemindMovie}
                trackColor={{ false: '#333', true: Theme.colors.gold }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Section: Về ứng dụng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VỀ ỨNG DỤNG</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="information-circle-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>Phiên bản</Text>
              </View>
              <Text style={styles.versionText}>1.0.0 (Build 42)</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.rowLink}>
              <View style={styles.rowLeft}>
                <Ionicons name="star-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>Đánh giá ứng dụng</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.rowLink} onPress={() => navigation.navigate('StaticPage', { page: 'faq' })}>
              <View style={styles.rowLeft}>
                <Ionicons name="help-circle-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>Câu hỏi thường gặp</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.rowLink} onPress={() => navigation.navigate('StaticPage', { page: 'terms' })}>
              <View style={styles.rowLeft}>
                <Ionicons name="document-text-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>Điều khoản sử dụng</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.rowLink} onPress={() => navigation.navigate('StaticPage', { page: 'privacy' })}>
              <View style={styles.rowLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>Chính sách bảo mật</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color="#ff3b30" />
          <Text style={styles.deleteBtnText}>Yêu cầu xóa tài khoản</Text>
        </TouchableOpacity>

      </ScrollView>
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
  content: {
    padding: Theme.spacing.md,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    color: Theme.colors.textPrimary,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.surface,
    marginLeft: 48,
  },
  versionText: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
  },
  deleteBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: Theme.radius.lg,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    marginTop: 10,
    gap: 8,
  },
  deleteBtnText: {
    color: '#ff3b30',
    fontSize: 15,
    fontWeight: 'bold',
  }
});
