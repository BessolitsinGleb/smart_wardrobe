import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { fetchOutfits, deleteOutfit } from '../api';
import { Outfit } from '../types';
import { THEME, CLOTHING_TYPES, SEASONS, BASE_URL } from '../constants';

export default function HistoryScreen() {
  const { user } = useUser();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchOutfits(user.id);
      setOutfits(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleDelete = (outfit: Outfit) => {
    Alert.alert('Удалить аутфит?', `«${outfit.name}»`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteOutfit(outfit.id, user.id);
            setOutfits(prev => prev.filter(o => o.id !== outfit.id));
          } catch {
            Alert.alert('Ошибка', 'Не удалось удалить аутфит');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Outfit }) => {
    const seasonInfo = SEASONS.find(s => s.value === item.season);
    const date = new Date(item.created_at).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.outfitName}>{item.name}</Text>
            <Text style={styles.meta}>
              {seasonInfo?.emoji} {seasonInfo?.label} · {date}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.comment} numberOfLines={2}>
          {item.ai_comment}
        </Text>

        <View style={styles.itemsRow}>
          {item.items.map(outfitItem => {
            const clothes = outfitItem.clothes;
            if (!clothes) return null;
            const typeInfo = CLOTHING_TYPES.find(t => t.value === clothes.clothing_type);
            return (
              <View key={outfitItem.clothes_id} style={styles.thumb}>
                <Image
                  source={{ uri: `${BASE_URL}/${clothes.image_path}` }}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
                <Text style={styles.thumbEmoji}>{typeInfo?.emoji}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={outfits}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.primary}
          />
        }
        renderItem={renderItem}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎨</Text>
              <Text style={styles.emptyTitle}>История пуста</Text>
              <Text style={styles.emptySub}>Создай первый аутфит во вкладке «Аутфит»</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  list: { padding: 12, paddingBottom: 48 },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: { flex: 1, marginRight: 8 },
  outfitName: { fontSize: 16, fontWeight: '700', color: THEME.text },
  meta: { fontSize: 12, color: THEME.muted, marginTop: 3 },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 18 },
  comment: {
    fontSize: 13,
    color: THEME.subtext,
    marginBottom: 14,
    lineHeight: 19,
  },
  itemsRow: { flexDirection: 'row', gap: 8 },
  thumb: { alignItems: 'center' },
  thumbImage: {
    width: 64,
    height: 80,
    borderRadius: 8,
    backgroundColor: THEME.inputBg,
  },
  thumbEmoji: { fontSize: 14, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 72, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: THEME.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: THEME.subtext, textAlign: 'center' },
});
