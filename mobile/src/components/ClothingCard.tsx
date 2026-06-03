import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Clothes } from '../types';
import { THEME, CLOTHING_TYPES, SEASONS, BASE_URL } from '../constants';

interface Props {
  item: Clothes;
  onDelete: (item: Clothes) => void;
}

function ratingColor(r: number) {
  if (r >= 8) return THEME.success;
  if (r >= 5) return THEME.warning;
  return THEME.danger;
}

export default function ClothingCard({ item, onDelete }: Props) {
  const typeInfo = CLOTHING_TYPES.find(t => t.value === item.clothing_type);
  const seasonInfo = SEASONS.find(s => s.value === item.season);

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: `${BASE_URL}/${item.image_path}` }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.type}>{typeInfo?.emoji} {typeInfo?.label}</Text>
        <View style={styles.footer}>
          <Text style={styles.season}>{seasonInfo?.emoji}</Text>
          <View style={[styles.ratingBadge, { backgroundColor: ratingColor(item.rating) }]}>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item)}>
        <Text style={styles.deleteIcon}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: THEME.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: THEME.inputBg,
  },
  info: { padding: 10 },
  name: { fontSize: 13, fontWeight: '600', color: THEME.text, marginBottom: 2 },
  type: { fontSize: 11, color: THEME.subtext, marginBottom: 6 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  season: { fontSize: 16 },
  ratingBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ratingText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: { color: '#fff', fontSize: 18, lineHeight: 22 },
});
