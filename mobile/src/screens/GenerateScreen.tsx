import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { generateOutfit } from '../api';
import { Outfit, Season } from '../types';
import { THEME, SEASONS, CLOTHING_TYPES, BASE_URL } from '../constants';

export default function GenerateScreen() {
  const { user } = useUser();
  const [season, setSeason] = useState<Season | ''>('');
  const [occasion, setOccasion] = useState('');
  const [loading, setLoading] = useState(false);
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    setOutfit(null);
    try {
      const result = await generateOutfit({
        user_id: user.id,
        season: season || null,
        occasion: occasion.trim() || null,
      });
      setOutfit(result);
    } catch (e: any) {
      setError(e.message || 'Не удалось создать аутфит. Убедись, что в гардеробе есть вещи.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>✨ Создать аутфит</Text>
      <Text style={styles.subheading}>ИИ подберёт образ из твоего гардероба</Text>

      <Text style={styles.label}>Сезон</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <TouchableOpacity
          style={[styles.chip, season === '' && styles.chipActive]}
          onPress={() => setSeason('')}
        >
          <Text style={[styles.chipText, season === '' && styles.chipTextActive]}>🌍 Любой</Text>
        </TouchableOpacity>
        {SEASONS.map(s => (
          <TouchableOpacity
            key={s.value}
            style={[styles.chip, season === s.value && styles.chipActive]}
            onPress={() => setSeason(s.value as Season)}
          >
            <Text style={[styles.chipText, season === s.value && styles.chipTextActive]}>
              {s.emoji} {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Повод</Text>
      <TextInput
        style={styles.input}
        placeholder="Работа, свидание, прогулка..."
        placeholderTextColor={THEME.muted}
        value={occasion}
        onChangeText={setOccasion}
      />

      <TouchableOpacity
        style={[styles.generateBtn, loading && styles.btnDisabled]}
        onPress={generate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.generateBtnText}>🎨 Создать аутфит</Text>
        )}
      </TouchableOpacity>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {outfit && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.outfitBadge}>Готово!</Text>
          </View>
          <Text style={styles.outfitName}>{outfit.name}</Text>
          <Text style={styles.outfitComment}>{outfit.ai_comment}</Text>

          <View style={styles.itemsGrid}>
            {outfit.items.map(outfitItem => {
              const clothes = outfitItem.clothes;
              if (!clothes) return null;
              const typeInfo = CLOTHING_TYPES.find(t => t.value === clothes.clothing_type);
              return (
                <View key={outfitItem.clothes_id} style={styles.outfitItem}>
                  <Image
                    source={{ uri: `${BASE_URL}/${clothes.image_path}` }}
                    style={styles.outfitImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.outfitItemEmoji}>{typeInfo?.emoji}</Text>
                  <Text style={styles.outfitItemName} numberOfLines={1}>
                    {clothes.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  content: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 26, fontWeight: '700', color: THEME.text, marginBottom: 4 },
  subheading: { fontSize: 14, color: THEME.subtext, marginBottom: 24 },
  label: { fontSize: 13, color: THEME.subtext, marginBottom: 8, marginTop: 12 },
  chipsRow: { gap: 8, paddingBottom: 4 },
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
  input: {
    backgroundColor: THEME.inputBg,
    borderRadius: 12,
    padding: 14,
    color: THEME.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  generateBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDisabled: { opacity: 0.6 },
  generateBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  error: { color: THEME.danger, fontSize: 13, marginTop: 16, textAlign: 'center', lineHeight: 20 },
  resultCard: {
    marginTop: 28,
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  resultHeader: { flexDirection: 'row', marginBottom: 8 },
  outfitBadge: {
    backgroundColor: THEME.primary,
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  outfitName: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
    marginTop: 4,
  },
  outfitComment: {
    fontSize: 14,
    color: THEME.subtext,
    marginBottom: 20,
    lineHeight: 21,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  outfitItem: { width: '30%', alignItems: 'center' },
  outfitImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 10,
    backgroundColor: THEME.inputBg,
  },
  outfitItemEmoji: { fontSize: 16, marginTop: 6 },
  outfitItemName: {
    fontSize: 11,
    color: THEME.subtext,
    textAlign: 'center',
    marginTop: 2,
  },
});
