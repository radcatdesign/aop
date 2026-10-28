import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export const FONT = { regular: 'Inter_400Regular', medium: 'Inter_500Medium', semi: 'Inter_600SemiBold', bold: 'Inter_700Bold' };
export function Label({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const c = useColors();
  return <View style={style}><Text style={[styles.eyebrow, { color: c.mutedForeground }]}>{children}</Text></View>;
}
export function DemoBanner() {
  const c = useColors();
  return <View style={[styles.banner, { backgroundColor: c.amberBg, borderColor: c.amber }]}>
    <Feather name="info" size={14} color={c.amber} />
    <Text style={[styles.bannerText, { color: c.amber }]}>SAMPLE ONLY · Fictional records · Changes stay on this device in this session</Text>
  </View>;
}
export function Page({ title, eyebrow, subtitle, children, back = false, scroll = true }: { title: string; eyebrow?: string; subtitle?: string; children: React.ReactNode; back?: boolean; scroll?: boolean }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const top = Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top;
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;
  const contents = <>
    <View style={[styles.top, { paddingTop: top + 15, backgroundColor: c.card, borderBottomColor: c.border }]}>
      <View style={styles.topRow}>
        {back ? <Pressable testID="back" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Feather name="arrow-left" size={22} color={c.primary} /></Pressable> : <View style={[styles.mark, { backgroundColor: c.primary }]}><Feather name="aperture" size={19} color={c.primaryForeground} /></View>}
        <View style={{ flex: 1 }}><Text style={[styles.brand, { color: c.foreground }]}>Art of Palpation</Text><Text style={[styles.brandSub, { color: c.mutedForeground }]}>FIELD COMPANION · DEMO</Text></View>
        <View style={[styles.dot, { backgroundColor: c.pineSoft }]} />
      </View>
      <DemoBanner />
    </View>
    <View style={styles.heading}>
      {!!eyebrow && <Label>{eyebrow}</Label>}
      <Text style={[styles.title, { color: c.foreground }]}>{title}<Text style={{ color: c.pineSoft }}>.</Text></Text>
      {!!subtitle && <Text style={[styles.subtitle, { color: c.mutedForeground }]}>{subtitle}</Text>}
    </View>
    {children}
  </>;
  if (!scroll) return <View style={[styles.page, { backgroundColor: c.background }]}>{contents}</View>;
  return <KeyboardAwareScrollViewCompat style={[styles.page, { backgroundColor: c.background }]} bottomOffset={20} contentContainerStyle={{ paddingBottom: bottom + 28 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentInsetAdjustmentBehavior="automatic">{contents}</KeyboardAwareScrollViewCompat>;
}
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const c = useColors();
  return <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, borderRadius: c.radius + 4 }, style]}>{children}</View>;
}
export function Action({ text, onPress, icon = 'arrow-right', primary = false, disabled = false, danger = false, testID }: { text: string; onPress: () => void; icon?: React.ComponentProps<typeof Feather>['name']; primary?: boolean; disabled?: boolean; danger?: boolean; testID?: string }) {
  const c = useColors();
  const color = primary ? c.primaryForeground : danger ? c.destructive : c.primary;
  return <Pressable testID={testID} accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, { backgroundColor: primary ? c.primary : c.card, borderColor: primary ? c.primary : c.border, opacity: disabled ? .45 : pressed ? .72 : 1, borderRadius: c.radius - 2 }]}>
    <Text style={[styles.actionText, { color }]}>{text}</Text><Feather name={icon} size={17} color={color} />
  </Pressable>;
}
export function Avatar({ name, color, large = false }: { name: string; color: string; large?: boolean }) {
  return <View style={[styles.avatar, { width: large ? 52 : 42, height: large ? 52 : 42, backgroundColor: color + '1F' }]}><Text style={[styles.avatarText, { color, fontSize: large ? 17 : 12 }]}>{name.split(' ').map(s => s[0]).slice(0, 2).join('')}</Text></View>;
}
export function StatusChip({ status }: { status: string }) {
  const c = useColors();
  const done = status === 'Completed' || status === 'Checked in';
  return <View style={[styles.chip, { backgroundColor: done ? c.secondary : status === 'Cancelled' ? c.roseBg : c.muted }]}><Text style={[styles.chipText, { color: done ? c.primary : status === 'Cancelled' ? c.destructive : c.mutedForeground }]}>{status}</Text></View>;
}
export const money = (n: number) => `$${n.toFixed(2)}`;
const styles = StyleSheet.create({
  page: { flex: 1 },
  top: { paddingHorizontal: 20, paddingBottom: 13, borderBottomWidth: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 15 },
  mark: { width: 36, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  back: { width: 36, height: 38, alignItems: 'flex-start', justifyContent: 'center' },
  brand: { fontFamily: FONT.semi, fontSize: 15, letterSpacing: -.4 },
  brandSub: { fontFamily: FONT.medium, fontSize: 9, letterSpacing: 1.4, marginTop: 2 },
  dot: { width: 7, height: 7, borderRadius: 5 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 8 },
  bannerText: { flex: 1, fontFamily: FONT.medium, fontSize: 10, lineHeight: 15 },
  heading: { paddingHorizontal: 20, paddingTop: 26, paddingBottom: 19 },
  eyebrow: { fontFamily: FONT.semi, fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase' },
  title: { fontFamily: FONT.medium, fontSize: 29, letterSpacing: -.85, marginTop: 8, lineHeight: 36 },
  subtitle: { fontFamily: FONT.regular, fontSize: 13, lineHeight: 20, marginTop: 5 },
  card: { borderWidth: 1, padding: 19, marginHorizontal: 20, marginBottom: 13 },
  action: { minHeight: 46, paddingHorizontal: 15, marginTop: 13, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  actionText: { fontFamily: FONT.semi, fontSize: 13, flexShrink: 1 },
  avatar: { borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FONT.semi },
  chip: { borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5, alignSelf: 'flex-start' },
  chipText: { fontFamily: FONT.medium, fontSize: 10 },
});