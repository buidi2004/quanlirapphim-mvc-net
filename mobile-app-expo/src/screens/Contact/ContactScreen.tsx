import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';

export const ContactScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('Vấn đề đặt vé');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !message) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }
    
    Alert.alert(
      'Thành công', 
      'Yêu cầu hỗ trợ của bạn đã được gửi. Chúng tôi sẽ phản hồi trong vòng 24h.',
      [
        { text: 'Xem chi tiết yêu cầu', onPress: () => navigation.navigate('ContactDetail') },
        { text: 'Về trang chủ', onPress: () => navigation.navigate('MainTabs') }
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
        <Text style={styles.headerTitle}>LIÊN HỆ & HỖ TRỢ</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          
          {/* Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gửi yêu cầu hỗ trợ</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Nhập họ tên của bạn" 
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Nhập email liên hệ" 
                placeholderTextColor="#666"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Nhập SĐT (Tùy chọn)" 
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chủ đề</Text>
              <TouchableOpacity style={styles.dropdownBtn}>
                <Text style={styles.dropdownText}>{topic}</Text>
                <Ionicons name="chevron-down" size={16} color="#aaa" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nội dung chi tiết *</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Mô tả chi tiết vấn đề của bạn..." 
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>GỬI YÊU CẦU HỖ TRỢ</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            
            <View style={styles.infoCard}>
              <Ionicons name="call" size={24} color={Theme.colors.gold} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoTitle}>Hotline</Text>
                <Text style={styles.infoValue}>1900 1234</Text>
                <Text style={styles.infoDesc}>T2-CN, 8:00-22:00</Text>
              </View>
            </View>
            
            <View style={styles.infoCard}>
              <Ionicons name="mail" size={24} color={Theme.colors.gold} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoTitle}>Email</Text>
                <Text style={styles.infoValue}>support@cinemax.vn</Text>
                <Text style={styles.infoDesc}>Phản hồi trong 24h</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="chatbubbles" size={24} color={Theme.colors.gold} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoTitle}>Chat trực tuyến</Text>
                <Text style={styles.infoValue}>Hỗ trợ ngay tại app</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    borderRadius: Theme.radius.md,
    color: Theme.colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    height: 100,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    color: Theme.colors.textPrimary,
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: Theme.colors.gold,
    borderRadius: Theme.radius.btn,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  infoIcon: {
    marginRight: 16,
  },
  infoTitle: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoDesc: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  }
});
