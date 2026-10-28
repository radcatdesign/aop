// Fictional, bundled example records; never hydrated from device storage or a service.
export type Status = 'Upcoming' | 'Checked in' | 'Completed' | 'Cancelled';
export type Soap = { s: string; o: string; a: string; p: string };
export type Visit = { id: string; clientId: string; time: string; service: string; duration: number; location: string; price: number; referral?: string; color: string };
export type Client = { id: string; name: string; modality: string; since: string; plan: string; flags: string[]; referral?: string };
export const clients: Client[] = [
  { id: 'c1', name: 'Rosa Delgado', modality: 'Deep Tissue', since: '2024', plan: 'Chronic right-shoulder tension. Six-visit plan; reassess fascia mobility at visit four.', flags: ['Latex sensitivity'], referral: 'Dr. A. Okonkwo · Orthopedics' },
  { id: 'c2', name: 'Trevor Books', modality: 'Sports', since: '2025', plan: 'Pre-event maintenance, hamstring and calf focus. Bi-weekly.', flags: [] },
  { id: 'c3', name: 'Aisha Carter', modality: 'Prenatal', since: '2025', plan: 'Review comfort and positioning before the session.', flags: ['Pregnant — 2nd trimester'], referral: 'Dr. M. Reyes' },
  { id: 'c4', name: 'Leon Whitfield', modality: 'Swedish', since: '2023', plan: 'General stress and sleep. Monthly relaxation.', flags: [] },
  { id: 'c5', name: 'Mina Okafor', modality: 'Deep Tissue', since: '2026', plan: 'New client — intake pending.', flags: ['Intake pending'] },
  { id: 'c6', name: 'Grant Whitman', modality: 'Sports', since: '2024', plan: 'Marathon training block. Weekly lower-body.', flags: ['High blood pressure'] },
];
export const visits: Visit[] = [
  { id: 'v1', clientId: 'c1', time: '9:00 AM', service: 'Deep tissue', duration: 60, location: 'Client home, Plano', price: 110, referral: 'Dr. Okonkwo', color: '#438773' },
  { id: 'v2', clientId: 'c2', time: '11:00 AM', service: 'Sports', duration: 90, location: 'TrainHaus gym, Frisco', price: 150, color: '#ad9365' },
  { id: 'v3', clientId: 'c3', time: '1:30 PM', service: 'Prenatal', duration: 60, location: 'Client home, Allen', price: 120, referral: 'Dr. Reyes', color: '#7c91a5' },
  { id: 'v4', clientId: 'c6', time: '3:30 PM', service: 'Swedish', duration: 60, location: 'Pop-up event, The Star', price: 100, color: '#9083a0' },
];
export const initialSoap: Record<string, Soap> = {
  v1: {
    s: 'Reports right-shoulder tension after a long work week; 5/10 at rest, 7/10 with overhead reach.',
    o: 'Hypertonicity in right upper trapezius and levator scapulae; limited shoulder abduction.',
    a: 'Myofascial restriction consistent with postural strain. Improving versus previous visit.',
    p: 'Continue deep tissue and myofascial release. Reassess at visit four.',
  },
};
export const blankSoap = (): Soap => ({ s: '', o: '', a: '', p: '' });
export const nameFor = (id: string) => clients.find(c => c.id === id)?.name ?? 'Unknown sample client';