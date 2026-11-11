// Plan of care: dates, visit counts and the practitioner's documentation rules
// (progress note every N visits, re-evaluation reminder before the plan ends).
// Pure helpers shared by the workspace and the Today dashboard.

export const NOTE_KINDS = {
  daily: "Daily note",
  progress: "Progress note",
  reeval: "Re-evaluation",
  eval: "Initial evaluation",
};

// Kinds that reset the "visits since last progress note" count.
export const RESETS_PROGRESS = new Set(["progress", "reeval", "eval"]);

export const DEFAULT_RULES = { progressEvery: 10, reevalAtEnd: true, reevalLeadDays: 7 };

export function dayDiff(fromISO, toISO) {
  return Math.round((new Date(toISO + "T12:00:00") - new Date(fromISO + "T12:00:00")) / 864e5);
}

export function fmtDay(iso) {
  return iso ? new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
}

export function addDays(iso, n) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/**
 * Where a client's plan of care stands today, and what the next note should be.
 * Returns null when the client has no plan of care.
 */
export function pocStatus(client, today) {
  const poc = client && client.poc;
  if (!poc) return null;
  const rules = { ...DEFAULT_RULES, ...(poc.rules || {}) };
  const used = poc.visitsUsed || 0;
  const next = used + 1;
  const lastProgress = poc.lastProgressVisit || 0;
  const every = Number(rules.progressEvery) || 0;
  const nextProgressAt = every > 0 ? lastProgress + every : null;
  const progressDue = every > 0 && next >= nextProgressAt;
  const daysLeft = poc.end ? dayDiff(today, poc.end) : null;
  const lead = Number(rules.reevalLeadDays) || 0;
  const reminderFrom = poc.end ? addDays(poc.end, -lead) : null;
  // A re-evaluation documented inside the reminder window satisfies it.
  const reevalDone = !!(poc.reevalDoneAt && reminderFrom && poc.reevalDoneAt >= reminderFrom);
  const reevalDue = !!(rules.reevalAtEnd && poc.end && daysLeft <= lead && !reevalDone);
  const reevalOverdue = reevalDue && daysLeft < 0;
  const recommended = reevalDue ? "reeval" : progressDue ? "progress" : "daily";
  const reason = reevalDue
    ? (reevalOverdue ? `Plan of care ended ${fmtDay(poc.end)}. Re-evaluation is overdue.` : `Plan of care ends ${fmtDay(poc.end)}. Re-evaluate before then.`)
    : progressDue
      ? `This is the ${ordinal(next - lastProgress)} visit since the last progress note. Your rule: every ${every} visits.`
      : null;
  return {
    poc, rules, used, next, every, lastProgress, nextProgressAt, progressDue,
    daysLeft, lead, reminderFrom, reevalDone, reevalDue, reevalOverdue,
    recommended, reason, authorized: poc.visitsAuthorized || null,
  };
}
