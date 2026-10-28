import React from 'react';
import { Platform, StyleSheet, View, type ColorValue } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

function NativeLayout() {
  return <NativeTabs>
    <NativeTabs.Trigger name="index"><NativeTabs.Trigger.Icon sf={{ default: 'calendar', selected: 'calendar' }} /><NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="clients"><NativeTabs.Trigger.Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} /><NativeTabs.Trigger.Label>Clients</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="settings"><NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} /><NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label></NativeTabs.Trigger>
  </NativeTabs>;
}
function ClassicLayout() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';
  const icon = (sf: string, feather: React.ComponentProps<typeof Feather>['name']) =>
    ({ color }: { color: ColorValue }) => isIOS ? <SymbolView name={sf as any} tintColor={color} size={23} /> : <Feather name={feather} size={22} color={color} />;
  return <Tabs screenOptions={{
    headerShown: false, tabBarActiveTintColor: c.primary, tabBarInactiveTintColor: c.mutedForeground,
    tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 10 },
    tabBarStyle: { backgroundColor: isIOS ? 'transparent' : c.card, borderTopWidth: 1, borderTopColor: c.border, elevation: 0, height: isWeb ? 84 : 52 + insets.bottom, paddingBottom: isWeb ? 34 : insets.bottom },
    tabBarBackground: () => isIOS ? <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} /> : isWeb ? <View style={[StyleSheet.absoluteFill, { backgroundColor: c.card }]} /> : null,
  }}>
    <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: icon('calendar', 'calendar') }} />
    <Tabs.Screen name="clients" options={{ title: 'Clients', tabBarIcon: icon('person.2', 'users') }} />
    <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('gearshape', 'settings') }} />
  </Tabs>;
}
export default function TabLayout() {
  return Platform.OS === 'ios' && isLiquidGlassAvailable() ? <NativeLayout /> : <ClassicLayout />;
}