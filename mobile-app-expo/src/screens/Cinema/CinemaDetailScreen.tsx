import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Linking, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../theme/tokens';
import { CinemaService } from '../../services/CinemaService';
import { Cinema, CinemaShowtimeGroup } from '../../models/Cinema';
import { IMAGE_BASE_URL } from '../../api/apiClient';

const MOCK_CINEMA: Cinema = {
  id: 1,
  name: 'CinemaX Landmark 81',
  slug: 'cinemax-landmark-81',
  province: 'TP.Hồ Chí Minh',
  address: 'Tầng 10, Landmark 81, 720A Điện Biên Phủ, P.22, Bình Thạnh, TP.HCM',
  phone: '028-1234-5678',
  email: 'landmark81@cinemax.vn',
  openingHours: '08:00 - 24:00',
  imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
  lat: 10.7941,
  lng: 106.7218,
  facilities: 'IMAX, Dolby Atmos, 4DX, Sweetbox, Parking, F&B, WiFi',
  description: 'CinemaX Landmark 81 là rạp chiếu phim hiện đại nhất TP.HCM, tọa lạc tại tòa nhà cao nhất Việt Nam.',
};

const MOCK_EXPERIENCES = [
  { name: 'IMAX', icon: 'expand-outline', description: 'Màn hình khổng lồ & âm thanh đỉnh cao' },
  { name: 'Dolby Atmos', icon: 'volume-high-outline', description: 'Âm thanh vòm 360° hoàn hảo' },
  { name: 'Sweetbox', icon: 'heart-outline', description: 'Ghế đôi lãng mạn dành cho cặp đôi' },
];





const getNext7Days = () => {
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateString: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Hôm nay' : dayNames[d.getDay()],
      dayNumber: d.getDate(),
      month: d.getMonth() + 1,
    };
  });
};

export const CinemaDetailScreen = ({ navigation, route }: any) => {
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0].dateString);
  const [showtimes, setShowtimes] = useState<CinemaShowtimeGroup[]>([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [cinemaData, setCinemaData] = useState<Cinema | null>(route.params?.cinema || null);
  const [loadingCinema, setLoadingCinema] = useState(!route.params?.cinema);
  const days = getNext7Days();

  // Bug #3 fix: nếu chỉ nhận cinemaId (từ GlobalShowtimesScreen), fetch cinema đầy đủ từ API
  useEffect(() => {
    if (!route.params?.cinema && route.params?.cinemaId) {
      fetchCinema(route.params.cinemaId);
    }
  }, []);

  const fetchCinema = async (id: number) => {
    try {
      setLoadingCinema(true);
      const res = await CinemaService.getCinemas();
      if (res.success) {
        const found = res.data.find((c: Cinema) => c.id === id);
        setCinemaData(found || MOCK_CINEMA);
      } else {
        setCinemaData(MOCK_CINEMA);
      }
    } catch {
      setCinemaData(MOCK_CINEMA);
    } finally {
      setLoadingCinema(false);
    }
  };

  const cinema: Cinema = cinemaData || MOCK_CINEMA;

  useEffect(() => {
    if (!loadingCinema) fetchShowtimes();
  }, [selectedDate, cinema.id, loadingCinema]);

  const fetchShowtimes = async () => {
    setLoadingShowtimes(true);
    try {
      const res = await CinemaService.getCinemaShowtimes(cinema.id, selectedDate);
      if (res.success) {
        setShowtimes(res.data?.items || []);
      }
    } catch (error: any) {
      console.log('Error fetching showtimes:', error?.message || error);
      setShowtimes([]);
    } finally {
      setLoadingShowtimes(false);
    }
  };

  if (loadingCinema) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f5c518" />
      </SafeAreaView>
    );
  }

  const openMap = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${cinema.name}@${cinema.lat},${cinema.lng}`,
      android: `geo:0,0?q=${cinema.lat},${cinema.lng}(${cinema.name})`,
    });
    if (url) Linking.openURL(url);
  };

  const getRatingColor = (r: string) => {
    if (r === 'C18') return Theme.colors.badgeC18;
    if (r === 'C13') return Theme.colors.badgeC13;
    return Theme.colors.badgeP;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Floating Back Button */}
      <TouchableOpacity style={styles.floatingBack} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: cinema.imageUrl?.startsWith('http') ? cinema.imageUrl : `${IMAGE_BASE_URL}${cinema.imageUrl}` }} 
            style={styles.heroImage} 
            contentFit="cover" 
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)', Theme.colors.background]}
            style={styles.heroGradient}
          >
            <View style={styles.heroCityBadge}>
              <Text style={styles.heroCityText}>{cinema.province}</Text>
            </View>
            <Text style={styles.heroTitle}>{cinema.name}</Text>
            <Text style={styles.heroAddress}>{cinema.address}</Text>
          </LinearGradient>
        </View>

        <View style={styles.body}>
          {/* Info Cards */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Ionicons name="call-outline" size={18} color={Theme.colors.warning} />
              <Text style={styles.infoValue}>{cinema.phone || 'Đang cập nhật'}</Text>
              <Text style={styles.infoLabel}>Hotline</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={18} color={Theme.colors.warning} />
              <Text style={styles.infoValue}>{cinema.openingHours || '08:00 - 24:00'}</Text>
              <Text style={styles.infoLabel}>Giờ mở cửa</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="mail-outline" size={18} color={Theme.colors.warning} />
              <Text style={styles.infoValue} numberOfLines={1}>{cinema.email || 'Liên hệ'}</Text>
              <Text style={styles.infoLabel}>Email</Text>
            </View>
          </View>

          {cinema.facilities && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tiện ích</Text>
              <View style={styles.facilityRow}>
                {cinema.facilities.split(',').map((f: string) => (
                  <View key={f.trim()} style={styles.facilityChip}>
                    <Text style={styles.facilityText}>{f.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Map Button */}
          <TouchableOpacity style={styles.mapBtn} onPress={openMap}>
            <Ionicons name="navigate-outline" size={20} color="#000" />
            <Text style={styles.mapBtnText}>📍 Mở Google Maps</Text>
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giới thiệu</Text>
            <Text style={styles.description}>{cinema.description}</Text>
          </View>

          {/* Experiences (MOCK for now as it's not in DB schema) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trải nghiệm tại rạp</Text>
            <View style={styles.expRow}>
              {MOCK_EXPERIENCES.map((exp: { name: string; icon: string; description: string }) => (
                <View key={exp.name} style={styles.expCard}>
                  <Ionicons name={exp.icon as any} size={24} color={Theme.colors.warning} />
                  <Text style={styles.expName}>{exp.name}</Text>
                  <Text style={styles.expDesc}>{exp.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Date Slider */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch chiếu hôm nay</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSlider}>
              {days.map(day => (
                <TouchableOpacity
                  key={day.dateString}
                  style={[styles.dateChip, selectedDate === day.dateString && styles.dateChipActive]}
                  onPress={() => setSelectedDate(day.dateString)}
                >
                  <Text style={[styles.dateDayName, selectedDate === day.dateString && styles.dateDayNameActive]}>
                    {day.dayName}
                  </Text>
                  <Text style={[styles.dateDayNum, selectedDate === day.dateString && styles.dateDayNumActive]}>
                    {day.dayNumber}
                  </Text>
                  <Text style={[styles.dateMonth, selectedDate === day.dateString && styles.dateMonthActive]}>
                    Th{day.month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Showtimes */}
            {loadingShowtimes ? (
               <Text style={{textAlign: 'center', marginTop: 20, color: Theme.colors.textSecondary}}>Đang tải lịch chiếu...</Text>
            ) : showtimes.length === 0 ? (
               <Text style={{textAlign: 'center', marginTop: 20, color: Theme.colors.textSecondary}}>Chưa có suất chiếu nào cho ngày này.</Text>
            ) : (
              showtimes.map(group => (
                <View key={group.movie.id} style={styles.showtimeCard}>
                  <View style={styles.showtimeMovieRow}>
                    <Text style={styles.showtimeMovieTitle} numberOfLines={1}>{group.movie.title}</Text>
                    <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(group.movie.genre) }]}>
                      <Text style={styles.ratingBadgeText}>{group.movie.genre}</Text>
                    </View>
                    <Text style={styles.showtimeDuration}>{group.movie.durationMinutes}ph</Text>
                  </View>
                  <View style={styles.timesRow}>
                    {group.showtimes.map(t => (
                      <TouchableOpacity
                        key={t.id}
                        style={styles.timeChip}
                        onPress={() => navigation.navigate('SeatSelection', { 
                          showTime: t.startTime, 
                          movieTitle: group.movie.title,
                          showtimeId: t.id
                        })}
                      >
                        <Text style={styles.timeText}>{t.startTime}</Text>
                        <Text style={{color: Theme.colors.textMuted, fontSize: 10, marginTop: 2, textAlign: 'center'}}>{t.format || '2D'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('GlobalShowtimes')}
          >
            <Ionicons name="calendar-outline" size={18} color="#000" />
            <Text style={styles.ctaBtnText}>📅 Xem lịch chiếu toàn bộ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  floatingBack: {
    position: 'absolute', top: 50, left: 16, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center',
  },

  heroContainer: { height: 300, position: 'relative' },
  heroImage: { ...StyleSheet.absoluteFill },
  heroGradient: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
  },
  heroCityBadge: {
    backgroundColor: Theme.colors.accent, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: Theme.radius.pill, marginBottom: 8,
  },
  heroCityText: { color: Theme.colors.textPrimary, fontSize: 11, fontWeight: 'bold' },
  heroTitle: { color: Theme.colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 6 },
  heroAddress: { color: Theme.colors.textSecondary, fontSize: 13, lineHeight: 18 },

  body: { padding: Theme.spacing.md },

  infoRow: { flexDirection: 'row', gap: 10, marginBottom: Theme.spacing.lg },
  infoCard: {
    flex: 1, backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 12, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  infoValue: { color: Theme.colors.textPrimary, fontSize: 11, fontWeight: 'bold', textAlign: 'center' },
  infoLabel: { color: Theme.colors.textMuted, fontSize: 10, textAlign: 'center' },

  section: { marginBottom: Theme.spacing.xl },
  sectionTitle: { color: Theme.colors.warning, fontSize: 16, fontWeight: 'bold', marginBottom: 12 },

  facilityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  facilityChip: {
    backgroundColor: Theme.colors.surface, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Theme.radius.pill, borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  facilityText: { color: Theme.colors.textSecondary, fontSize: 12 },

  mapBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Theme.colors.warning, borderRadius: Theme.radius.lg,
    paddingVertical: 14, marginBottom: Theme.spacing.xl,
  },
  mapBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },

  description: { color: Theme.colors.textSecondary, fontSize: 14, lineHeight: 22 },

  expRow: { flexDirection: 'row', gap: 10 },
  expCard: {
    flex: 1, backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 14, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  expName: { color: Theme.colors.warning, fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  expDesc: { color: Theme.colors.textMuted, fontSize: 10, textAlign: 'center', lineHeight: 14 },

  dateSlider: { marginBottom: 16 },
  dateChip: {
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    borderWidth: 1, borderColor: Theme.colors.cardBorder, marginRight: 10,
  },
  dateChipActive: { borderColor: Theme.colors.warning, backgroundColor: Theme.colors.warningLight },
  dateDayName: { color: Theme.colors.textMuted, fontSize: 10, marginBottom: 2 },
  dateDayNameActive: { color: Theme.colors.warning },
  dateDayNum: { color: Theme.colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  dateDayNumActive: { color: Theme.colors.warning },
  dateMonth: { color: Theme.colors.textMuted, fontSize: 10 },
  dateMonthActive: { color: Theme.colors.warning },

  showtimeCard: {
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 14, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  showtimeMovieRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  showtimeMovieTitle: { color: Theme.colors.textPrimary, fontSize: 14, fontWeight: 'bold', flex: 1 },
  ratingBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  ratingBadgeText: { color: Theme.colors.textPrimary, fontSize: 10, fontWeight: 'bold' },
  showtimeDuration: { color: Theme.colors.textSecondary, fontSize: 12 },
  timesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    backgroundColor: 'rgba(111,66,193,0.1)', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Theme.radius.md, borderWidth: 1, borderColor: Theme.colors.warning,
  },
  timeText: { color: Theme.colors.warning, fontSize: 14, fontWeight: 'bold' },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Theme.colors.accent, borderRadius: Theme.radius.lg,
    paddingVertical: 16, marginBottom: 30,
  },
  ctaBtnText: { color: Theme.colors.textPrimary, fontWeight: 'bold', fontSize: 15 },
});
