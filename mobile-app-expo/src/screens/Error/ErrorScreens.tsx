import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';

export const NotFoundScreen = ({ navigation }: any) => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
    <View style={styles.content}>
      <View style={styles.iconWrap}>
        <Ionicons name="film-outline" size={64} color="#333" />
        <View style={styles.xBadge}>
          <Ionicons name="close" size={22} color="#fff" />
        </View>
      </View>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Phòng chiếu này không tồn tại</Text>
      <Text style={styles.subtitle}>
        Trang bạn đang tìm kiếm đã bị xóa hoặc không bao giờ tồn tại.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('MainDrawer')}>
        <Ionicons name="home-outline" size={18} color="#000" />
        <Text style={styles.btnText}>Về trang chủ</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

export const ServerErrorScreen = ({ navigation }: any) => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
    <View style={styles.content}>
      <View style={styles.iconWrap}>
        <Ionicons name="film" size={64} color="#333" />
        <View style={[styles.xBadge, { backgroundColor: Theme.colors.danger }]}>
          <Text style={{ color: Theme.colors.textPrimary, fontSize: 12, fontWeight: 'bold' }}>!</Text>
        </View>
      </View>
      <Text style={styles.code}>500</Text>
      <Text style={styles.title}>Kỹ thuật viên đang nối lại phim</Text>
      <Text style={styles.subtitle}>
        Máy chủ đang gặp sự cố. Chúng tôi đang khắc phục ngay bây giờ.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
        <Ionicons name="refresh-outline" size={18} color="#000" />
        <Text style={styles.btnText}>Thử lại</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate('Contact')}>
        <Text style={styles.outlineBtnText}>Liên hệ hỗ trợ</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

export const NoConnectionScreen = ({ onRetry }: { onRetry?: () => void }) => (
  <View style={styles.overlayContainer}>
    <View style={styles.overlayCard}>
      <Ionicons name="wifi-outline" size={56} color="#555" />
      <Text style={styles.overlayTitle}>Không có kết nối Internet</Text>
      <Text style={styles.overlaySubtitle}>
        Vui lòng kiểm tra kết nối mạng và thử lại.
      </Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Ionicons name="refresh-outline" size={18} color="#000" />
        <Text style={styles.retryBtnText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    position: 'relative', marginBottom: 24,
    width: 100, height: 100, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Theme.colors.surface, borderRadius: 50,
    borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  xBadge: {
    position: 'absolute', top: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Theme.colors.accent,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Theme.colors.background,
  },
  code: {
    color: '#333', fontSize: 72, fontWeight: '900',
    marginBottom: 8, letterSpacing: -4,
  },
  title: {
    color: Theme.colors.textPrimary, fontSize: 20, fontWeight: 'bold',
    textAlign: 'center', marginBottom: 12,
  },
  subtitle: {
    color: Theme.colors.textSecondary, fontSize: 14, lineHeight: 22,
    textAlign: 'center', marginBottom: 32,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Theme.colors.warning,
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: Theme.radius.pill, marginBottom: 12,
  },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  outlineBtn: {
    borderWidth: 1, borderColor: Theme.colors.cardBorder,
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: Theme.radius.pill,
  },
  outlineBtnText: { color: Theme.colors.textSecondary, fontSize: 14 },

  // Overlay (NoConnection)
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  overlayCard: {
    backgroundColor: Theme.colors.surface, borderRadius: 20,
    padding: 32, alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: Theme.colors.cardBorder,
    marginHorizontal: 24,
  },
  overlayTitle: { color: Theme.colors.textPrimary, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  overlaySubtitle: { color: Theme.colors.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Theme.colors.warning,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: Theme.radius.pill, marginTop: 8,
  },
  retryBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});
