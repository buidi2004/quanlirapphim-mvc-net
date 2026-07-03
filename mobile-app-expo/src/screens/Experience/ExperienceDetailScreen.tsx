import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';

const EXPERIENCES: Record<string, {
  name: string; icon: string; slogan: string; description: string;
  imageUrl: string; accent: string;
  highlights: { icon: string; title: string; desc: string }[];
  others: { name: string; icon: string; slogan: string }[];
}> = {
  imax: {
    name: 'IMAX',
    icon: '🎥',
    slogan: 'To Feel It Is To Believe It',
    description: 'IMAX mang đến màn hình cong khổng lồ, kết hợp âm thanh vòm 12 kênh và chất lượng hình ảnh 4K sắc nét đến từng chi tiết. Mỗi suất chiếu IMAX là một hành trình điện ảnh vượt ra ngoài giới hạn.',
    imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800',
    accent: '#00b4d8',
    highlights: [
      { icon: 'expand-outline', title: 'Màn hình 26x16m', desc: 'Lớn nhất Việt Nam' },
      { icon: 'musical-notes-outline', title: 'Âm thanh 12 kênh', desc: 'Immersive 360°' },
      { icon: 'eye-outline', title: 'Hình ảnh 4K', desc: 'Sắc nét tuyệt đối' },
    ],
    others: [
      { name: 'Dolby Atmos', icon: '🔊', slogan: 'Sound Around You' },
      { name: 'Sweetbox', icon: '❤️', slogan: 'Dành cho cặp đôi' },
    ],
  },
  dolby: {
    name: 'Dolby Atmos',
    icon: '🔊',
    slogan: 'Sound Around You',
    description: 'Dolby Atmos tạo ra âm thanh ba chiều bao quanh hoàn toàn, với hơn 64 loa được bố trí khắp phòng chiếu kể cả trên trần. Mỗi âm thanh được định vị chính xác trong không gian.',
    imageUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800',
    accent: '#7b2d8b',
    highlights: [
      { icon: 'volume-high-outline', title: 'Âm thanh vòm 64 loa', desc: 'Bao quanh 360°' },
      { icon: 'musical-note-outline', title: 'Dolby Vision', desc: 'Màu sắc sống động' },
      { icon: 'headset-outline', title: 'Object-Based Audio', desc: 'Định vị âm thanh 3D' },
    ],
    others: [
      { name: 'IMAX', icon: '🎥', slogan: 'To Feel It Is To Believe It' },
      { name: 'Sweetbox', icon: '❤️', slogan: 'Dành cho cặp đôi' },
    ],
  },
  sweetbox: {
    name: 'Sweetbox',
    icon: '❤️',
    slogan: 'Trải nghiệm cặp đôi lãng mạn',
    description: 'Sweetbox là ghế đôi rộng rãi với đệm êm mềm, được bố trí riêng tư ở hàng cuối phòng chiếu. Ghế có thể điều chỉnh ngả lưng, đi kèm bàn nhỏ tiện lợi và màn chắn riêng tư.',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    accent: '#ff6b81',
    highlights: [
      { icon: 'heart-outline', title: 'Ghế đôi cao cấp', desc: 'Đệm thương gia hạng nhất' },
      { icon: 'lock-closed-outline', title: 'Không gian riêng tư', desc: 'Màn che riêng biệt' },
      { icon: 'restaurant-outline', title: 'F&B tại chỗ', desc: 'Phục vụ tận ghế' },
    ],
    others: [
      { name: 'IMAX', icon: '🎥', slogan: 'To Feel It Is To Believe It' },
      { name: 'Dolby Atmos', icon: '🔊', slogan: 'Sound Around You' },
    ],
  },
};

export const ExperienceDetailScreen = ({ navigation, route }: any) => {
  const type = route?.params?.type || 'imax';
  const exp = EXPERIENCES[type] || EXPERIENCES.imax;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Floating Back */}
      <TouchableOpacity style={styles.floatingBack} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: exp.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.7)', Theme.colors.background]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={[styles.badgeChip, { backgroundColor: exp.accent + '30', borderColor: exp.accent }]}>
              <Text style={styles.badgeText}>CinemaX</Text>
            </View>
            <Text style={styles.heroIcon}>{exp.icon}</Text>
            <Text style={[styles.heroName, { color: exp.accent === '#00b4d8' ? '#fff' : '#fff' }]}>{exp.name}</Text>
            <Text style={styles.heroSlogan}>"{exp.slogan}"</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Description */}
          <Text style={styles.description}>{exp.description}</Text>

          {/* Highlights */}
          <Text style={styles.sectionTitle}>Điểm nổi bật</Text>
          <View style={styles.highlightsRow}>
            {exp.highlights.map((h, i) => (
              <View key={i} style={[styles.highlightCard, { borderColor: exp.accent + '40' }]}>
                <View style={[styles.highlightIconBg, { backgroundColor: exp.accent + '20' }]}>
                  <Ionicons name={h.icon as any} size={24} color={exp.accent} />
                </View>
                <Text style={styles.highlightTitle}>{h.title}</Text>
                <Text style={styles.highlightDesc}>{h.desc}</Text>
              </View>
            ))}
          </View>

          {/* Note */}
          <View style={styles.noteBox}>
            <Ionicons name="information-circle-outline" size={18} color={exp.accent} />
            <Text style={styles.noteText}>
              Trải nghiệm {exp.name} có tại tất cả rạp CinemaX trên toàn quốc. Giá vé cao hơn vé thường.
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: exp.accent }]}
            onPress={() => navigation.navigate('QuickBook')}
          >
            <Ionicons name="ticket-outline" size={20} color="#fff" />
            <Text style={styles.bookBtnText}>🎟 ĐẶT VÉ NGAY</Text>
          </TouchableOpacity>

          {/* Other experiences */}
          <Text style={styles.sectionTitle}>Trải nghiệm khác</Text>
          {exp.others.map((other, i) => (
            <TouchableOpacity
              key={i}
              style={styles.otherCard}
              onPress={() => navigation.navigate('ExperienceDetail', { type: other.name.toLowerCase().replace(/\s+/g, '') })}
            >
              <Text style={styles.otherIcon}>{other.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.otherName}>{other.name}</Text>
                <Text style={styles.otherSlogan}>{other.slogan}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#555" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  floatingBack: {
    position: 'absolute', top: 50, left: 16, zIndex: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroContainer: { height: 380, position: 'relative', justifyContent: 'flex-end' },
  heroContent: { padding: Theme.spacing.lg, paddingBottom: Theme.spacing.xl, alignItems: 'flex-start' },
  badgeChip: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: Theme.radius.pill,
    borderWidth: 1, marginBottom: 12,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  heroIcon: { fontSize: 48, marginBottom: 8 },
  heroName: { fontSize: 36, fontWeight: '900', marginBottom: 6 },
  heroSlogan: { color: '#ccc', fontSize: 15, fontStyle: 'italic' },

  body: { padding: Theme.spacing.lg },
  description: { color: '#aaa', fontSize: 15, lineHeight: 24, marginBottom: Theme.spacing.xl },

  sectionTitle: { color: Theme.colors.warning, fontSize: 16, fontWeight: 'bold', marginBottom: 14 },

  highlightsRow: { flexDirection: 'row', gap: 10, marginBottom: Theme.spacing.xl },
  highlightCard: {
    flex: 1, backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 14, alignItems: 'center', gap: 8, borderWidth: 1,
  },
  highlightIconBg: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  highlightTitle: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  highlightDesc: { color: '#666', fontSize: 10, textAlign: 'center' },

  noteBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 14, marginBottom: Theme.spacing.xl,
    borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  noteText: { color: '#aaa', fontSize: 13, lineHeight: 20, flex: 1 },

  bookBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: Theme.radius.lg, paddingVertical: 16, marginBottom: Theme.spacing.xl,
  },
  bookBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  otherCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  otherIcon: { fontSize: 28 },
  otherName: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  otherSlogan: { color: '#888', fontSize: 12 },
});
