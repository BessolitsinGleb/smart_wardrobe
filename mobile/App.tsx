import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text, View } from 'react-native';

import { UserProvider } from './src/context/UserContext';
import AuthScreen from './src/screens/AuthScreen';
import WardrobeScreen from './src/screens/WardrobeScreen';
import GenerateScreen from './src/screens/GenerateScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { User } from './src/types';
import { getUser } from './src/api';
import { THEME } from './src/constants';

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      const savedId = await AsyncStorage.getItem('sw_user_id');
      if (savedId) {
        try {
          const u = await getUser(parseInt(savedId, 10));
          setUser(u);
        } catch {
          await AsyncStorage.removeItem('sw_user_id');
        }
      }
      setBooting(false);
    })();
  }, []);

  const handleLogin = async (u: User) => {
    await AsyncStorage.setItem('sw_user_id', String(u.id));
    setUser(u);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('sw_user_id');
    setUser(null);
  };

  if (booting) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: THEME.bg }} />
      </SafeAreaProvider>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthScreen onLogin={handleLogin} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <UserProvider value={{ user, onLogout: handleLogout }}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarStyle: {
                backgroundColor: THEME.card,
                borderTopColor: THEME.cardBorder,
                height: 62,
                paddingBottom: 8,
              },
              tabBarActiveTintColor: THEME.primary,
              tabBarInactiveTintColor: THEME.muted,
              headerStyle: { backgroundColor: THEME.card },
              headerTintColor: THEME.text,
              headerShadowVisible: false,
            }}
          >
            <Tab.Screen
              name="Wardrobe"
              component={WardrobeScreen}
              options={{
                tabBarLabel: 'Гардероб',
                tabBarIcon: ({ color }) => (
                  <Text style={{ fontSize: 22, color }}>👗</Text>
                ),
                headerTitle: () => (
                  <View>
                    <Text style={{ color: THEME.text, fontWeight: '700', fontSize: 17 }}>
                      Гардероб
                    </Text>
                    <Text style={{ color: THEME.muted, fontSize: 11 }}>
                      @{user.username}
                    </Text>
                  </View>
                ),
                headerRight: () => (
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={{ marginRight: 16, paddingVertical: 4, paddingHorizontal: 8 }}
                  >
                    <Text style={{ color: THEME.subtext, fontSize: 14 }}>Выйти</Text>
                  </TouchableOpacity>
                ),
              }}
            />
            <Tab.Screen
              name="Generate"
              component={GenerateScreen}
              options={{
                title: 'Аутфит',
                tabBarLabel: 'Аутфит',
                tabBarIcon: ({ color }) => (
                  <Text style={{ fontSize: 22, color }}>✨</Text>
                ),
              }}
            />
            <Tab.Screen
              name="History"
              component={HistoryScreen}
              options={{
                title: 'История',
                tabBarLabel: 'История',
                tabBarIcon: ({ color }) => (
                  <Text style={{ fontSize: 22, color }}>📋</Text>
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}
