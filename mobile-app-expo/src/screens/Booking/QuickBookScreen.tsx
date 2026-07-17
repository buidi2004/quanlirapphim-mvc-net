import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, Dimensions,
} from 'react-native';
import Reanimated, { SlideInRight, SlideOutLeft, SlideInLeft, SlideOutRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Theme } from '../../theme/tokens';
import { IMAGE_BASE_URL } from '../../api/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const STEPS = [
  { id: 1, label: 'Phim', icon: 'film-outline' },
  { id: 2, label: 'Rạp', icon: 'business-outline' },
  { id: 3, label: 'Ngày', icon: 'calendar-outline' },
  { id: 4, label: 'Suất', icon: 'time-outline' },
];

import { MovieService } from '../../services/MovieService';
import { CinemaService } from '../../services/CinemaService';
import { Movie } from '../../models/Movie';
import { Cinema, CinemaShowtimeGroup } from '../../models/Cinema';

export const QuickBookScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [selectedCinema, setSelectedCinema] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0].dateString);
  const [loadingCinemas, setLoadingCinemas] = useState(false);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [showtimes, setShowtimes] = useState<any[]>([]);

  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchMovies();
    fetchCinemas();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const fetchMovies = async () => {
    try {
      setLoadingMovies(true);
      const res = await MovieService.getMovies('now_showing');
      if (res.success && res.data) {
        setMovies(res.data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingMovies(false);
    }
  };

  const fetchCinemas = async () => {
    try {
      setLoadingCinemas(true);
      const res = await CinemaService.getCinemas();
      if (res.success && res.data) {
        setCinemas(res.data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingCinemas(false);
    }
  };

  const fetchShowtimes = async (cinemaId: number, dateStr: string) => {
    try {
      setLoadingShowtimes(true);
      const res = await CinemaService.getCinemaShowtimes(cinemaId, dateStr);
      if (res.success && res.data && res.data.items) {
        const group = res.data.items.find(g => g.movie.id === selectedMovie?.id);
        setShowtimes(group ? group.showtimes : []);
      } else {
        setShowtimes([]);
      }
    } catch (e) {
      console.log(e);
      setShowtimes([]);
    } finally {
      setLoadingShowtimes(false);
    }
  };

  const days = getNext7Days();

  const goToStep = (nextStep: number) => {
    setDirection(nextStep > step ? 'forward' : 'backward');
    setStep(nextStep);
  };

  const handleMovieSelect = (movie: any) => {
    setSelectedMovie(movie);
    goToStep(2);
  };

  const handleCinemaSelect = (cinema: any) => {
    setSelectedCinema(cinema);
    goToStep(3);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    if (selectedCinema) {
      fetchShowtimes(selectedCinema.id, date);
    }
    goToStep(4);
  };

  const handleShowtimeSelect = (showtime: any) => {
    navigation.navigate('SeatSelection', {
      showtimeId: showtime.id,
      movieTitle: selectedMovie?.title,
      cinemaName: selectedCinema?.name,
      showDate: selectedDate,
      showTime: showtime.startTime,
      roomName: showtime.roomName,
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
        <Text style={styles.headerTitle}>ĐẶT VÉ NHANH</Text>
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
      <Reanimated.View 
        key={step} 
        style={styles.content} 
        entering={direction === 'forward' ? SlideInRight : SlideInLeft} 
        exiting={direction === 'forward' ? SlideOutLeft : SlideOutRight}
      >

        {/* STEP 1: CHỌN PHIM */}
        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>Chọn phim bạn muốn xem</Text>
            {loadingMovies ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={Theme.colors.warning} />
                <Text style={styles.loadingText}>Đang tải phim...</Text>
              </View>
            ) : (
            <FlatList
              data={movies}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.movieRow, selectedMovie?.id === item.id && styles.movieRowSelected]}
                  onPress={() => handleMovieSelect(item)}
                >
                  <Image
                    source={{ uri: item.posterUrl?.startsWith('http') ? item.posterUrl : `${IMAGE_BASE_URL}${item.posterUrl}` }}
                    style={styles.movieThumb}
                    contentFit="cover"
                  />
                  <View style={styles.movieInfo}>
                    <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.movieMeta}>{item.genre} · {item.durationMinutes} phút</Text>
                    <View style={[styles.ageBadge, { backgroundColor: getAgeBadgeColor(item.ageRating ?? '') }]}>
                      <Text style={styles.ageBadgeText}>{item.ageRating}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#444" />
                </TouchableOpacity>
              )}
            />
            )}
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
                data={cinemas}
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
            {loadingShowtimes ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={Theme.colors.warning} />
                <Text style={styles.loadingText}>Đang tải suất chiếu...</Text>
              </View>
            ) : showtimes.length === 0 ? (
              <View style={styles.loadingBox}>
                <Text style={styles.loadingText}>Không có suất chiếu nào vào ngày này.</Text>
              </View>
            ) : (
            <FlatList
              data={showtimes}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.showtimeCard]}
                  onPress={() => handleShowtimeSelect(item)}
                >
                  <Text style={styles.showtimeTime}>{item.startTime}</Text>
                  <Text style={styles.showtimeRoom}>{item.roomName}</Text>
                  <View style={styles.showtimeFormatBadge}>
                    <Text style={styles.showtimeFormat}>{item.format || '2D Phụ đề'}</Text>
                  </View>
                  <Text style={[styles.showtimeSeats]}>
                    Giá vé: {item.price.toLocaleString('vi-VN')}₫
                  </Text>
                </TouchableOpacity>
              )}
            />
            )}
          </>
        )}
      </Reanimated.View>
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
    borderBottomColor: Theme.colors.cardBorder,
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
    borderBottomColor: Theme.colors.cardBorder,
  },
  stepItem: { alignItems: 'center' },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Theme.colors.surface, borderWidth: 2, borderColor: Theme.colors.cardBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  stepCircleActive: { borderColor: Theme.colors.warning, backgroundColor: 'rgba(111,66,193,0.1)' },
  stepCircleDone: { backgroundColor: Theme.colors.warning, borderColor: Theme.colors.warning },
  stepNum: { color: Theme.colors.textMuted, fontSize: 13, fontWeight: 'bold' },
  stepNumActive: { color: Theme.colors.warning },
  stepLabel: { color: Theme.colors.textMuted, fontSize: 10, marginTop: 4 },
  stepLabelActive: { color: Theme.colors.warning, fontWeight: 'bold' },
  stepLine: { flex: 1, height: 2, backgroundColor: Theme.colors.cardBorder, marginBottom: 16 },
  stepLineDone: { backgroundColor: Theme.colors.warning },

  summaryBar: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: Theme.spacing.md, paddingVertical: 10,
    backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.cardBorder,
  },
  summaryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Theme.colors.surface, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Theme.radius.pill, borderWidth: 1, borderColor: Theme.colors.cardBorder,
    maxWidth: SCREEN_WIDTH * 0.45,
  },
  summaryText: { color: Theme.colors.warning, fontSize: 11, flex: 1 },

  content: { flex: 1, paddingHorizontal: Theme.spacing.md, paddingTop: Theme.spacing.md },
  stepTitle: { color: Theme.colors.textPrimary, fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  stepSubtitle: { color: Theme.colors.textSecondary, fontSize: 13, marginBottom: Theme.spacing.md },

  // Movie row
  movieRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  movieRowSelected: { borderColor: Theme.colors.warning, backgroundColor: 'rgba(111,66,193,0.06)' },
  movieThumb: { width: 56, height: 80, borderRadius: Theme.radius.sm, backgroundColor: Theme.colors.cardBorder },
  movieInfo: { flex: 1, paddingHorizontal: 12 },
  movieTitle: { color: Theme.colors.textPrimary, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  movieMeta: { color: Theme.colors.textSecondary, fontSize: 12, marginBottom: 6 },
  ageBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  ageBadgeText: { color: Theme.colors.textPrimary, fontSize: 10, fontWeight: 'bold' },

  // Cinema row
  cinemaRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  cinemaIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(111,66,193,0.1)',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cinemaInfo: { flex: 1 },
  cinemaName: { color: Theme.colors.textPrimary, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  cinemaAddr: { color: Theme.colors.textSecondary, fontSize: 12 },

  // Day row
  dayRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  dayRowActive: { borderColor: Theme.colors.warning, backgroundColor: 'rgba(111,66,193,0.06)' },
  dayLeft: { gap: 2 },
  dayName: { color: Theme.colors.textSecondary, fontSize: 12 },
  dayNameActive: { color: Theme.colors.warning },
  dayNumber: { color: Theme.colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  dayNumberActive: { color: Theme.colors.warning },

  // Showtime
  showtimeCard: {
    flex: 1, backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 14, borderWidth: 1, borderColor: Theme.colors.cardBorder, alignItems: 'center', gap: 6,
  },
  showtimeCardLow: { borderColor: Theme.colors.badgeC18, backgroundColor: 'rgba(220,53,69,0.05)' },
  showtimeTime: { color: Theme.colors.textPrimary, fontSize: 22, fontWeight: 'bold' },
  showtimeRoom: { color: Theme.colors.textSecondary, fontSize: 11, textAlign: 'center' },
  showtimeFormatBadge: {
    backgroundColor: 'rgba(111,66,193,0.15)', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: Theme.radius.pill,
  },
  showtimeFormat: { color: Theme.colors.warning, fontSize: 10, fontWeight: 'bold' },
  showtimeSeats: { color: Theme.colors.textMuted, fontSize: 11 },
  showtimeSeatsLow: { color: Theme.colors.danger },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: Theme.colors.textSecondary, fontSize: 14 },
});
