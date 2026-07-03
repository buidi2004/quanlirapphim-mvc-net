import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, StatusBar } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../../services/AuthService';
import { styles } from './styles';
import { Theme } from '../../theme/tokens';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await AuthService.login(email, password);
      if (res.success && res.token) {
        await SecureStore.setItemAsync('userToken', res.token);
        if (res.refreshToken) {
          await SecureStore.setItemAsync('refreshToken', res.refreshToken);
        }
        navigation.replace('MainTabs');
      } else {
        setError(res.error || 'Đăng nhập thất bại');
      }
    } catch (e: any) {
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
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
                placeholder="Email của bạn..."
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Mật khẩu..."
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>}
            </TouchableOpacity>

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
