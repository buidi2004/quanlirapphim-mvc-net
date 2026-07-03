import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Theme } from '../../theme/tokens';
import * as ImagePicker from 'expo-image-picker';

export const EditProfileScreen = ({ navigation }: any) => {
  const [avatarUri, setAvatarUri] = useState('https://ui-avatars.com/api/?name=Nguyen+Van+A&background=0D8ABC&color=fff');
  const [name, setName] = useState('Nguyễn Văn A');
  const [phone, setPhone] = useState('0901234567');
  const [gender, setGender] = useState('Nam');

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHỈNH SỬA HỒ SƠ</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.saveBtnText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
              <TouchableOpacity style={styles.editAvatarBtn} onPress={pickAvatar}>
                <Ionicons name="camera" size={16} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.emailText}>user@example.com</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput 
                style={styles.input} 
                value={name}
                onChangeText={setName}
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput 
                style={styles.input} 
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.genderRow}>
                {['Nam', 'Nữ', 'Khác'].map(g => (
                  <TouchableOpacity 
                    key={g} 
                    style={[styles.genderChip, gender === g && styles.genderChipActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
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
    borderBottomColor: '#222',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  saveBtnText: {
    color: Theme.colors.gold,
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: Theme.spacing.md,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#333',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Theme.colors.gold,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Theme.colors.background,
  },
  emailText: {
    color: '#888',
    fontSize: 14,
  },
  formSection: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: '#222',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: Theme.radius.md,
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: Theme.radius.md,
  },
  genderChipActive: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderColor: Theme.colors.gold,
  },
  genderText: {
    color: '#888',
    fontSize: 15,
  },
  genderTextActive: {
    color: Theme.colors.gold,
    fontWeight: 'bold',
  }
});
