import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';

export const ResetPasswordScreen = ({ navigation }: any) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    if (!password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu phải dài ít nhất 8 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Thành công', 'Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại.', [
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
      ]);
    }, 1500);
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
          
          <View style={styles.header}>
            <Ionicons name="shield-checkmark-outline" size={60} color={Theme.colors.gold} style={styles.icon} />
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subtitle}>Tạo mật khẩu mới mạnh hơn cho tài khoản của bạn.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.inputIconWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới (ít nhất 8 ký tự)"
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIconWrapper}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#888" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu mới"
                placeholderTextColor="#666"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color="#888" />
              </TouchableOpacity>
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
                <Text style={styles.submitBtnText}>{loading ? 'ĐANG CẬP NHẬT...' : 'ĐẶT LẠI MẬT KHẨU'}</Text>
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
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    color: '#aaa',
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
    marginBottom: 16,
    overflow: 'hidden',
  },
  inputIconWrapper: {
    padding: 16,
  },
  input: {
    flex: 1,
    color: '#fff',
    paddingVertical: 16,
    fontSize: 16,
  },
  eyeBtn: {
    padding: 16,
  },
  submitBtn: {
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
    shadowColor: Theme.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 16,
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
