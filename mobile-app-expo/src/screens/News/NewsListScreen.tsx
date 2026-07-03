import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_NEWS = [
  {
    id: '1',
    title: 'Review Dune: Part Two - Đỉnh Cao Khoa Học Viễn Tưởng',
    summary: 'Phần 2 của siêu phẩm Dune mang đến trải nghiệm thị giác và âm thanh vô tiền khoáng hậu, vượt xa phần 1.',
    category: 'Góc Điện Ảnh',
    date: '12/07/2026',
    image: 'https://cdn.galaxycine.vn/media/2024/2/29/dune-2-3_1709192451034.jpg',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Lịch chiếu sớm Godzilla x Kong: Đế Chế Mới',
    summary: 'Siêu phẩm quái vật được mong đợi nhất năm nay sẽ có các suất chiếu đặc biệt từ ngày 28/03.',
    category: 'Khuyến Mãi',
    date: '10/07/2026',
    image: 'https://cdn.galaxycine.vn/media/2024/3/27/gxk-review-1_1711527878363.jpg',
    isFeatured: false,
  },
  {
    id: '3',
    title: '5 Lý Do Bạn Phải Xem Kung Fu Panda 4',
    summary: 'Po đã trở lại và lợi hại hơn xưa. Cùng khám phá những điểm thú vị trong phần phim mới nhất.',
    category: 'Tin Tức',
    date: '08/07/2026',
    image: 'https://cdn.galaxycine.vn/media/2024/3/6/kfp4-review-2_1709712130612.jpg',
    isFeatured: false,
  }
];

export const NewsListScreen = ({ navigation }: any) => {

  const renderFeatured = (item: typeof MOCK_NEWS[0]) => (
    <TouchableOpacity 
      style={styles.featuredCard}
      onPress={() => navigation.navigate('NewsDetail', { news: item })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.featuredImage} contentFit="cover" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.95)']} style={styles.featuredOverlay}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.featuredTitle}>{item.title}</Text>
        <Text style={styles.featuredSummary} numberOfLines={2}>{item.summary}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: typeof MOCK_NEWS[0] }) => {
    if (item.isFeatured) return renderFeatured(item);

    return (
      <TouchableOpacity 
        style={styles.newsCard}
        onPress={() => navigation.navigate('NewsDetail', { news: item })}
      >
        <Image source={{ uri: item.image }} style={styles.newsImage} contentFit="cover" />
        <View style={styles.newsInfo}>
          <View style={styles.newsMeta}>
            <Text style={styles.newsCategory}>{item.category}</Text>
            <Text style={styles.newsDate}>{item.date}</Text>
          </View>
          <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
          <View style={styles.readMoreRow}>
            <Text style={styles.readMoreText}>Đọc tiếp</Text>
            <Ionicons name="arrow-forward" size={14} color={Theme.colors.gold} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TIN TỨC MỚI NHẤT</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={MOCK_NEWS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
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
  listContent: {
    padding: Theme.spacing.md,
  },
  featuredCard: {
    height: 350,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    marginBottom: 24,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 60,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 30,
  },
  featuredSummary: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  newsImage: {
    width: 120,
    height: 140,
  },
  newsInfo: {
    flex: 1,
    padding: 12,
  },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  newsCategory: {
    color: Theme.colors.gold,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  newsDate: {
    color: '#666',
    fontSize: 10,
  },
  newsTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 20,
  },
  newsSummary: {
    color: '#888',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    gap: 4,
  },
  readMoreText: {
    color: Theme.colors.gold,
    fontSize: 12,
    fontWeight: '600',
  }
});
