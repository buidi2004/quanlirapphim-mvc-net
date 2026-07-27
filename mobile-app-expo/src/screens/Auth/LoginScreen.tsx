import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthService } from '../../services/AuthService';
import { styles } from './styles';
import { Theme } from '../../theme/tokens';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  React.useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const hasSavedCredentials = await SecureStore.getItemAsync('savedEmail');
      setIsBiometricSupported(compatible && !!hasSavedCredentials);
    })();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Đăng nhập vào CinemaX',
        fallbackLabel: 'Sử dụng mật khẩu',
      });
      if (result.success) {
        const savedEmail = await SecureStore.getItemAsync('savedEmail');
        const savedPassword = await SecureStore.getItemAsync('savedPassword');
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          await handleLogin(savedEmail, savedPassword);
        }
      }
    } catch (e) {
      console.log('Biometric auth error', e);
    }
  };

  const handleLogin = async (overrideEmail?: string, overridePassword?: string) => {
    const e = overrideEmail || email;
    const p = overridePassword || password;

    if (!e || !p) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await AuthService.login(e, p);
      if (res.success && res.data?.token) {
        if (Platform.OS === 'web') {
          localStorage.setItem('userToken', res.data.token);
          if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
        } else {
          await SecureStore.setItemAsync('userToken', res.data.token);
          if (res.data.refreshToken) {
            await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
          }
          await SecureStore.setItemAsync('savedEmail', e);
          await SecureStore.setItemAsync('savedPassword', p);
        }
        navigation.replace('MainDrawer');
      } else {
        setError(res.message || 'Đăng nhập thất bại');
      }
    } catch (e: any) {
      setError(e.message || 'Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Background Image & Overlay */}
      <Image 
        source={{ uri: 'https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vtecsmEZzDZsn.jpg' }} 
        style={styles.bgImage} 
        contentFit="cover" 
        blurRadius={10}
      />
      <View style={styles.overlay} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <View style={styles.container}>
          <Text style={styles.logo}>CinemaX</Text>
          <Text style={styles.subtitle}>Trải nghiệm điện ảnh đỉnh cao</Text>
          
          <View style={styles.glassCard}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Email hoặc Tên đăng nhập..."
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Mật khẩu..."
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => handleLogin()} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>}
            </TouchableOpacity>

            {isBiometricSupported && (
              <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={handleBiometricAuth}>
                <Ionicons name="finger-print-outline" size={40} color={Theme.colors.warning} />
                <Text style={{ color: Theme.colors.warning, fontSize: 12, marginTop: 4 }}>Đăng nhập bằng vân tay/FaceID</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>
                Chưa có tài khoản? <Text style={styles.linkAccent}>Đăng ký ngay</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
