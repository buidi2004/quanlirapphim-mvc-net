import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { AuthService } from '../../services/AuthService';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
export const ChangePasswordScreen = ({ navigation }: any) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!currentPassword) newErrors.current = 'Vui lòng nhập mật khẩu hiện tại';
    if (newPassword.length < 8) newErrors.new = 'Mật khẩu mới phải có ít nhất 8 ký tự';
    if (newPassword !== confirmPassword) newErrors.confirm = 'Mật khẩu xác nhận không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res: any = await AuthService.changePassword(currentPassword, newPassword);
      if (res.success) {
        Alert.alert('Thành công', 'Đã đổi mật khẩu.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Lỗi', res.error || res.message || 'Đổi mật khẩu thất bại.');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.error || e.message || 'Mất kết nối.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordField = ({
    label, value, onChangeText, showPass, onToggleShow, error, placeholder,
  }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Ionicons name="lock-closed-outline" size={18} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPass}
          placeholder={placeholder || label}
          placeholderTextColor="#555"
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggleShow} style={styles.eyeBtn}>
          <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#666" />
        </TouchableOpacity>
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={12} color={Theme.colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ĐỔI MẬT KHẨU</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon */}
          <View style={styles.iconSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={40} color={Theme.colors.warning} />
            </View>
            <Text style={styles.iconTitle}>Đổi mật khẩu</Text>
            <Text style={styles.iconSubtitle}>Mật khẩu mới phải có ít nhất 8 ký tự</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <PasswordField
              label="Mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              showPass={showCurrent}
              onToggleShow={() => setShowCurrent(!showCurrent)}
              error={errors.current}
              placeholder="Nhập mật khẩu hiện tại..."
            />

            <View style={styles.divider} />

            <PasswordField
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={(v: string) => { setNewPassword(v); if (errors.new) setErrors(e => ({ ...e, new: undefined })); }}
              showPass={showNew}
              onToggleShow={() => setShowNew(!showNew)}
              error={errors.new}
              placeholder="Ít nhất 8 ký tự..."
            />

            {/* Password strength indicator */}
            {newPassword.length > 0 && (
              <View style={styles.strengthRow}>
                {[1, 2, 3].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      newPassword.length >= i * 3 && styles.strengthBarActive,
                      newPassword.length >= 8 && { backgroundColor: Theme.colors.success },
                    ]}
                  />
                ))}
                <Text style={styles.strengthText}>
                  {newPassword.length < 3 ? 'Rất yếu' : newPassword.length < 6 ? 'Yếu' : newPassword.length < 8 ? 'Trung bình' : 'Mạnh'}
                </Text>
              </View>
            )}

            <PasswordField
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={(v: string) => { setConfirmPassword(v); if (errors.confirm) setErrors(e => ({ ...e, confirm: undefined })); }}
              showPass={showConfirm}
              onToggleShow={() => setShowConfirm(!showConfirm)}
              error={errors.confirm}
              placeholder="Nhập lại mật khẩu mới..."
            />

            {/* Match indicator */}
            {confirmPassword.length > 0 && newPassword === confirmPassword && (
              <View style={styles.matchRow}>
                <Ionicons name="checkmark-circle" size={14} color={Theme.colors.success} />
                <Text style={styles.matchText}>Mật khẩu khớp!</Text>
              </View>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
              <Text style={styles.submitBtnText}>{loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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

  content: { padding: Theme.spacing.md },

  iconSection: { alignItems: 'center', paddingVertical: 30, gap: 10 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(111,66,193,0.1)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(111,66,193,0.3)',
  },
  iconTitle: { color: Theme.colors.textPrimary, fontSize: 20, fontWeight: 'bold' },
  iconSubtitle: { color: Theme.colors.textSecondary, fontSize: 13, textAlign: 'center' },

  form: {
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.xl,
    padding: Theme.spacing.lg, borderWidth: 1, borderColor: Theme.colors.cardBorder,
    marginBottom: Theme.spacing.xl,
  },
  inputGroup: { marginBottom: 20 },
  label: { color: Theme.colors.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: '500' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.md,
    borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  inputError: { borderColor: Theme.colors.danger },
  inputIcon: { paddingLeft: 14 },
  input: { flex: 1, color: Theme.colors.textPrimary, paddingHorizontal: 12, paddingVertical: 14, fontSize: 15 },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 14 },

  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  errorText: { color: Theme.colors.danger, fontSize: 12 },

  divider: { height: 1, backgroundColor: Theme.colors.surface, marginVertical: 4 },

  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: -12 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Theme.colors.cardBorder },
  strengthBarActive: { backgroundColor: Theme.colors.warning },
  strengthText: { color: Theme.colors.textSecondary, fontSize: 11, minWidth: 60 },

  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4, marginTop: -12 },
  matchText: { color: Theme.colors.success, fontSize: 12 },

  btnRow: { gap: 12 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Theme.colors.warning, borderRadius: Theme.radius.lg, paddingVertical: 16,
  },
  submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: {
    alignItems: 'center', paddingVertical: 14,
    borderRadius: Theme.radius.lg, borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  cancelBtnText: { color: Theme.colors.textSecondary, fontSize: 15 },
});
