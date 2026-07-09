import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
  StatusBar, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';

const getNext14Days = () => {
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateString: d.toISOString().split('T')[0],
      label: i === 0 ? 'Hôm nay' : `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`,
      short: i === 0 ? 'Hôm nay' : `${d.getDate()}/${d.getMonth() + 1}`,
    };
  });
};

const SECTIONS_DATA = [
  {
    province: 'TP. Hồ Chí Minh',
    cinemas: [
      {
        id: 1,
        name: 'CinemaX Landmark 81',
        address: 'Tầng 10, Landmark 81, Bình Thạnh',
        movies: [
          { id: 1, title: 'Avengers: Endgame', rating: 'C13', durationMinutes: 181, times: ['10:30', '13:15', '16:00', '19:30', '21:45'] },
          { id: 2, title: 'Dune: Part Two', rating: 'C13', durationMinutes: 166, times: ['14:00', '19:30'] },
        ],
      },
      {
        id: 2,
        name: 'CinemaX Vincom Đồng Khởi',
        address: 'Tầng 8, Vincom Center, Q.1',
        movies: [
          { id: 3, title: 'Deadpool & Wolverine', rating: 'C18', durationMinutes: 127, times: ['11:00', '14:00', '17:00', '20:00'] },
          { id: 4, title: 'Inside Out 2', rating: 'P', durationMinutes: 100, times: ['09:00', '11:30', '14:00'] },
        ],
      },
    ],
  },
  {
    province: 'Hà Nội',
    cinemas: [
      {
        id: 3,
        name: 'CinemaX Vincom Bà Triệu',
        address: 'Tầng 5, Vincom, Hai Bà Trưng',
        movies: [
          { id: 5, title: 'Oppenheimer', rating: 'C18', durationMinutes: 180, times: ['10:00', '14:00', '18:00'] },
          { id: 2, title: 'Dune: Part Two', rating: 'C13', durationMinutes: 166, times: ['12:00', '16:00', '20:00'] },
        ],
      },
    ],
  },
  {
    province: 'Đà Nẵng',
    cinemas: [
      {
        id: 4,
        name: 'CinemaX Vincom Đà Nẵng',
        address: 'Tầng 6, Vincom, Sơn Trà',
        movies: [
          { id: 1, title: 'Avengers: Endgame', rating: 'C13', durationMinutes: 181, times: ['11:00', '14:30', '18:00'] },
        ],
      },
    ],
  },
];

const PROVINCES = ['TP.HCM', 'Hà Nội', 'Đà Nẵng'];

export const GlobalShowtimesScreen = ({ navigation }: any) => {
  const [selectedDate, setSelectedDate] = useState(getNext14Days()[0].dateString);
  const days = getNext14Days();

  const getRatingColor = (r: string) => {
    if (r === 'C18') return Theme.colors.badgeC18;
    if (r === 'C13') return Theme.colors.badgeC13;
    return Theme.colors.badgeP;
  };

  const sections = SECTIONS_DATA.map(s => ({
    title: s.province,
    data: s.cinemas,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📅 LỊCH CHIẾU TOÀN QUỐC</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Date Slider */}
      <View style={styles.dateWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {days.map(day => (
            <TouchableOpacity
              key={day.dateString}
              style={[styles.dateChip, selectedDate === day.dateString && styles.dateChipActive]}
              onPress={() => setSelectedDate(day.dateString)}
            >
              <Text style={[styles.dateLabel, selectedDate === day.dateString && styles.dateLabelActive]}>
                {day.short}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Province Jump Links */}
      <View style={styles.provinceBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {PROVINCES.map(p => (
            <TouchableOpacity key={p} style={styles.provinceChip}>
              <Text style={styles.provinceText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* SectionList */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={16} color={Theme.colors.accent} />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        renderItem={({ item: cinema }) => (
          <View style={styles.cinemaBlock}>
            <TouchableOpacity
              style={styles.cinemaHeader}
              onPress={() => navigation.navigate('CinemaDetail', { cinemaId: cinema.id })}
            >
              <View style={styles.cinemaIconBox}>
                <Ionicons name="business" size={18} color={Theme.colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cinemaName}>{cinema.name}</Text>
                <Text style={styles.cinemaAddr}>{cinema.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#444" />
            </TouchableOpacity>

            {cinema.movies.map(movie => (
              <View key={movie.id} style={styles.movieBlock}>
                <View style={styles.movieInfoRow}>
                  <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                  <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(movie.rating) }]}>
                    <Text style={styles.ratingText}>{movie.rating}</Text>
                  </View>
                  <Text style={styles.duration}>{movie.durationMinutes}ph</Text>
                </View>
                <View style={styles.timesRow}>
                  {movie.times.map(t => (
                    <TouchableOpacity
                      key={t}
                      style={styles.timeChip}
                      onPress={() => navigation.navigate('SeatSelection', {
                        showTime: t, movieTitle: movie.title, cinemaName: cinema.name,
                      })}
                    >
                      <Text style={styles.timeText}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>Không có suất chiếu trong ngày này</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1, borderBottomColor: Theme.colors.cardBorder,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: Theme.colors.warning, fontSize: 14, fontWeight: 'bold' },

  dateWrapper: { backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.cardBorder },
  dateScroll: { gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  dateChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Theme.radius.pill,
    backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  dateChipActive: { backgroundColor: Theme.colors.warningLight, borderColor: Theme.colors.warning },
  dateLabel: { color: Theme.colors.textSecondary, fontSize: 12, fontWeight: '600' },
  dateLabelActive: { color: Theme.colors.warning },

  provinceBar: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Theme.colors.cardBorder },
  provinceChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: Theme.radius.pill,
    backgroundColor: Theme.colors.accentLight, borderWidth: 1, borderColor: Theme.colors.accent,
  },
  provinceText: { color: Theme.colors.accent, fontSize: 12, fontWeight: 'bold' },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Theme.colors.surface, paddingHorizontal: Theme.spacing.md, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Theme.colors.cardBorder,
  },
  sectionTitle: { color: Theme.colors.textPrimary, fontSize: 16, fontWeight: 'bold' },

  cinemaBlock: {
    marginHorizontal: Theme.spacing.md, marginTop: 12,
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    borderWidth: 1, borderColor: Theme.colors.cardBorder, overflow: 'hidden',
  },
  cinemaHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderBottomWidth: 1, borderBottomColor: '#2d2d44',
  },
  cinemaIconBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,193,7,0.1)', justifyContent: 'center', alignItems: 'center',
  },
  cinemaName: { color: Theme.colors.textPrimary, fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  cinemaAddr: { color: Theme.colors.textSecondary, fontSize: 11 },

  movieBlock: { padding: 14, borderBottomWidth: 1, borderBottomColor: Theme.colors.cardBorder },
  movieInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  movieTitle: { color: Theme.colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
  ratingBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  ratingText: { color: Theme.colors.textPrimary, fontSize: 9, fontWeight: 'bold' },
  duration: { color: Theme.colors.textSecondary, fontSize: 11 },
  timesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: Theme.radius.md,
    backgroundColor: 'rgba(255,193,7,0.1)', borderWidth: 1, borderColor: Theme.colors.warning,
  },
  timeText: { color: Theme.colors.warning, fontSize: 13, fontWeight: 'bold' },

  emptyContainer: { paddingTop: 80, alignItems: 'center', gap: 16 },
  emptyText: { color: Theme.colors.textMuted, fontSize: 15 },
});
