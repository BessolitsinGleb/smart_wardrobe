import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadClothes } from '../api';
import { Clothes, ClothingType, Season } from '../types';
import { THEME, CLOTHING_TYPES, SEASONS } from '../constants';

interface Props {
  visible: boolean;
  userId: number;
  onClose: () => void;
  onAdded: (item: Clothes) => void;
}

const freshForm = () => ({
  name: '',
  clothing_type: 'tshirt' as ClothingType,
  season: 'all_season' as Season,
  color: '',
  brand: '',
  comment: '',
  rating: 5,
  imageUri: null as string | null,
});

export default function AddClothesModal({ visible, userId, onClose, onAdded }: Props) {
  const [form, setForm] = useState(freshForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setForm(freshForm());
    setError('');
    onClose();
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа', 'Разреши доступ к фото в настройках');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled) {
      setForm(f => ({ ...f, imageUri: result.assets[0].uri }));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа', 'Разреши доступ к камере в настройках');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled) {
      setForm(f => ({ ...f, imageUri: result.assets[0].uri }));
    }
  };

  const handleSubmit = async () => {
    if (!form.imageUri) { setError('Выбери фото'); return; }
    if (!form.name.trim()) { setError('Введи название'); return; }
    setLoading(true);
    setError('');
    try {
      const item = await uploadClothes(userId, {
        name: form.name.trim(),
        clothing_type: form.clothing_type,
        season: form.season,
        color: form.color || undefined,
        brand: form.brand || undefined,
        comment: form.comment || undefined,
        rating: form.rating,
        imageUri: form.imageUri,
      });
      onAdded(item);
      setForm(freshForm());
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
            <Text style={styles.cancelText}>Отмена</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Добавить вещь</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.headerBtn}>
            {loading ? (
              <ActivityIndicator size="small" color={THEME.primary} />
            ) : (
              <Text style={styles.saveText}>Сохранить</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Image section */}
          <TouchableOpacity style={styles.imagePlaceholder} onPress={pickFromGallery}>
            {form.imageUri ? (
              <Image source={{ uri: form.imageUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholderInner}>
                <Text style={styles.placeholderIcon}>📷</Text>
                <Text style={styles.placeholderText}>Нажми, чтобы выбрать фото</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto}>
            <Text style={styles.cameraBtnText}>📸 Сделать фото камерой</Text>
          </TouchableOpacity>

          {/* Name */}
          <Text style={styles.label}>Название *</Text>
          <TextInput
            style={styles.input}
            placeholder="Например: Белые Nike AF1"
            placeholderTextColor={THEME.muted}
            value={form.name}
            onChangeText={v => setForm(f => ({ ...f, name: v }))}
          />

          {/* Clothing type */}
          <Text style={styles.label}>Тип одежды</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {CLOTHING_TYPES.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[styles.chip, form.clothing_type === t.value && styles.chipActive]}
                onPress={() => setForm(f => ({ ...f, clothing_type: t.value }))}
              >
                <Text style={[styles.chipText, form.clothing_type === t.value && styles.chipTextActive]}>
                  {t.emoji} {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Season */}
          <Text style={styles.label}>Сезон</Text>
          <View style={styles.seasonGrid}>
            {SEASONS.map(s => (
              <TouchableOpacity
                key={s.value}
                style={[styles.seasonChip, form.season === s.value && styles.chipActive]}
                onPress={() => setForm(f => ({ ...f, season: s.value }))}
              >
                <Text style={styles.seasonEmoji}>{s.emoji}</Text>
                <Text style={[styles.seasonLabel, form.season === s.value && styles.chipTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating */}
          <Text style={styles.label}>Рейтинг: {form.rating} / 10</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.ratingBtn, form.rating === n && styles.ratingBtnActive]}
                onPress={() => setForm(f => ({ ...f, rating: n }))}
              >
                <Text style={[styles.ratingBtnText, form.rating === n && styles.ratingBtnTextActive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Optional fields */}
          <Text style={styles.label}>Цвет</Text>
          <TextInput
            style={styles.input}
            placeholder="Белый, чёрный, синий..."
            placeholderTextColor={THEME.muted}
            value={form.color}
            onChangeText={v => setForm(f => ({ ...f, color: v }))}
          />

          <Text style={styles.label}>Бренд</Text>
          <TextInput
            style={styles.input}
            placeholder="Nike, Zara, H&M..."
            placeholderTextColor={THEME.muted}
            value={form.brand}
            onChangeText={v => setForm(f => ({ ...f, brand: v }))}
          />

          <Text style={styles.label}>Заметка</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Личная заметка..."
            placeholderTextColor={THEME.muted}
            value={form.comment}
            onChangeText={v => setForm(f => ({ ...f, comment: v }))}
            multiline
            numberOfLines={3}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Добавить в гардероб</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.cardBorder,
    backgroundColor: THEME.card,
  },
  headerBtn: { minWidth: 72, alignItems: 'center' },
  cancelText: { color: THEME.subtext, fontSize: 16 },
  title: { fontSize: 17, fontWeight: '700', color: THEME.text },
  saveText: { color: THEME.primary, fontSize: 16, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 48 },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    maxHeight: 260,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: THEME.card,
    borderWidth: 2,
    borderColor: THEME.cardBorder,
    borderStyle: 'dashed',
    marginBottom: 10,
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholderInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 44, marginBottom: 10 },
  placeholderText: { color: THEME.muted, fontSize: 14 },
  cameraBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    marginBottom: 4,
  },
  cameraBtnText: { color: THEME.subtext, fontSize: 14 },
  label: { fontSize: 13, color: THEME.subtext, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: THEME.inputBg,
    borderRadius: 12,
    padding: 14,
    color: THEME.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
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
  seasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seasonChip: {
    flex: 1,
    minWidth: 56,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  seasonEmoji: { fontSize: 20, marginBottom: 2 },
  seasonLabel: { color: THEME.subtext, fontSize: 10 },
  ratingRow: { flexDirection: 'row', gap: 5 },
  ratingBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    alignItems: 'center',
  },
  ratingBtnActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  ratingBtnText: { color: THEME.subtext, fontSize: 12 },
  ratingBtnTextActive: { color: '#fff', fontWeight: '700' },
  error: { color: THEME.danger, fontSize: 13, marginTop: 14, textAlign: 'center' },
  submitBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
