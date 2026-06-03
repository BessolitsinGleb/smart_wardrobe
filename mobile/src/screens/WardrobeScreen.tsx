import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { fetchClothes, deleteClothes } from '../api';
import { Clothes, Season } from '../types';
import { THEME, SEASONS } from '../constants';
import ClothingCard from '../components/ClothingCard';
import AddClothesModal from '../components/AddClothesModal';

function plural(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return 'вещь';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'вещи';
  return 'вещей';
}

export default function WardrobeScreen() {
  const { user } = useUser();
  const [clothes, setClothes] = useState<Clothes[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seasonFilter, setSeasonFilter] = useState<Season | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchClothes(user.id);
      setClothes(data);
    } catch {
      // ignore network errors silently
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

  const handleDelete = (item: Clothes) => {
    Alert.alert('Удалить вещь?', `«${item.name}» будет удалена из гардероба.`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteClothes(item.id, user.id);
            setClothes(prev => prev.filter(c => c.id !== item.id));
          } catch {
            Alert.alert('Ошибка', 'Не удалось удалить вещь');
          }
        },
      },
    ]);
  };

  const filtered = seasonFilter
    ? clothes.filter(c => c.season === seasonFilter || c.season === 'all_season')
    : clothes;

  return (
    <View style={styles.container}>
      {/* Season filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity
          style={[styles.chip, !seasonFilter && styles.chipActive]}
          onPress={() => setSeasonFilter(null)}
        >
          <Text style={[styles.chipText, !seasonFilter && styles.chipTextActive]}>🌍 Все</Text>
        </TouchableOpacity>
        {SEASONS.map(s => (
          <TouchableOpacity
            key={s.value}
            style={[styles.chip, seasonFilter === s.value && styles.chipActive]}
            onPress={() =>
              setSeasonFilter(prev => (prev === s.value ? null : (s.value as Season)))
            }
          >
            <Text style={[styles.chipText, seasonFilter === s.value && styles.chipTextActive]}>
              {s.emoji} {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.count}>
        {filtered.length} {plural(filtered.length)}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.primary}
          />
        }
        renderItem={({ item }) => (
          <ClothingCard item={item} onDelete={handleDelete} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>👗</Text>
              <Text style={styles.emptyTitle}>Гардероб пуст</Text>
              <Text style={styles.emptySub}>Нажми + чтобы добавить первую вещь</Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddClothesModal
        visible={showAddModal}
        userId={user.id}
        onClose={() => setShowAddModal(false)}
        onAdded={item => {
          setClothes(prev => [item, ...prev]);
          setShowAddModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  filterRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  chipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  chipText: { color: THEME.subtext, fontSize: 13 },
  chipTextActive: { color: '#fff' },
  count: { fontSize: 12, color: THEME.muted, paddingHorizontal: 16, marginBottom: 4 },
  list: { paddingHorizontal: 7, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 72, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: THEME.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: THEME.subtext },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  fabIcon: { color: '#fff', fontSize: 30, lineHeight: 34 },
});
