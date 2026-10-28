import React from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import { useQueryClient } from '@tanstack/react-query';
import { useBetaGetMe, useBetaListMyFeedback, useBetaSubmitFeedback, getBetaListMyFeedbackQueryKey } from '@workspace/api-client-react';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useDemo } from '@/contexts/DemoContext';
import { Action, Card, FONT, Label, Page } from '@/components/FieldUI';

export default function Settings() {
  const c = useColors();
  const router = useRouter();
  const { end, records } = useDemo();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const me = useBetaGetMe();
  const feedback = useBetaListMyFeedback({ query: { queryKey: getBetaListMyFeedbackQueryKey(), retry: false } });
  const submit = useBetaSubmitFeedback();
  const [category, setCategory] = useState<'bug' | 'idea' | 'other'>('idea');
  const [rating, setRating] = useState<number | undefined>();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const send = () => {
    if (!message.trim()) return;
    submit.mutate({ data: { category, message: message.trim(), rating, screen: 'settings', platform: 'mobile' } }, {
      onSuccess: () => { setMessage(''); setSent(true); void queryClient.invalidateQueries({ queryKey: getBetaListMyFeedbackQueryKey() }); },
    });
  };
  const confirmEnd = () => {
    const finish = () => { router.replace('/(tabs)'); end(); };
    if (Platform.OS === 'web') {
      if (window.confirm('End demo session? All sample edits will be cleared.')) finish();
      return;
    }
    Alert.alert('End demo session?', 'All changes to sample visits and SOAP notes will be cleared. Nothing is stored on this device.', [
      { text: 'Keep exploring', style: 'cancel' },
      { text: 'End & clear', style: 'destructive', onPress: finish },
    ]);
  };
  return <Page eyebrow="YOUR WORKSPACE" title="Settings" subtitle="Private beta · fictional sample day.">
    <Card><Label>BETA ACCOUNT</Label><Text style={[styles.head, { color: c.foreground }]}>{me.data?.name ?? 'Tester'}</Text><Text style={[styles.body, { color: c.mutedForeground }]}>{me.data?.email ?? ''} · {me.data?.status ?? 'Checking access'}</Text>
      <Action text="Sign out and clear samples" icon="log-out" onPress={() => { end(); queryClient.clear(); void signOut(); }} />
      {me.data?.role === 'admin' && <Action text="Open office admin" icon="external-link" onPress={() => {
        const domain = process.env.EXPO_PUBLIC_DOMAIN;
        if (domain) void Linking.openURL(`https://${domain}/admin`);
        else Alert.alert('Admin unavailable', 'Deployment domain is not configured.');
      }} />}
    </Card>
    <Card><Label>DEMO PRACTICE</Label><Text style={[styles.head, { color: c.foreground }]}>Art of Palpation · Plano</Text>
      <Text style={[styles.body, { color: c.mutedForeground }]}>Exploring the fictional practice as Dana Reyes, a sample massage therapist. Your tester account is separate from this character.</Text>
      <View style={[styles.rule, { backgroundColor: c.border }]} />
      <View style={styles.line}><Feather name="calendar" size={17} color={c.pineSoft} /><Text style={[styles.lineText, { color: c.foreground }]}>Tuesday, June 16, 2026 · sample day</Text></View>
      <View style={styles.line}><Feather name="check-circle" size={17} color={c.pineSoft} /><Text style={[styles.lineText, { color: c.foreground }]}>{Object.values(records).filter(r => r.status === 'Completed').length} demo visits completed</Text></View>
    </Card>
    <Card><Label>DATA & SESSION</Label><Text style={[styles.head, { color: c.foreground }]}>Only here, only for now.</Text>
      <Text style={[styles.body, { color: c.mutedForeground }]}>Your tester account is authenticated. Sample edits live in memory on this device. They are not synced, saved to storage, sent to the office app, or backed up. No clinical record or payment is provided.</Text>
      <Text style={[styles.body, { color: c.mutedForeground, marginTop: 12 }]}>The session clears on exit, after 5 minutes idle or away, or after 30 minutes total. Do not enter real patient information.</Text>
      <Action testID="end-session" text="End session & clear sample edits" icon="log-out" danger onPress={confirmEnd} />
    </Card>
    <Card><Label>BETA FEEDBACK</Label><Text style={[styles.body, { color: c.mutedForeground }]}>Tell us about the experience. Do not include any patient names, identifiers or clinical details.</Text>
      <View style={styles.options}>{(['bug', 'idea', 'other'] as const).map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }} onPress={() => setCategory(item)} style={[styles.option, { borderColor: c.border, backgroundColor: category === item ? c.secondary : c.card }]}><Text style={{ color: c.primary, fontFamily: FONT.medium }}>{item}</Text></Pressable>)}</View>
      <TextInput testID="feedback-message" accessibilityLabel="Feedback message" multiline maxLength={4000} value={message} onChangeText={value => { setMessage(value); setSent(false); }} placeholder="Your feedback" placeholderTextColor={c.mutedForeground} style={[styles.input, { borderColor: c.border, color: c.foreground, backgroundColor: c.card }]} />
      <Text style={[styles.body, { color: c.mutedForeground }]}>Rating (optional)</Text>
      <View style={styles.options}>{[1, 2, 3, 4, 5].map(n => <Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n} stars`} accessibilityState={{ selected: rating === n }} onPress={() => setRating(n)} style={[styles.option, { borderColor: c.border, backgroundColor: rating === n ? c.secondary : c.card }]}><Text style={{ color: c.primary }}>{n}</Text></Pressable>)}</View>
      <Action text="Send feedback" disabled={!message.trim() || submit.isPending} primary onPress={send} />
      {sent && <Text accessibilityRole="alert" style={[styles.body, { color: c.primary }]}>Feedback received.</Text>}
      {submit.isError && <Text accessibilityRole="alert" style={[styles.body, { color: c.destructive }]}>{submit.error.message}</Text>}
    </Card>
    <Card><Label>YOUR FEEDBACK</Label>
      {feedback.isLoading && <Text style={[styles.body, { color: c.mutedForeground }]}>Loading feedback…</Text>}
      {feedback.isError && <Text style={[styles.body, { color: c.destructive }]}>{feedback.error.message}</Text>}
      {feedback.data?.length === 0 && <Text style={[styles.body, { color: c.mutedForeground }]}>No feedback submitted yet.</Text>}
      {feedback.data?.map(item => <View key={item.id} style={[styles.feedback, { borderBottomColor: c.border }]}><Text style={[styles.lineText, { color: c.foreground }]}>{item.category} · {item.status.replace('_', ' ')}</Text><Text style={[styles.body, { color: c.mutedForeground }]}>{item.message}</Text></View>)}
    </Card>
  </Page>;
}
const styles = StyleSheet.create({
  head: { fontFamily: FONT.semi, fontSize: 18, marginTop: 13 },
  body: { fontFamily: FONT.regular, fontSize: 12, lineHeight: 20, marginTop: 9 },
  rule: { height: 1, marginVertical: 18 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  lineText: { fontFamily: FONT.medium, fontSize: 12 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  option: { minWidth: 41, padding: 10, borderWidth: 1, borderRadius: 8, alignItems: 'center' },
  input: { marginTop: 14, minHeight: 100, borderWidth: 1, borderRadius: 9, padding: 12, fontFamily: FONT.regular, fontSize: 14, textAlignVertical: 'top' },
  feedback: { borderBottomWidth: 1, paddingVertical: 13 },
});