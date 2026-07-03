import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Theme } from '../../theme/tokens';
import { IMAGE_BASE_URL } from '../../api/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STEPS = [
  { id: 1, label: 'Phim', icon: 'film-outline' },
  { id: 2, label: 'Rạp', icon: 'business-outline' },
  { id: 3, label: 'Ngày', icon: 'calendar-outline' },
  { id: 4, label: 'Suất', icon: 'time-outline' },
];

// Mock data
const MOCK_MOVIES = [
  { id: 1, title: 'Avengers: Endgame', posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', genre: 'Hành động', duration: 181, ageRating: 'C13' },
  { id: 2, title: 'Dune: Part Two', posterUrl: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg', genre: 'Khoa học', duration: 166, ageRating: 'C13' },
  { id: 3, title: 'Deadpool & Wolverine', posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', genre: 'Hành động', duration: 127, ageRating: 'C18' },
  { id: 4, title: 'Inside Out 2', posterUrl: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', genre: 'Hoạt hình', duration: 100, ageRating: 'P' },
  { id: 5, title: 'Oppenheimer', posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', genre: 'Tiểu sử', duration: 180, ageRating: 'C18' },
];

const MOCK_CINEMAS = [
  { id: 1, name: 'CinemaX Landmark 81', address: 'Tầng 10, Landmark 81, Bình Thạnh, TP.HCM' },
  { id: 2, name: 'CinemaX Vincom Đồng Khởi', address: 'Tầng 8, Vincom Center, Q.1, TP.HCM' },
  { id: 3, name: 'CinemaX Aeon Mall Bình Tân', address: 'Tầng 3, Aeon Mall, Bình Tân, TP.HCM' },
];

const getNext7Days = () => {
  const days = [];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      dateString: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Hôm nay' : dayNames[d.getDay()],
      dayNumber: d.getDate(),
      month: d.getMonth() + 1,
    });
  }
  return days;
};

const MOCK_SHOWTIMES = [
  { id: 1, time: '09:15', room: 'Phòng 1', format: '2D', seatsLeft: 42 },
  { id: 2, time: '11:30', room: 'Phòng IMAX', format: 'IMAX', seatsLeft: 18 },
  { id: 3, time: '14:00', room: 'Phòng 2', format: '2D', seatsLeft: 56 },
  { id: 4, time: '16:45', room: 'Phòng Dolby', format: 'Dolby', seatsLeft: 30 },
  { id: 5, time: '19:30', room: 'Phòng IMAX', format: 'IMAX', seatsLeft: 4 },
  { id: 6, time: '21:00', room: 'Phòng 3', format: '2D', seatsLeft: 61 },
];

export const QuickBookScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [selectedCinema, setSelectedCinema] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0].dateString);
  const [loadingCinemas, setLoadingCinemas] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const days = getNext7Days();

  const goToStep = (nextStep: number) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    setStep(nextStep);
  };

  const handleMovieSelect = (movie: any) => {
    setSelectedMovie(movie);
    setLoadingCinemas(true);
    timerRef.current = setTimeout(() => { setLoadingCinemas(false); goToStep(2); }, 600);
  };

  const handleCinemaSelect = (cinema: any) => {
    setSelectedCinema(cinema);
    goToStep(3);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    goToStep(4);
  };

  const handleShowtimeSelect = (showtime: any) => {
    navigation.navigate('SeatSelection', {
      showtimeId: showtime.id,
      movieTitle: selectedMovie?.title,
      cinemaName: selectedCinema?.name,
      showDate: selectedDate,
      showTime: showtime.time,
      roomName: showtime.room,
    });
  };

  const getAgeBadgeColor = (rating: string) => {
    if (rating === 'C18') return Theme.colors.badgeC18;
    if (rating === 'C13') return Theme.colors.badgeC13;
    return Theme.colors.badgeP;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚡ ĐẶT VÉ NHANH</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepRow}>
        {STEPS.map((s, index) => (
          <React.Fragment key={s.id}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, step >= s.id && styles.stepCircleActive, step > s.id && styles.stepCircleDone]}>
                {step > s.id
                  ? <Ionicons name="checkmark" size={14} color="#000" />
                  : <Text style={[styles.stepNum, step >= s.id && styles.stepNumActive]}>{s.id}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, step >= s.id && styles.stepLabelActive]}>{s.label}</Text>
            </View>
            {index < STEPS.length - 1 && (
              <View style={[styles.stepLine, step > s.id && styles.stepLineDone]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Selection Summary */}
      {step > 1 && (
        <View style={styles.summaryBar}>
          {selectedMovie && (
            <TouchableOpacity onPress={() => goToStep(1)} style={styles.summaryChip}>
              <Ionicons name="film" size={12} color={Theme.colors.warning} />
              <Text style={styles.summaryText} numberOfLines={1}>{selectedMovie.title}</Text>
              <Ionicons name="close-circle" size={12} color="#666" />
            </TouchableOpacity>
          )}
          {selectedCinema && step > 2 && (
            <TouchableOpacity onPress={() => goToStep(2)} style={styles.summaryChip}>
              <Ionicons name="business" size={12} color={Theme.colors.warning} />
              <Text style={styles.summaryText} numberOfLines={1}>{selectedCinema.name.replace('CinemaX ', '')}</Text>
              <Ionicons name="close-circle" size={12} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Step Content */}
      <Animated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>

        {/* STEP 1: CHỌN PHIM */}
        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>Chọn phim bạn muốn xem</Text>
            <FlatList
              data={MOCK_MOVIES}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.movieRow, selectedMovie?.id === item.id && styles.movieRowSelected]}
                  onPress={() => handleMovieSelect(item)}
                >
                  <Image
                    source={{ uri: item.posterUrl }}
                    style={styles.movieThumb}
                    contentFit="cover"
                  />
                  <View style={styles.movieInfo}>
                    <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.movieMeta}>{item.genre} · {item.duration} phút</Text>
                    <View style={[styles.ageBadge, { backgroundColor: getAgeBadgeColor(item.ageRating) }]}>
                      <Text style={styles.ageBadgeText}>{item.ageRating}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#444" />
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* STEP 2: CHỌN RẠP */}
        {step === 2 && (
          <>
            <Text style={styles.stepTitle}>Chọn rạp chiếu</Text>
            {loadingCinemas ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={Theme.colors.warning} />
                <Text style={styles.loadingText}>Đang tìm rạp chiếu...</Text>
              </View>
            ) : (
              <FlatList
                data={MOCK_CINEMAS}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.cinemaRow, selectedCinema?.id === item.id && styles.movieRowSelected]}
                    onPress={() => handleCinemaSelect(item)}
                  >
                    <View style={styles.cinemaIconBox}>
                      <Ionicons name="business" size={22} color={Theme.colors.warning} />
                    </View>
                    <View style={styles.cinemaInfo}>
                      <Text style={styles.cinemaName}>{item.name}</Text>
                      <Text style={styles.cinemaAddr} numberOfLines={1}>{item.address}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#444" />
                  </TouchableOpacity>
                )}
              />
            )}
          </>
        )}

        {/* STEP 3: CHỌN NGÀY */}
        {step === 3 && (
          <>
            <Text style={styles.stepTitle}>Chọn ngày xem phim</Text>
            <FlatList
              data={days}
              keyExtractor={item => item.dateString}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dayRow, selectedDate === item.dateString && styles.dayRowActive]}
                  onPress={() => handleDateSelect(item.dateString)}
                >
                  <View style={styles.dayLeft}>
                    <Text style={[styles.dayName, selectedDate === item.dateString && styles.dayNameActive]}>{item.dayName}</Text>
                    <Text style={[styles.dayNumber, selectedDate === item.dateString && styles.dayNumberActive]}>
                      {item.dayNumber}/{item.month}
                    </Text>
                  </View>
                  <Ionicons name="calendar-outline" size={20} color={selectedDate === item.dateString ? Theme.colors.warning : '#444'} />
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* STEP 4: CHỌN SUẤT CHIẾU */}
        {step === 4 && (
          <>
            <Text style={styles.stepTitle}>Chọn suất chiếu</Text>
            <Text style={styles.stepSubtitle}>{selectedDate}</Text>
            <FlatList
              data={MOCK_SHOWTIMES}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.showtimeCard, item.seatsLeft <= 5 && styles.showtimeCardLow]}
                  onPress={() => handleShowtimeSelect(item)}
                >
                  <Text style={styles.showtimeTime}>{item.time}</Text>
                  <Text style={styles.showtimeRoom}>{item.room}</Text>
                  <View style={styles.showtimeFormatBadge}>
                    <Text style={styles.showtimeFormat}>{item.format}</Text>
                  </View>
                  <Text style={[styles.showtimeSeats, item.seatsLeft <= 5 && styles.showtimeSeatsLow]}>
                    {item.seatsLeft <= 5 ? `⚠ Còn ${item.seatsLeft} ghế` : `Còn ${item.seatsLeft} ghế`}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: Theme.colors.warning, fontSize: 16, fontWeight: 'bold' },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  stepItem: { alignItems: 'center' },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#222', borderWidth: 2, borderColor: '#444',
    justifyContent: 'center', alignItems: 'center',
  },
  stepCircleActive: { borderColor: Theme.colors.warning, backgroundColor: 'rgba(255,193,7,0.1)' },
  stepCircleDone: { backgroundColor: Theme.colors.warning, borderColor: Theme.colors.warning },
  stepNum: { color: '#666', fontSize: 13, fontWeight: 'bold' },
  stepNumActive: { color: Theme.colors.warning },
  stepLabel: { color: '#555', fontSize: 10, marginTop: 4 },
  stepLabelActive: { color: Theme.colors.warning, fontWeight: 'bold' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#333', marginBottom: 16 },
  stepLineDone: { backgroundColor: Theme.colors.warning },

  summaryBar: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: Theme.spacing.md, paddingVertical: 10,
    backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  summaryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#1a1a2e', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Theme.radius.pill, borderWidth: 1, borderColor: '#2d2d44',
    maxWidth: SCREEN_WIDTH * 0.45,
  },
  summaryText: { color: Theme.colors.warning, fontSize: 11, flex: 1 },

  content: { flex: 1, paddingHorizontal: Theme.spacing.md, paddingTop: Theme.spacing.md },
  stepTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  stepSubtitle: { color: '#888', fontSize: 13, marginBottom: Theme.spacing.md },

  // Movie row
  movieRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#2d2d44',
  },
  movieRowSelected: { borderColor: Theme.colors.warning, backgroundColor: 'rgba(255,193,7,0.06)' },
  movieThumb: { width: 56, height: 80, borderRadius: Theme.radius.sm, backgroundColor: '#333' },
  movieInfo: { flex: 1, paddingHorizontal: 12 },
  movieTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  movieMeta: { color: '#888', fontSize: 12, marginBottom: 6 },
  ageBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  ageBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Cinema row
  cinemaRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2d2d44',
  },
  cinemaIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,193,7,0.1)',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cinemaInfo: { flex: 1 },
  cinemaName: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  cinemaAddr: { color: '#888', fontSize: 12 },

  // Day row
  dayRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#2d2d44',
  },
  dayRowActive: { borderColor: Theme.colors.warning, backgroundColor: 'rgba(255,193,7,0.06)' },
  dayLeft: { gap: 2 },
  dayName: { color: '#888', fontSize: 12 },
  dayNameActive: { color: Theme.colors.warning },
  dayNumber: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  dayNumberActive: { color: Theme.colors.warning },

  // Showtime
  showtimeCard: {
    flex: 1, backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 14, borderWidth: 1, borderColor: '#2d2d44', alignItems: 'center', gap: 6,
  },
  showtimeCardLow: { borderColor: Theme.colors.badgeC18, backgroundColor: 'rgba(220,53,69,0.05)' },
  showtimeTime: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  showtimeRoom: { color: '#888', fontSize: 11, textAlign: 'center' },
  showtimeFormatBadge: {
    backgroundColor: 'rgba(255,193,7,0.15)', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: Theme.radius.pill,
  },
  showtimeFormat: { color: Theme.colors.warning, fontSize: 10, fontWeight: 'bold' },
  showtimeSeats: { color: '#666', fontSize: 11 },
  showtimeSeatsLow: { color: Theme.colors.danger },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: '#888', fontSize: 14 },
});
