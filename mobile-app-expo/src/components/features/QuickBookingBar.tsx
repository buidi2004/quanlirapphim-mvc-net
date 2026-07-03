import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { useNavigation } from '@react-navigation/native';

export const QuickBookingBar = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="flash" size={24} color={Theme.colors.gold} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Đặt Vé Nhanh</Text>
            <Text style={styles.subtitle}>Không cần chờ đợi, 4 bước đơn giản</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('QuickBook')}
        >
          <Text style={styles.buttonText}>Bắt đầu</Text>
          <Ionicons name="arrow-forward" size={16} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.md,
    marginTop: -30, // Chồng lên HeroBanner một chút
    marginBottom: Theme.spacing.xl,
    zIndex: 10,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)', // gold with opacity
    padding: 10,
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.gold,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 4,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
