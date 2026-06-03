import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createUser } from '../api';
import { User } from '../types';
import { THEME } from '../constants';

interface Props {
  onLogin: (user: User) => void;
}

export default function AuthScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Заполни все поля');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await createUser({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      onLogin(user);
    } catch (e: any) {
      setError(e.message || 'Ошибка создания аккаунта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>👗</Text>
          <Text style={styles.title}>Smart Wardrobe</Text>
          <Text style={styles.subtitle}>Цифровой гардероб с ИИ-стилистом</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Создать аккаунт</Text>

          <Text style={styles.label}>Имя пользователя</Text>
          <TextInput
            style={styles.input}
            placeholder="username"
            placeholderTextColor={THEME.muted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={THEME.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Пароль</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={THEME.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Войти →</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 72, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: THEME.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: THEME.subtext, textAlign: 'center' },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  cardTitle: { fontSize: 20, fontWeight: '600', color: THEME.text, marginBottom: 4 },
  label: { fontSize: 13, color: THEME.subtext, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: THEME.inputBg,
    borderRadius: 12,
    padding: 14,
    color: THEME.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  error: { color: THEME.danger, fontSize: 13, marginTop: 12, textAlign: 'center' },
  btn: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 22,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
