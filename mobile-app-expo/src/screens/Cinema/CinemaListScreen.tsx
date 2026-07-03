import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

const CITIES = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];

const MOCK_CINEMAS = [
  { id: '1', name: 'CinemaX Nguyễn Du', address: '116 Nguyễn Du, Q.1, TP.HCM', distance: 1.2, hasIMAX: true },
  { id: '2', name: 'CinemaX Landmark', address: 'Vincom Landmark 81, Q.Bình Thạnh, TP.HCM', distance: 3.5, hasIMAX: false },
  { id: '3', name: 'CinemaX Sư Vạn Hạnh', address: 'Tầng 6 Vạn Hạnh Mall, Q.10, TP.HCM', distance: 5.1, hasIMAX: true },
];

export const CinemaListScreen = ({ navigation }: any) => {
  const [activeCity, setActiveCity] = useState('Hồ Chí Minh');
  const [selectedCinema, setSelectedCinema] = useState<string | null>(null);

  // Animation cho icon định vị
  const bounceValue = useSharedValue(0);

  useEffect(() => {
    bounceValue.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 500 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceValue.value }]
  }));

  const openMap = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const renderCinema = ({ item }: { item: any }) => {
    const isSelected = selectedCinema === item.id;
    return (
      <TouchableOpacity 
        style={[styles.cinemaCard, isSelected && styles.cinemaCardSelected]}
        onPress={() => setSelectedCinema(item.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cinemaName, isSelected && { color: Theme.colors.gold }]}>{item.name}</Text>
          {item.hasIMAX && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>IMAX</Text>
            </View>
          )}
        </View>
        <Text style={styles.address}>{item.address}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.distanceRow}>
            {isSelected ? (
              <Animated.View style={animatedIconStyle}>
                <Ionicons name="location" size={16} color={Theme.colors.accent} />
              </Animated.View>
            ) : (
              <Ionicons name="location-outline" size={16} color="#888" />
            )}
            <Text style={[styles.distance, isSelected && { color: Theme.colors.accent }]}>
              Cách bạn {item.distance} km
            </Text>
          </View>
          
          <TouchableOpacity style={styles.mapBtn} onPress={() => openMap(item.address)}>
            <Text style={styles.mapBtnText}>Lên bản đồ</Text>
            <Ionicons name="navigate-outline" size={14} color="#000" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HỆ THỐNG RẠP</Text>
      </View>

      <View style={styles.citySelector}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CITIES}
          keyExtractor={item => item}
          contentContainerStyle={styles.cityList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.cityChip, activeCity === item && styles.cityChipActive]}
              onPress={() => setActiveCity(item)}
            >
              <Text style={[styles.cityChipText, activeCity === item && styles.cityChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={MOCK_CINEMAS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderCinema}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  citySelector: {
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingVertical: Theme.spacing.sm,
  },
  cityList: {
    paddingHorizontal: Theme.spacing.md,
    gap: 8,
  },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#333',
  },
  cityChipActive: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderColor: Theme.colors.gold,
  },
  cityChipText: {
    color: '#aaa',
    fontSize: 13,
  },
  cityChipTextActive: {
    color: Theme.colors.gold,
    fontWeight: 'bold',
  },
  listContent: {
    padding: Theme.spacing.md,
  },
  cinemaCard: {
    backgroundColor: '#222',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: '#333',
  },
  cinemaCardSelected: {
    borderColor: Theme.colors.gold,
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cinemaName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#007AFF',
    fontSize: 10,
    fontWeight: '900',
  },
  address: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    color: '#888',
    fontSize: 12,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  mapBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
