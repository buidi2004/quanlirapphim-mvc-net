import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';

const MOCK_CONTACT = {
  id: '123',
  customerName: 'Nguyễn Văn A',
  email: 'user@example.com',
  phone: '0901234567',
  subject: 'Vấn đề đặt vé',
  message: 'Tôi đã thanh toán nhưng không nhận được vé. Giao dịch #CX000123 ngày 01/07. Vui lòng kiểm tra và hỗ trợ.',
  createdAt: '01/07/2026 14:30',
  status: 'replied', // 'pending' | 'processing' | 'replied'
  reply: {
    content: 'Cảm ơn bạn đã liên hệ CinemaX. Chúng tôi đã kiểm tra và xác nhận giao dịch #CX000123 đã được xử lý thành công. Vé điện tử đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến và thư rác. Nếu vẫn không nhận được, vui lòng liên hệ lại hotline 1900 1234.',
    repliedAt: '01/07/2026 16:45',
  },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: 'Đang chờ xử lý', color: Theme.colors.warning, bg: 'rgba(111,66,193,0.1)', icon: 'time-outline' },
  processing: { label: 'Đang xử lý', color: Theme.colors.info, bg: 'rgba(13,202,240,0.1)', icon: 'reload-outline' },
  replied: { label: 'Đã phản hồi', color: Theme.colors.success, bg: 'rgba(25,135,84,0.1)', icon: 'checkmark-circle-outline' },
};

export const ContactDetailScreen = ({ navigation, route }: any) => {
  const contact = MOCK_CONTACT;
  const statusConf = STATUS_CONFIG[contact.status];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu cầu #{contact.id}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.statusCodeLabel}>MÃ YÊU CẦU</Text>
              <Text style={styles.statusCode}>#{contact.id}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConf.bg, borderColor: statusConf.color }]}>
              <Ionicons name={statusConf.icon as any} size={14} color={statusConf.color} />
              <Text style={[styles.statusLabel, { color: statusConf.color }]}>{statusConf.label}</Text>
            </View>
          </View>
          <Text style={styles.statusDate}>
            <Ionicons name="calendar-outline" size={12} color="#666" /> Ngày gửi: {contact.createdAt}
          </Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={14} color="#888" />
            <Text style={styles.infoLabel}>Họ tên:</Text>
            <Text style={styles.infoValue}>{contact.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color="#888" />
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{contact.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={14} color="#888" />
            <Text style={styles.infoLabel}>SĐT:</Text>
            <Text style={styles.infoValue}>{contact.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="help-circle-outline" size={14} color="#888" />
            <Text style={styles.infoLabel}>Chủ đề:</Text>
            <Text style={styles.infoValue}>{contact.subject}</Text>
          </View>
        </View>

        {/* Request Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội dung yêu cầu</Text>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{contact.message}</Text>
          </View>
        </View>

        {/* Reply */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phản hồi từ CinemaX</Text>
          {contact.status === 'replied' && contact.reply ? (
            <View style={styles.replyBox}>
              <View style={styles.replyHeader}>
                <View style={styles.replyAgentIcon}>
                  <Ionicons name="headset" size={18} color={Theme.colors.warning} />
                </View>
                <View>
                  <Text style={styles.replyAgentName}>Đội hỗ trợ CinemaX</Text>
                  <Text style={styles.replyTime}>{contact.reply.repliedAt}</Text>
                </View>
              </View>
              <Text style={styles.replyContent}>{contact.reply.content}</Text>
            </View>
          ) : (
            <View style={styles.pendingBox}>
              <Ionicons name="information-circle-outline" size={20} color={Theme.colors.info} />
              <View>
                <Text style={styles.pendingTitle}>Đang được xử lý...</Text>
                <Text style={styles.pendingSubtitle}>Chúng tôi sẽ phản hồi trong vòng 24 giờ.</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.newRequestBtn}
            onPress={() => navigation.navigate('Contact')}
          >
            <Ionicons name="mail-outline" size={18} color={Theme.colors.warning} />
            <Text style={styles.newRequestText}>Gửi yêu cầu mới</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('MainDrawer')}
          >
            <Ionicons name="home-outline" size={18} color="#fff" />
            <Text style={styles.homeBtnText}>Quay lại Trang chủ</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1, borderBottomColor: Theme.colors.cardBorder,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: Theme.colors.textPrimary, fontSize: 16, fontWeight: 'bold' },

  content: { padding: Theme.spacing.md, gap: Theme.spacing.md },

  statusCard: {
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.xl,
    padding: 20, borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  statusCodeLabel: { color: Theme.colors.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  statusCode: { color: Theme.colors.warning, fontSize: 22, fontWeight: '800' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: Theme.radius.pill, borderWidth: 1,
  },
  statusLabel: { fontSize: 11, fontWeight: 'bold' },
  statusDate: { color: Theme.colors.textMuted, fontSize: 12 },

  section: {
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 16, borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  sectionTitle: { color: Theme.colors.warning, fontSize: 14, fontWeight: 'bold', marginBottom: 14 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  infoLabel: { color: Theme.colors.textSecondary, fontSize: 13, minWidth: 55 },
  infoValue: { color: '#ddd', fontSize: 13, flex: 1 },

  messageBox: {
    borderLeftWidth: 3, borderLeftColor: Theme.colors.warning,
    backgroundColor: 'rgba(111,66,193,0.05)', padding: 14, borderRadius: Theme.radius.md,
  },
  messageText: { color: Theme.colors.textSecondary, fontSize: 14, lineHeight: 22 },

  replyBox: {
    backgroundColor: 'rgba(25,135,84,0.05)', borderRadius: Theme.radius.lg,
    borderWidth: 1, borderColor: 'rgba(25,135,84,0.2)', padding: 14,
  },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  replyAgentIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(111,66,193,0.1)', justifyContent: 'center', alignItems: 'center',
  },
  replyAgentName: { color: Theme.colors.textPrimary, fontSize: 14, fontWeight: 'bold' },
  replyTime: { color: Theme.colors.textSecondary, fontSize: 11, marginTop: 2 },
  replyContent: { color: Theme.colors.textSecondary, fontSize: 14, lineHeight: 22 },

  pendingBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: 'rgba(13,202,240,0.05)', padding: 14,
    borderRadius: Theme.radius.lg, borderWidth: 1, borderColor: 'rgba(13,202,240,0.2)',
  },
  pendingTitle: { color: Theme.colors.textPrimary, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  pendingSubtitle: { color: Theme.colors.textSecondary, fontSize: 12 },

  actions: { gap: 12, paddingBottom: 20 },
  newRequestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: Theme.colors.warning, borderRadius: Theme.radius.lg, paddingVertical: 14,
  },
  newRequestText: { color: Theme.colors.warning, fontWeight: 'bold', fontSize: 15 },
  homeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, paddingVertical: 14,
    borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  homeBtnText: { color: Theme.colors.textPrimary, fontWeight: 'bold', fontSize: 15 },
});
