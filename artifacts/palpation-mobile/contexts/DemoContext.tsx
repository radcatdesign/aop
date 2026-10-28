import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
import { blankSoap, initialSoap, type Soap, type Status, visits } from '@/constants/sample';
import { useBetaRecordEvent } from '@workspace/api-client-react';

type RecordState = { status: Status; soap: Soap; tip: number; demoPaid: boolean };
type DemoContextValue = {
  active: boolean; reason: string; records: Record<string, RecordState>;
  start: () => void; end: () => void; touch: () => void;
  setStatus: (id: string, status: Status) => void;
  saveSoap: (id: string, soap: Soap) => void;
  setTip: (id: string, tip: number) => void;
  checkout: (id: string) => void;
};
const createRecords = (): Record<string, RecordState> =>
  Object.fromEntries(visits.map(v => [v.id, { status: 'Upcoming', soap: { ...(initialSoap[v.id] ?? blankSoap()) }, tip: 0.15, demoPaid: false }]));
const DemoContext = createContext<DemoContextValue | null>(null);
const IDLE_MS = 5 * 60 * 1000;
const ABSOLUTE_MS = 30 * 60 * 1000;

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const usage = useBetaRecordEvent();
  const [active, setActive] = useState(false);
  const [reason, setReason] = useState('');
  const [records, setRecords] = useState<Record<string, RecordState>>(createRecords);
  const started = useRef(0);
  const lastTouch = useRef(0);
  const backgroundAt = useRef(0);
  const live = useRef(false);
  const clear = useCallback((message: string) => {
    live.current = false;
    started.current = 0;
    lastTouch.current = 0;
    backgroundAt.current = 0;
    setRecords(createRecords());
    setReason(message);
    setActive(false);
  }, []);
  const expire = useCallback(() => {
    if (!live.current) return;
    const now = Date.now();
    if (now - started.current >= ABSOLUTE_MS) clear('The 30-minute demo session ended. Sample edits were cleared.');
    else if (now - lastTouch.current >= IDLE_MS || (backgroundAt.current && now - backgroundAt.current >= IDLE_MS))
      clear('The demo expired after 5 minutes away or idle. Sample edits were cleared.');
  }, [clear]);
  useEffect(() => {
    const timer = setInterval(expire, 1000);
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (!live.current) return;
      if (state === 'active') { expire(); backgroundAt.current = 0; }
      else if (!backgroundAt.current) backgroundAt.current = Date.now();
    });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [expire]);
  const touch = useCallback(() => { expire(); if (live.current && !backgroundAt.current) lastTouch.current = Date.now(); }, [expire]);
  const start = useCallback(() => {
    setRecords(createRecords()); setReason('');
    started.current = Date.now(); lastTouch.current = started.current; backgroundAt.current = 0;
    live.current = true; setActive(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);
  const end = useCallback(() => { clear('Session ended. All sample edits have been cleared.'); Haptics.selectionAsync(); }, [clear]);
  const update = (id: string, change: Partial<RecordState>) => {
    expire();
    if (!live.current || !visits.some(v => v.id === id)) return;
    lastTouch.current = Date.now();
    setRecords(prev => ({ ...prev, [id]: { ...prev[id], ...change } }));
    Haptics.selectionAsync();
  };
  const value: DemoContextValue = {
    active, reason, records, start, end, touch,
    setStatus: (id, status) => update(id, { status }),
    saveSoap: (id, soap) => {
      if (live.current) {
        update(id, { soap: { ...soap } });
        usage.mutate({ data: { event: 'assessment_saved', platform: 'mobile', screen: 'notes' } });
      }
    },
    setTip: (id, tip) => update(id, { tip }),
    checkout: id => {
      if (live.current) {
        update(id, { demoPaid: true, status: 'Completed' });
        usage.mutate({ data: { event: 'checkout_demo', platform: 'mobile', screen: 'billing' } });
      }
    },
  };
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo requires DemoProvider');
  return context;
}