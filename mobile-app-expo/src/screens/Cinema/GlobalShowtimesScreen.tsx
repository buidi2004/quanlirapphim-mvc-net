import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
  StatusBar, ScrollView, Alert, ActivityIndicator,
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

import { CinemaService } from '../../services/CinemaService';

export const GlobalShowtimesScreen = ({ navigation }: any) => {
  const [selectedDate, setSelectedDate] = useState(getNext14Days()[0].dateString);
  const days = getNext14Days();

  const getRatingColor = (r: string) => {
    if (r === 'C18') return Theme.colors.badgeC18;
    if (r === 'C13') return Theme.colors.badgeC13;
    return Theme.colors.badgeP;
  };

  const [sections, setSections] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await CinemaService.getGlobalShowtimes(selectedDate);
      if (res.success && res.data) {
        const mappedSections = res.data.map((s: any) => ({
          title: s.province,
          data: s.cinemas,
        }));
        setSections(mappedSections);
        setProvinces(res.data.map((s: any) => s.province));
      }
    } catch (e) {
      console.log('Error fetching global showtimes', e);
    } finally {
      setLoading(false);
    }
  };

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
          {provinces.map(p => (
            <TouchableOpacity key={p} style={styles.provinceChip}>
              <Text style={styles.provinceText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* SectionList */}
      {loading ? (
        <View style={[styles.emptyContainer, { paddingTop: 40 }]}>
          <ActivityIndicator size="large" color={Theme.colors.warning} />
          <Text style={{ color: Theme.colors.textSecondary, marginTop: 10 }}>Đang tải lịch chiếu...</Text>
        </View>
      ) : (
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

            {cinema.movies.map((movie: any) => (
              <View key={movie.id} style={styles.movieBlock}>
                <View style={styles.movieInfoRow}>
                  <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                  <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(movie.rating) }]}>
                    <Text style={styles.ratingText}>{movie.rating}</Text>
                  </View>
                  <Text style={styles.duration}>{movie.durationMinutes}ph</Text>
                </View>
                <View style={styles.timesRow}>
                  {movie.times.map((t: any) => (
                    <TouchableOpacity
                      key={t.time + t.format}
                      style={styles.timeChip}
                      onPress={() => {
                        Alert.alert(
                          `${t.time} — ${movie.title}`,
                          'Để đặt vé, vui lòng sử dụng tính năng Đặt vé nhanh để chọn phim, rạp và suất chiếu.',
                          [
                            { text: 'Huỷ', style: 'cancel' },
                            {
                              text: '🎟 Đặt vé nhanh',
                              onPress: () =>
                                navigation.navigate('MainDrawer', {
                                  screen: 'MainTabsDrawer',
                                  params: { screen: 'BookingTab' },
                                } as any),
                            },
                          ]
                        );
                      }}
                    >
                      <Text style={styles.timeText}>{t.time}</Text>
                      <Text style={{ fontSize: 9, color: Theme.colors.textMuted, textAlign: 'center', marginTop: 2 }}>{t.format || '2D'}</Text>
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
      )}
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
    backgroundColor: 'rgba(111,66,193,0.1)', justifyContent: 'center', alignItems: 'center',
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
    backgroundColor: 'rgba(111,66,193,0.1)', borderWidth: 1, borderColor: Theme.colors.warning,
  },
  timeText: { color: Theme.colors.warning, fontSize: 13, fontWeight: 'bold' },

  emptyContainer: { paddingTop: 80, alignItems: 'center', gap: 16 },
  emptyText: { color: Theme.colors.textMuted, fontSize: 15 },
});
