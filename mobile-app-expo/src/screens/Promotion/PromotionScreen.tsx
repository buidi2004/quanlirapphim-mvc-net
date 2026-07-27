import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ToastAndroid, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';
import * as Clipboard from 'expo-clipboard';

import { AppService } from '../../services/AppService';

export const PromotionScreen = ({ navigation }: any) => {
  const [promos, setPromos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const res = await AppService.getPromotions();
      if (res.success && res.data) {
        setPromos(res.data.map((x: any) => ({
          id: x.id?.toString(),
          code: x.code || 'CODE',
          title: x.name || x.title,
          discount: x.discountAmount ? `${x.discountAmount}k` : 'Sale',
          expiry: x.endDate || 'N/A',
          remaining: 99,
          image: x.imageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800'
        })));
      }
    } catch (e) {
      console.log('Error fetching promos', e);
    } finally {
      setLoading(false);
    }
  };
  const copyPromoCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    if (Platform.OS === 'android') {
      ToastAndroid.show(`Đã copy mã: ${code}`, ToastAndroid.SHORT);
    } else {
      // In a real app, use a custom Toast component for iOS
      alert(`Đã copy mã: ${code}`);
    }
  };

  const renderPromoCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('PromotionDetail', { promo: item })}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>{item.discount}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        
        <View style={styles.codeRow}>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{item.code}</Text>
          </View>
          <TouchableOpacity 
            style={styles.copyBtn}
            onPress={() => copyPromoCode(item.code)}
          >
            <Ionicons name="copy-outline" size={16} color={Theme.colors.textPrimary} />
            <Text style={styles.copyText}>Copy</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#888" />
            <Text style={styles.metaText}>HSD: {item.expiry}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color="#888" />
            <Text style={styles.metaText}>Còn {item.remaining} lượt</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ƯU ĐÃI & KHUYẾN MÃI</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>Đừng bỏ lỡ deal hot nhất! 🎫</Text>
      </View>

      {loading ? (
        <Text style={{color: '#fff', textAlign: 'center', marginTop: 20}}>Đang tải danh sách khuyến mãi...</Text>
      ) : (
        <FlatList
          data={promos}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderPromoCard}
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
  subHeader: {
    padding: Theme.spacing.md,
    backgroundColor: 'rgba(111, 66, 193, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
  },
  subHeaderText: {
    color: Theme.colors.gold,
    textAlign: 'center',
    fontWeight: '600',
  },
  listContent: {
    padding: Theme.spacing.md,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  imageWrapper: {
    position: 'relative',
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ribbon: {
    position: 'absolute',
    top: 10,
    right: -25,
    backgroundColor: '#e50914',
    paddingVertical: 4,
    paddingHorizontal: 30,
    transform: [{ rotate: '45deg' }],
  },
  ribbonText: {
    color: Theme.colors.textPrimary,
    fontWeight: '900',
    fontSize: 12,
  },
  cardBody: {
    padding: 16,
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: Theme.colors.surface,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    borderStyle: 'dashed',
  },
  codeBox: {
    flex: 1,
  },
  codeText: {
    color: Theme.colors.gold,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  copyText: {
    color: Theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
  }
});
