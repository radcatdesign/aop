import type { BetaArea } from "@workspace/api-client-react";

// Mirrors the workspace navigation (legacy/App.jsx NAV) so feedback can name
// the exact page. "portal" is the beta home outside the workspace.
export const AREA_GROUPS: { group: string; areas: { id: BetaArea; label: string }[] }[] = [
  { group: "General", areas: [{ id: "other", label: "General / not sure" }, { id: "portal", label: "Beta home" }] },
  { group: "Overview", areas: [{ id: "today", label: "Today" }, { id: "reports", label: "Reports" }] },
  { group: "Front office", areas: [{ id: "schedule", label: "Schedule" }, { id: "clients", label: "Clients" }, { id: "messages", label: "Messages" }] },
  { group: "Clinical", areas: [{ id: "soap", label: "SOAP Notes" }, { id: "charting", label: "Charting" }, { id: "documents", label: "Documents" }] },
  { group: "Billing", areas: [{ id: "payments", label: "Payments" }, { id: "invoicing", label: "Invoicing" }, { id: "payroll", label: "Payroll" }] },
  { group: "Practice", areas: [{ id: "academy", label: "Academy" }, { id: "settings", label: "Settings" }] },
  { group: "Tools", areas: [{ id: "flows", label: "Flows" }, { id: "kiosk", label: "Field App" }] },
];

const LABELS = new Map<string, string>(AREA_GROUPS.flatMap((g) => g.areas.map((a) => [a.id, a.label] as const)));

export const isArea = (value: unknown): value is BetaArea => typeof value === "string" && LABELS.has(value);

export function areaLabel(id: string | null | undefined): string | null {
  return id ? LABELS.get(id) ?? null : null;
}

// "12m 04s", "45s". Sessions are capped at 30 minutes.
export function formatLength(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return m ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}
