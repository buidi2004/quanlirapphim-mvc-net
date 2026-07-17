import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Theme } from '../../theme/tokens';
import { MovieService } from '../../services/MovieService';
import { Movie } from '../../models/Movie';
import { IMAGE_BASE_URL } from '../../api/apiClient';

const GENRES = ['Tất cả', 'Hành động', 'Hài hước', 'Tình cảm', 'Kinh dị', 'Khoa học viễn tưởng'];

export const SearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('Tất cả');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = async (query: string, genre: string) => {
    try {
      setLoading(true);
      const genreParam = genre === 'Tất cả' ? undefined : genre;
      const res = await MovieService.getMovies('now_showing', 1, genreParam);
      
      let filtered = res.data || [];
      if (query.trim()) {
        filtered = filtered.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
      }
      setResults(filtered);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
    
    const timeout = setTimeout(() => {
      fetchResults(searchQuery, activeGenre);
    }, 300);
    
    setTypingTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [searchQuery, activeGenre]);

  const renderMovieCard = useCallback(({ item }: { item: Movie }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
    >
      <Image 
        source={{ uri: item.posterUrl?.startsWith('http') ? item.posterUrl : `${IMAGE_BASE_URL}${item.posterUrl}` }} 
        style={styles.poster}
        contentFit="cover"
      />
      <View style={styles.badgeAge}>
        <Text style={styles.badgeAgeText}>C18</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.genre} numberOfLines={1}>{item.genre}</Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên phim..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Genre Filter */}
      <View style={styles.genreWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={GENRES}
          keyExtractor={item => item}
          contentContainerStyle={styles.genreList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.genreChip, activeGenre === item && styles.genreChipActive]}
              onPress={() => setActiveGenre(item)}
            >
              <Text style={[styles.genreChipText, activeGenre === item && styles.genreChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results */}
      {loading && results.length === 0 ? (
        <View style={styles.centerContainer}><Text style={styles.loadingText}>Đang tìm kiếm...</Text></View>
      ) : (!searchQuery && activeGenre === 'Tất cả') ? (
        <View style={styles.centerContainer}>
          <Ionicons name="film-outline" size={60} color="#444" />
          <Text style={styles.emptyText}>Nhập từ khóa để tìm phim...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="sad-outline" size={60} color="#444" />
          <Text style={styles.emptyText}>Không tìm thấy phim nào</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => {setSearchQuery(''); setActiveGenre('Tất cả');}}>
            <Text style={styles.retryBtnText}>Xem tất cả phim</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          renderItem={renderMovieCard}
          ListHeaderComponent={
            <Text style={styles.resultCount}>Kết quả: {results.length} phim</Text>
          }
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
  searchHeader: {
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    color: Theme.colors.textPrimary,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  genreWrapper: {
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
  },
  genreList: {
    paddingHorizontal: Theme.spacing.md,
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  genreChipActive: {
    backgroundColor: 'rgba(111, 66, 193, 0.1)',
    borderColor: Theme.colors.gold,
  },
  genreChipText: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
  },
  genreChipTextActive: {
    color: Theme.colors.gold,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: Theme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  loadingText: {
    color: Theme.colors.gold,
  },
  retryBtn: {
    backgroundColor: Theme.colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#000',
    fontWeight: 'bold',
  },
  gridContent: {
    padding: Theme.spacing.md,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  resultCount: {
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
    fontSize: 14,
  },
  card: {
    width: '48%',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.card,
    overflow: 'hidden',
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: 220,
  },
  badgeAge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e50914',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeAgeText: {
    color: Theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  info: {
    padding: 8,
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  genre: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
  },
});
