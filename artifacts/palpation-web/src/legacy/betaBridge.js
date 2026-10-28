// Tiny event bridge: the legacy demo emits only allowlisted, content-free signals.
let listener = null;
export function setBetaListener(fn) { listener = fn; return () => { if (listener === fn) listener = null; }; }
const SCREEN = { today: 'overview', reports: 'overview', schedule: 'schedule', clients: 'clients', soap: 'notes', charting: 'notes', payments: 'billing', invoicing: 'billing', payroll: 'billing', settings: 'settings' };
export function screenFor(view) { return SCREEN[view] || 'other'; }
export function emitBeta(event, view) { try { if (listener) listener(event, screenFor(view)); } catch { /* never break the demo */ } }
