import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Action, Avatar, Card, FONT, Label, money, Page, StatusChip } from '@/components/FieldUI';
import { useColors } from '@/hooks/useColors';
import { useDemo } from '@/contexts/DemoContext';
import { clients, nameFor, visits, type Soap, type Status } from '@/constants/sample';

const sections = ['Visit', 'SOAP', 'Checkout'] as const;
const states: Status[] = ['Upcoming', 'Checked in', 'Completed', 'Cancelled'];
const fields: { key: keyof Soap; title: string; prompt: string }[] = [
  { key: 's', title: 'S · Subjective', prompt: 'What does the sample client report?' },
  { key: 'o', title: 'O · Objective', prompt: 'What did you observe or palpate?' },
  { key: 'a', title: 'A · Assessment', prompt: 'How do you interpret these findings?' },
  { key: 'p', title: 'P · Plan', prompt: 'Document a sample next step.' },
];
export default function VisitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { records, setStatus, saveSoap, setTip, checkout, touch } = useDemo();
  const visit = visits.find(v => v.id === id);
  const record = visit ? records[visit.id] : undefined;
  const [section, setSection] = useState<(typeof sections)[number]>('Visit');
  const [draft, setDraft] = useState<Soap>(() => ({ s: record?.soap.s ?? '', o: record?.soap.o ?? '', a: record?.soap.a ?? '', p: record?.soap.p ?? '' }));
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const changeSection = (next: (typeof sections)[number]) => {
    if (section === 'SOAP' && dirty && next !== 'SOAP') {
      if (Platform.OS === 'web') {
        if (window.confirm('Save sample SOAP note before leaving?')) { saveSoap(visit!.id, draft); setDirty(false); setSaved(true); setSection(next); }
        return;
      }
      Alert.alert('Unsaved sample note', 'Save your changes before leaving this SOAP note?', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => { setDraft({ ...record!.soap }); setDirty(false); setSection(next); } },
        { text: 'Save & continue', onPress: () => { saveSoap(visit!.id, draft); setDirty(false); setSaved(true); setSection(next); } },
      ]);
    } else setSection(next);
  };
  if (!visit || !record) return <Page back title="Visit not found"><Card><Text style={{ color: c.mutedForeground }}>There is no sample visit for this link.</Text><Action text="Back to today" onPress={() => router.replace('/(tabs)')} /></Card></Page>;
  const client = clients.find(x => x.id === visit.clientId);
  const tipAmount = visit.price * record.tip;
  return <Page back scroll={false} eyebrow={`${visit.time} · SAMPLE VISIT`} title={nameFor(visit.clientId)} subtitle={`${visit.service} · ${visit.duration} minutes`}>
    <View style={styles.tabs}>{sections.map(tab => <Pressable key={tab} testID={`visit-tab-${tab}`} accessibilityRole="tab" accessibilityState={{ selected: section === tab }} onPress={() => changeSection(tab)} style={[styles.tab, { borderBottomColor: section === tab ? c.primary : c.border }]}>
      <Text style={[styles.tabText, { color: section === tab ? c.primary : c.mutedForeground }]}>{tab}</Text>
    </Pressable>)}</View>
    <KeyboardAwareScrollViewCompat style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 18, paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 32 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" bottomOffset={65}>
      {section === 'Visit' && <>
        <Card style={{ backgroundColor: c.secondary, borderColor: c.sageLine }}>
          <View style={styles.row}><Avatar name={nameFor(visit.clientId)} color={visit.color} large /><View style={{ flex: 1 }}><Text style={[styles.cardTitle, { color: c.foreground }]}>{nameFor(visit.clientId)}</Text><Text style={[styles.meta, { color: c.mutedForeground }]}>{visit.service} · {visit.duration} minutes</Text></View><StatusChip status={record.status} /></View>
          <View style={[styles.detailLine, { marginTop: 23 }]}><Feather name="clock" size={16} color={c.pineSoft} /><Text style={[styles.detailText, { color: c.foreground }]}>{visit.time} · Tuesday, June 16</Text></View>
          <View style={styles.detailLine}><Feather name="map-pin" size={16} color={c.pineSoft} /><Text style={[styles.detailText, { color: c.foreground }]}>{visit.location}</Text></View>
          {!!visit.referral && <View style={styles.detailLine}><Feather name="user-check" size={16} color={c.pineSoft} /><Text style={[styles.detailText, { color: c.foreground }]}>Referred by {visit.referral}</Text></View>}
        </Card>
        {!!client?.flags.length && <Card><Label>CARE CONSIDERATIONS · SAMPLE</Label>{client.flags.map(flag => <View key={flag} style={styles.detailLine}><Feather name="alert-circle" size={16} color={c.amber} /><Text style={[styles.detailText, { color: c.amber }]}>{flag}</Text></View>)}</Card>}
        <Card><Label>APPOINTMENT STATUS</Label><Text style={[styles.helper, { color: c.mutedForeground }]}>Change this sample visit's status for the current session.</Text>
          <View style={styles.statuses}>{states.map(state => <Pressable testID={`status-${state}`} key={state} onPress={() => setStatus(visit.id, state)} style={[styles.statusButton, { backgroundColor: record.status === state ? c.secondary : c.card, borderColor: record.status === state ? c.primary : c.border }]}>
            <Text style={[styles.statusText, { color: record.status === state ? c.primary : c.mutedForeground }]}>{state}</Text>
          </Pressable>)}</View>
          <Action text="Open sample client profile" icon="user" onPress={() => router.push(`/client/${visit.clientId}`)} />
        </Card>
        <Card><Label>VISIT WORKFLOW</Label><Action text="Write or review SOAP note" icon="edit-3" onPress={() => changeSection('SOAP')} /><Action text="Open demo checkout" icon="credit-card" onPress={() => changeSection('Checkout')} /></Card>
      </>}
      {section === 'SOAP' && <>
        <Card><Label>PER-VISIT NOTE · {visit.service.toUpperCase()}</Label><Text style={[styles.cardTitle, { color: c.foreground, marginTop: 13 }]}>SOAP assessment</Text><Text style={[styles.helper, { color: c.mutedForeground }]}>This editable sample note is saved in memory only. It is not a clinical chart or legal record. Do not enter real patient information.</Text>
          {fields.map(({ key, title, prompt }) => <View key={key} style={styles.field}><Text style={[styles.fieldLabel, { color: c.foreground }]}>{title}</Text><TextInput testID={`soap-${key}`} value={draft[key]} multiline textAlignVertical="top" placeholder={prompt} placeholderTextColor={c.mutedForeground} onChangeText={value => { touch(); setDraft(old => ({ ...old, [key]: value })); setDirty(true); setSaved(false); }} style={[styles.textarea, { color: c.foreground, backgroundColor: c.card, borderColor: c.border }]} /></View>)}
          {saved && !dirty && <Text style={[styles.saved, { color: c.primary }]}><Feather name="check-circle" size={14} color={c.primary} /> Saved for this demo session</Text>}
          <Action testID="save-soap" text={dirty ? 'Save sample SOAP note' : 'Save SOAP note'} icon="save" primary onPress={() => { saveSoap(visit.id, draft); setDirty(false); setSaved(true); }} />
        </Card>
      </>}
      {section === 'Checkout' && <>
        <Card><Label>SIMULATED CHECKOUT</Label><Text style={[styles.price, { color: c.primary }]}>{money(visit.price)}</Text><Text style={[styles.meta, { color: c.mutedForeground }]}>{visit.service} · {visit.duration} minutes · {nameFor(visit.clientId)}</Text>
          <Text style={[styles.fieldLabel, { color: c.foreground, marginTop: 25 }]}>Example gratuity</Text>
          <View style={styles.tips}>{[0, .15, .18, .2].map(tip => <Pressable testID={`tip-${Math.round(tip * 100)}`} key={tip} disabled={record.demoPaid} onPress={() => setTip(visit.id, tip)} style={[styles.tip, { borderColor: tip === record.tip ? c.primary : c.border, backgroundColor: tip === record.tip ? c.secondary : c.card, opacity: record.demoPaid ? .6 : 1 }]}>
            <Text style={[styles.tipText, { color: tip === record.tip ? c.primary : c.foreground }]}>{tip === 0 ? 'None' : `${Math.round(tip * 100)}%`}</Text><Text style={[styles.meta, { color: c.mutedForeground }]}>{money(visit.price * tip)}</Text>
          </Pressable>)}</View>
          <View style={[styles.total, { borderColor: c.border }]}><Text style={[styles.detailText, { color: c.mutedForeground }]}>Session</Text><Text style={[styles.detailText, { color: c.foreground }]}>{money(visit.price)}</Text></View>
          <View style={styles.total}><Text style={[styles.detailText, { color: c.mutedForeground }]}>Example tip</Text><Text style={[styles.detailText, { color: c.foreground }]}>{money(tipAmount)}</Text></View>
          <View style={[styles.total, { borderColor: c.border, borderTopWidth: 1, paddingTop: 17 }]}><Text style={[styles.cardTitle, { color: c.foreground }]}>Total</Text><Text style={[styles.cardTitle, { color: c.primary }]}>{money(visit.price + tipAmount)}</Text></View>
          {record.demoPaid ? <View style={[styles.success, { backgroundColor: c.secondary }]}><Feather name="check-circle" size={18} color={c.primary} /><Text style={[styles.successText, { color: c.primary }]}>Demo checkout recorded in this session. No charge was made.</Text></View> : <Action testID="demo-checkout" text={`Simulate checkout · ${money(visit.price + tipAmount)}`} icon="check" primary onPress={() => { checkout(visit.id); if (Platform.OS !== 'web') Alert.alert('Demo checkout complete', 'No card was charged, no receipt was sent, and no payment was collected.'); }} />}
          <Text style={[styles.disclaimer, { color: c.mutedForeground }]}>Demo only. No payment processor, card entry, charge, or receipt.</Text>
        </Card>
      </>}
    </KeyboardAwareScrollViewCompat>
  </Page>;
}
const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', marginHorizontal: 20 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 13, borderBottomWidth: 2 },
  tabText: { fontFamily: FONT.semi, fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  cardTitle: { fontFamily: FONT.semi, fontSize: 17 },
  meta: { fontFamily: FONT.regular, fontSize: 11, lineHeight: 17, marginTop: 5 },
  detailLine: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  detailText: { fontFamily: FONT.medium, fontSize: 12, lineHeight: 19, flexShrink: 1 },
  helper: { fontFamily: FONT.regular, fontSize: 12, lineHeight: 19, marginTop: 11 },
  statuses: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 17 },
  statusButton: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 7 },
  statusText: { fontFamily: FONT.medium, fontSize: 11 },
  field: { marginTop: 21 },
  fieldLabel: { fontFamily: FONT.semi, fontSize: 12, marginBottom: 9 },
  textarea: { minHeight: 104, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, fontFamily: FONT.regular, fontSize: 13, lineHeight: 21 },
  saved: { fontFamily: FONT.medium, fontSize: 11, marginTop: 17 },
  price: { fontFamily: FONT.medium, fontSize: 40, letterSpacing: -1, marginTop: 16 },
  tips: { flexDirection: 'row', gap: 7, marginBottom: 21 },
  tip: { flex: 1, minHeight: 67, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center', padding: 4 },
  tipText: { fontFamily: FONT.semi, fontSize: 14 },
  total: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 9 },
  success: { borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, marginTop: 18 },
  successText: { fontFamily: FONT.medium, fontSize: 12, flex: 1, lineHeight: 18 },
  disclaimer: { fontFamily: FONT.regular, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 15 },
});