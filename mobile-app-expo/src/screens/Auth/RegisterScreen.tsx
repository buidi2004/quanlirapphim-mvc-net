import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../../services/AuthService';
import { styles } from './styles';

export const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const res = await AuthService.register(name, email, password, name, phone);
      if (res.success) {
        // Tự động chuyển về login hoặc đăng nhập luôn
        navigation.navigate('Login');
      } else {
        setError(res.message || 'Đăng ký thất bại');
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
          <Text style={styles.subtitle}>Gia nhập cộng đồng yêu phim</Text>
          
          <View style={styles.glassCard}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Họ và tên..."
                placeholderTextColor="#aaa"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Email của bạn..."
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Số điện thoại..."
                placeholderTextColor="#aaa"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
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

            <View style={styles.inputContainer}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Xác nhận mật khẩu..."
                placeholderTextColor="#aaa"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>ĐĂNG KÝ</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>
                Đã có tài khoản? <Text style={styles.linkAccent}>Đăng nhập ngay</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
