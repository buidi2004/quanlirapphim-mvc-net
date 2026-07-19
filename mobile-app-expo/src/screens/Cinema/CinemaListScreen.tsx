import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import * as Location from 'expo-location';

import { CinemaService } from '../../services/CinemaService';
import { Cinema } from '../../models/Cinema';

export const CinemaListScreen = ({ navigation }: any) => {
  const [activeCity, setActiveCity] = useState<string>('Hồ Chí Minh');
  const [cities, setCities] = useState<string[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCinema, setSelectedCinema] = useState<string | null>(null);

  // Animation cho icon định vị
  const bounceValue = useSharedValue(0);

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (activeCity === 'Gần Bạn') {
      fetchNearestCinemas();
    } else if (activeCity) {
      fetchCinemas(activeCity);
    }
  }, [activeCity]);

  const fetchNearestCinemas = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Cần quyền truy cập vị trí để tìm rạp gần bạn nhất.');
        if (cities.length > 1) setActiveCity(cities[1]);
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const res = await CinemaService.getNearestCinemas(location.coords.latitude, location.coords.longitude, 10);
      if (res.success) {
        setCinemas(res.data);
      }
    } catch (e: any) {
      console.log('Error fetching nearest cinemas:', e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await CinemaService.getProvinces();
      if (res.success && res.data.length > 0) {
        setCities(['Gần Bạn', ...res.data]);
        if (!res.data.includes(activeCity) && activeCity !== 'Gần Bạn') {
           setActiveCity('Gần Bạn');
        }
      } else {
        // Fallback
        setCities(['Gần Bạn', 'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng']);
      }
    } catch (e) {
      setCities(['Gần Bạn', 'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng']);
    }
  };

  const fetchCinemas = async (province: string) => {
    setLoading(true);
    try {
      const res = await CinemaService.getCinemas(province);
      if (res.success) {
        setCinemas(res.data);
      }
    } catch (e: any) {
      console.log('Error fetching cinemas:', e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceValue.value }]
  }));

  const openMap = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const renderCinema = ({ item }: { item: Cinema }) => {
    const isSelected = selectedCinema === item.id.toString();
    return (
      <TouchableOpacity 
        style={[styles.cinemaCard, isSelected && styles.cinemaCardSelected]}
        onPress={() => navigation.navigate('CinemaDetail', { cinema: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cinemaName, isSelected && { color: Theme.colors.gold }]}>{item.name}</Text>
        </View>
        <Text style={styles.address}>{item.address}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={16} color="#888" />
            <Text style={[styles.distance, isSelected && { color: Theme.colors.accent }]}>
              {item.distance ? `Cách bạn ${item.distance} km` : item.province}
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
          data={cities}
          keyExtractor={item => item}
          contentContainerStyle={styles.cityList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.cityChip, 
                activeCity === item && styles.cityChipActive,
                item === 'Gần Bạn' && { borderColor: Theme.colors.warning, backgroundColor: activeCity === 'Gần Bạn' ? 'rgba(255,193,7,0.1)' : 'transparent' }
              ]}
              onPress={() => setActiveCity(item)}
            >
              {item === 'Gần Bạn' && <Ionicons name="location" size={14} color={activeCity === 'Gần Bạn' ? Theme.colors.warning : Theme.colors.textSecondary} style={{marginRight: 4}} />}
              <Text style={[
                styles.cityChipText, 
                activeCity === item && styles.cityChipTextActive,
                item === 'Gần Bạn' && activeCity === 'Gần Bạn' && { color: Theme.colors.warning }
              ]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={cinemas}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={renderCinema}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
           loading ? <Text style={{textAlign: 'center', marginTop: 20, color: Theme.colors.textSecondary}}>Đang tải rạp...</Text> : <Text style={{textAlign: 'center', marginTop: 20, color: Theme.colors.textSecondary}}>Không có rạp nào ở khu vực này</Text>
        }
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
    borderBottomColor: Theme.colors.cardBorder,
    alignItems: 'center',
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  citySelector: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
    paddingVertical: Theme.spacing.sm,
  },
  cityList: {
    paddingHorizontal: Theme.spacing.md,
    gap: 8,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  cityChipActive: {
    backgroundColor: 'rgba(111, 66, 193, 0.1)',
    borderColor: Theme.colors.gold,
  },
  cityChipText: {
    color: Theme.colors.textSecondary,
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
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  cinemaCardSelected: {
    borderColor: Theme.colors.gold,
    backgroundColor: 'rgba(111, 66, 193, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cinemaName: {
    color: Theme.colors.textPrimary,
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
    color: Theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.cardBorder,
    paddingTop: 12,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    color: Theme.colors.textSecondary,
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
