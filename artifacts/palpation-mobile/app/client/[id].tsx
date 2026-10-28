import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { clients, visits } from '@/constants/sample';
import { useDemo } from '@/contexts/DemoContext';
import { Action, Avatar, Card, FONT, Label, Page, StatusChip } from '@/components/FieldUI';

export default function ClientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useColors();
  const client = clients.find(x => x.id === id);
  const linked = visits.filter(v => v.clientId === id);
  const { records } = useDemo();
  if (!client) return <Page title="Client not found" back><Card><Text style={{ color: c.mutedForeground }}>There is no sample client for this link.</Text><Action text="Back to clients" onPress={() => router.replace('/(tabs)/clients')} /></Card></Page>;
  return <Page back eyebrow="SAMPLE CLIENT" title={client.name} subtitle={`${client.modality} · With this sample practice since ${client.since}`}>
    <Card style={{ backgroundColor: c.secondary, borderColor: c.sageLine }}>
      <View style={styles.hero}><Avatar name={client.name} color={linked[0]?.color ?? c.pineSoft} large /><View style={{ flex: 1 }}><Text style={[styles.name, { color: c.foreground }]}>{client.name}</Text><Text style={[styles.meta, { color: c.mutedForeground }]}>Fictional care profile</Text></View></View>
      {client.flags.map(flag => <View key={flag} style={[styles.flag, { backgroundColor: c.amberBg }]}><Feather name="alert-circle" size={15} color={c.amber} /><Text style={[styles.flagText, { color: c.amber }]}>{flag}</Text></View>)}
    </Card>
    <Card><Label>CARE PLAN · SAMPLE</Label><Text style={[styles.body, { color: c.foreground }]}>{client.plan}</Text>
      {!!client.referral && <Text style={[styles.meta, { color: c.mutedForeground, marginTop: 13 }]}>Referral: {client.referral}</Text>}
    </Card>
    <Card><Label>LINKED FIELD VISITS</Label>
      {linked.length === 0 ? <Text style={[styles.body, { color: c.mutedForeground }]}>No visits in the sample field schedule.</Text> : linked.map(v => <View key={v.id} style={[styles.linked, { borderColor: c.border }]}>
        <View style={{ flex: 1 }}><Text style={[styles.linkName, { color: c.foreground }]}>{v.service} · {v.duration} min</Text><Text style={[styles.meta, { color: c.mutedForeground }]}>{v.time} · {v.location}</Text></View><StatusChip status={records[v.id].status} />
        <View style={{ width: '100%' }}><Action text="Open visit & SOAP" onPress={() => router.push(`/visit/${v.id}`)} /></View>
      </View>)}
    </Card>
  </Page>;
}
const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  name: { fontFamily: FONT.semi, fontSize: 18 },
  meta: { fontFamily: FONT.regular, fontSize: 11, lineHeight: 18, marginTop: 4 },
  body: { fontFamily: FONT.regular, fontSize: 13, lineHeight: 22, marginTop: 13 },
  flag: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, padding: 9, borderRadius: 6, marginTop: 13 },
  flagText: { fontFamily: FONT.medium, fontSize: 11 },
  linked: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', borderTopWidth: 1, paddingTop: 14, marginTop: 14 },
  linkName: { fontFamily: FONT.semi, fontSize: 13 },
});