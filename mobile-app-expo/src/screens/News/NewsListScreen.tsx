import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';

import { AppService } from '../../services/AppService';

export const NewsListScreen = ({ navigation }: any) => {
  const [news, setNews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await AppService.getNews();
      if (res.success && res.data) {
        setNews(res.data.map((x: any) => ({
          id: x.id?.toString(),
          title: x.title,
          summary: x.summary,
          category: x.category || 'Tin tức',
          date: x.date,
          image: x.imageUrl,
          isFeatured: x.isFeatured
        })));
      }
    } catch (e) {
      console.log('Error fetching news', e);
    } finally {
      setLoading(false);
    }
  };
  const renderFeatured = (item: any) => (
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

  const renderItem = ({ item }: { item: any }) => {
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

      {loading ? (
        <Text style={{color: '#fff', textAlign: 'center', marginTop: 20}}>Đang tải danh sách tin tức...</Text>
      ) : (
        <FlatList
          data={news}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
        />
      )}
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
    borderBottomColor: Theme.colors.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
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
    color: Theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  featuredTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 30,
  },
  featuredSummary: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
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
    color: Theme.colors.textMuted,
    fontSize: 10,
  },
  newsTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 20,
  },
  newsSummary: {
    color: Theme.colors.textSecondary,
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
