import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const NewsDetailScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { news } = route.params || { news: {
    id: '1', title: 'Review Dune: Part Two - Đỉnh Cao Khoa Học Viễn Tưởng', 
    summary: 'Phần 2 của siêu phẩm Dune mang đến trải nghiệm thị giác và âm thanh vô tiền khoáng hậu, vượt xa phần 1.', 
    category: 'Góc Điện Ảnh', date: '12/07/2026', 
    image: 'https://cdn.galaxycine.vn/media/2024/2/29/dune-2-3_1709192451034.jpg'
  }};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: 90 + insets.bottom }}>
        {/* Hero Image */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: news.image }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient colors={['transparent', Theme.colors.background]} style={styles.heroOverlay} />
          
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <View style={styles.backBtnBg}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{news.category}</Text>
          </View>
          
          <Text style={styles.title}>{news.title}</Text>
          
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color="#888" />
            <Text style={styles.metaText}>{news.date}</Text>
            <View style={styles.metaDot} />
            <Ionicons name="time-outline" size={14} color="#888" />
            <Text style={styles.metaText}>5 phút đọc</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.htmlContent}>
            <Text style={styles.summary}>{news.summary}</Text>
            
            <Text style={styles.paragraph}>
              Dune: Part Two không chỉ là một bộ phim, nó là một trải nghiệm điện ảnh đích thực. Đạo diễn Denis Villeneuve đã thành công trong việc chuyển thể cuốn tiểu thuyết đồ sộ của Frank Herbert lên màn ảnh rộng với một quy mô hoành tráng chưa từng có.
            </Text>
            
            <Image source={{ uri: 'https://cdn.galaxycine.vn/media/2024/2/29/dune-2-4_1709192455589.jpg' }} style={styles.inlineImage} contentFit="cover" />
            <Text style={styles.imageCaption}>Hình ảnh sa mạc Arrakis hiện lên vô cùng hùng vĩ.</Text>

            <Text style={styles.paragraph}>
              Âm nhạc của Hans Zimmer một lần nữa chứng minh ông là bậc thầy trong việc tạo ra không khí hùng tráng, dồn dập và đầy ám ảnh. Từng nhịp trống, từng tiếng sáo đều hòa quyện hoàn hảo với hình ảnh những con giun cát khổng lồ.
            </Text>

            <Text style={styles.paragraph}>
              Diễn xuất của Timothée Chalamet trong vai Paul Atreides đã có sự trưởng thành vượt bậc, thể hiện rõ sự giằng xé nội tâm của một vị cứu tinh bất đắc dĩ.
            </Text>
          </View>
        </View>

        {/* Related News (Static placeholder) */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Bài viết liên quan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedList}>
            <TouchableOpacity style={styles.relatedCard}>
              <Image source={{ uri: 'https://cdn.galaxycine.vn/media/2024/3/27/gxk-review-1_1711527878363.jpg' }} style={styles.relatedImage} />
              <Text style={styles.relatedTitle} numberOfLines={2}>Lịch chiếu sớm Godzilla x Kong</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.relatedCard}>
              <Image source={{ uri: 'https://cdn.galaxycine.vn/media/2024/3/6/kfp4-review-2_1709712130612.jpg' }} style={styles.relatedImage} />
              <Text style={styles.relatedTitle} numberOfLines={2}>5 Lý Do Bạn Phải Xem Kung Fu Panda 4</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View style={[styles.stickyBottom, { paddingBottom: insets.bottom + Theme.spacing.lg }]}>
        <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('MainTabs')}>
          <Ionicons name="ticket" size={20} color="#000" style={{ marginRight: 8 }} />
          <Text style={styles.bookBtnText}>Đặt vé xem phim ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  heroWrapper: {
    position: 'relative',
    height: 250,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 16,
  },
  backBtnBg: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Theme.spacing.lg,
    paddingTop: 10,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.accent,
  },
  categoryText: {
    color: Theme.colors.accent,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 34,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metaText: {
    color: '#888',
    fontSize: 13,
    marginLeft: 6,
    marginRight: 16,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555',
    marginRight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginBottom: 24,
  },
  htmlContent: {
    marginBottom: 30,
  },
  summary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  paragraph: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 26,
    marginBottom: 20,
  },
  inlineImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageCaption: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  relatedSection: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
    backgroundColor: '#111',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  relatedList: {
    gap: 16,
  },
  relatedCard: {
    width: 160,
  },
  relatedImage: {
    width: 160,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  bookBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.gold,
    paddingVertical: 14,
    borderRadius: Theme.radius.btn,
  },
  bookBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
