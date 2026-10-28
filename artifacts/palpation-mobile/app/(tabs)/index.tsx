import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useDemo } from '@/contexts/DemoContext';
import { nameFor, visits, type Status } from '@/constants/sample';
import { Action, Avatar, Card, FONT, Label, Page, StatusChip } from '@/components/FieldUI';

const filters = ['All', 'Upcoming', 'Checked in', 'Completed', 'Cancelled'] as const;
export default function Today() {
  const c = useColors();
  const router = useRouter();
  const { records, setStatus } = useDemo();
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const shown = visits.filter(v => filter === 'All' || records[v.id].status === filter);
  const next = visits.find(v => records[v.id].status === 'Upcoming');
  const completed = visits.filter(v => records[v.id].status === 'Completed').length;
  return <Page eyebrow="TUESDAY · JUNE 16, 2026" title="Today's visits" subtitle="A clear view of your sample field day in Plano.">
    <View style={styles.metrics}>
      <View style={[styles.metric, { backgroundColor: c.secondary, borderColor: c.sageLine }]}><Text style={[styles.metricNumber, { color: c.primary }]}>{visits.length}</Text><Text style={[styles.metricText, { color: c.mutedForeground }]}>Scheduled</Text></View>
      <View style={[styles.metric, { backgroundColor: c.card, borderColor: c.border }]}><Text style={[styles.metricNumber, { color: c.foreground }]}>{completed}</Text><Text style={[styles.metricText, { color: c.mutedForeground }]}>Completed</Text></View>
    </View>
    {next && <Card style={{ backgroundColor: c.secondary, borderColor: c.sageLine }}>
      <View style={styles.space}><Label>UP NEXT</Label><Text style={[styles.nextTime, { color: c.primary }]}>{next.time}</Text></View>
      <View style={[styles.row, { marginTop: 17 }]}><Avatar name={nameFor(next.clientId)} color={next.color} large /><View style={{ flex: 1 }}><Text style={[styles.nextName, { color: c.foreground }]}>{nameFor(next.clientId)}</Text><Text style={[styles.sub, { color: c.mutedForeground }]}>{next.service} · {next.duration} min</Text></View></View>
      <View style={[styles.location, { marginTop: 16 }]}><Feather name="map-pin" size={15} color={c.pineSoft} /><Text style={[styles.sub, { color: c.mutedForeground }]}>{next.location}</Text></View>
      <Action testID="check-in-next" text="Check in & open visit" primary onPress={() => { setStatus(next.id, 'Checked in'); router.push(`/visit/${next.id}`); }} />
    </Card>}
    <View style={styles.section}><Text style={[styles.sectionTitle, { color: c.foreground }]}>Your schedule</Text><Text style={[styles.count, { color: c.mutedForeground }]}>{shown.length} visits</Text></View>
    <View style={styles.filters}>{filters.map(item => <Pressable testID={`filter-${item}`} key={item} onPress={() => setFilter(item)} style={[styles.filter, { backgroundColor: filter === item ? c.primary : c.card, borderColor: filter === item ? c.primary : c.border }]}><Text style={[styles.filterText, { color: filter === item ? c.primaryForeground : c.mutedForeground }]}>{item}</Text></Pressable>)}</View>
    {shown.length === 0 ? <Card><Feather name="calendar" size={23} color={c.pineSoft} /><Text style={[styles.empty, { color: c.mutedForeground }]}>No sample visits match this filter.</Text></Card> : shown.map(v => <Pressable testID={`visit-${v.id}`} key={v.id} onPress={() => router.push(`/visit/${v.id}`)} style={({ pressed }) => [styles.visit, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? .7 : 1 }]}>
      <View style={styles.space}><Label>VISIT {String(visits.indexOf(v) + 1).padStart(2, '0')} · {v.time}</Label><StatusChip status={records[v.id].status} /></View>
      <View style={[styles.row, { marginTop: 15 }]}><Avatar name={nameFor(v.clientId)} color={v.color} /><View style={{ flex: 1 }}><Text style={[styles.visitName, { color: c.foreground }]}>{nameFor(v.clientId)}</Text><Text style={[styles.sub, { color: c.mutedForeground }]}>{v.service} · {v.duration} min</Text></View><Feather name="chevron-right" size={20} color={c.mutedForeground} /></View>
      <View style={styles.location}><Feather name="map-pin" size={13} color={c.pineSoft} /><Text style={[styles.sub, { color: c.mutedForeground }]}>{v.location}</Text></View>
    </Pressable>)}
  </Page>;
}
const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', marginHorizontal: 20, gap: 11, marginBottom: 14 },
  metric: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 16 },
  metricNumber: { fontFamily: FONT.medium, fontSize: 28 },
  metricText: { fontFamily: FONT.medium, fontSize: 11, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  space: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextTime: { fontFamily: FONT.semi, fontSize: 12 },
  nextName: { fontFamily: FONT.semi, fontSize: 19 },
  visitName: { fontFamily: FONT.semi, fontSize: 15 },
  sub: { fontFamily: FONT.regular, fontSize: 12, marginTop: 4, lineHeight: 18 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 10, marginBottom: 12 },
  sectionTitle: { fontFamily: FONT.semi, fontSize: 16 },
  count: { fontFamily: FONT.regular, fontSize: 11 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20, gap: 7, marginBottom: 16 },
  filter: { paddingVertical: 9, paddingHorizontal: 11, borderRadius: 7, borderWidth: 1 },
  filterText: { fontFamily: FONT.medium, fontSize: 11 },
  visit: { borderWidth: 1, borderRadius: 12, padding: 17, marginHorizontal: 20, marginBottom: 10 },
  empty: { fontFamily: FONT.regular, fontSize: 13, marginTop: 12 },
});