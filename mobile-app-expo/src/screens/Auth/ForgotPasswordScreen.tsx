import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthService } from '../../services/AuthService';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const handleReset = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await AuthService.forgotPassword(email);
      if (res.success) {
        Alert.alert('Thành công', res.message || 'Link đặt lại mật khẩu đã được gửi vào email của bạn. Vui lòng kiểm tra hộp thư đến.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể gửi link khôi phục mật khẩu.');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient colors={['#000', '#1a1a2e']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
            <Text style={styles.backText}>Quay lại</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="lock-closed-outline" size={60} color={Theme.colors.gold} style={styles.icon} />
            <Text style={styles.title}>Quên mật khẩu?</Text>
            <Text style={styles.subtitle}>Nhập email bạn đã đăng ký để nhận liên kết đặt lại mật khẩu an toàn.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.inputIconWrapper}>
                <Ionicons name="mail-outline" size={20} color="#888" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nhập email của bạn"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
              onPress={handleReset}
              disabled={loading}
            >
              <LinearGradient
                colors={[Theme.colors.gold, '#d4af37']}
                style={styles.submitBtnGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.submitBtnText}>{loading ? 'ĐANG GỬI...' : 'GỬI LINK ĐẶT LẠI'}</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  backText: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    marginLeft: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    color: Theme.colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: Theme.radius.md,
    marginBottom: 24,
    overflow: 'hidden',
  },
  inputIconWrapper: {
    padding: 16,
  },
  input: {
    flex: 1,
    color: Theme.colors.textPrimary,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
  },
  submitBtn: {
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
    shadowColor: Theme.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
