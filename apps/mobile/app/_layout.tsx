import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeColors, useThemeMode } from '../lib/theme';

export default function RootLayout() {
  const mode = useThemeMode();
  const c = useThemeColors();
  return (
    <SafeAreaProvider>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.canvas },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="brainworker/register" />
        <Stack.Screen name="brainworker/workspace-preview" />
        <Stack.Screen name="services/[id]" />
        <Stack.Screen name="book" />
        <Stack.Screen name="post-job" />
      </Stack>
    </SafeAreaProvider>
  );
}
