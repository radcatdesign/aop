import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useColors } from '@/hooks/useColors';
import { clients, visits } from '@/constants/sample';
import { Avatar, Card, FONT, Page } from '@/components/FieldUI';
import { useDemo } from '@/contexts/DemoContext';

export default function Clients() {
  const c = useColors();
  const router = useRouter();
  const { touch } = useDemo();
  const [search, setSearch] = useState('');
  const result = clients.filter(client => `${client.name} ${client.modality}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
    <Page eyebrow="SAMPLE DIRECTORY" title="Clients" subtitle="Explore fictional care plans and linked visits.">
      <View style={[styles.search, { backgroundColor: c.card, borderColor: c.border }]}>
        <Feather name="search" size={19} color={c.mutedForeground} />
        <TextInput testID="client-search" autoCorrect={false} value={search} onChangeText={value => { touch(); setSearch(value); }} placeholder="Search name or service" placeholderTextColor={c.mutedForeground} style={[styles.input, { color: c.foreground }]} />
        {!!search && <Pressable testID="clear-search" accessibilityLabel="Clear search" onPress={() => setSearch('')}><Feather name="x" size={18} color={c.mutedForeground} /></Pressable>}
      </View>
      <Text style={[styles.results, { color: c.mutedForeground }]}>{result.length} sample client{result.length === 1 ? '' : 's'}</Text>
      {result.length === 0 ? <Card><Feather name="users" size={22} color={c.pineSoft} /><Text style={[styles.empty, { color: c.mutedForeground }]}>No sample clients match “{search}”.</Text></Card> : result.map(client => {
        const visit = visits.find(v => v.clientId === client.id);
        return <Pressable testID={`client-${client.id}`} key={client.id} onPress={() => router.push(`/client/${client.id}`)} style={({ pressed }) => [styles.row, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? .7 : 1 }]}>
          <Avatar name={client.name} color={visit?.color ?? c.pineSoft} />
          <View style={{ flex: 1 }}><Text style={[styles.name, { color: c.foreground }]}>{client.name}</Text><Text style={[styles.detail, { color: c.mutedForeground }]}>{client.modality} · Since {client.since}</Text></View>
          <Feather name="chevron-right" size={20} color={c.mutedForeground} />
        </Pressable>;
      })}
    </Page>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  search: { marginHorizontal: 20, borderWidth: 1, borderRadius: 9, paddingHorizontal: 13, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { fontFamily: FONT.regular, fontSize: 14, flex: 1, paddingVertical: 9 },
  results: { fontFamily: FONT.medium, fontSize: 11, marginHorizontal: 20, marginVertical: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, borderWidth: 1, marginHorizontal: 20, marginBottom: 9 },
  name: { fontFamily: FONT.semi, fontSize: 14 },
  detail: { fontFamily: FONT.regular, fontSize: 11, marginTop: 5 },
  empty: { fontFamily: FONT.regular, fontSize: 13, marginTop: 9 },
});