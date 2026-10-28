import { useState } from "react";
import { ChevronDown, History, MessageSquareText } from "lucide-react";
import { useBetaListMySessions, type BetaSession } from "@workspace/api-client-react";
import { EmptyState, ErrorState, StatusPill, errorMessage, formatDate } from "@/components/beta-ui";
import { areaLabel, formatLength } from "@/lib/feedback-areas";

const END_LABEL: Record<string, string> = {
  ended: "You ended it",
  timeout: "Closed for inactivity or time limit",
  left: "Closed when you left the page",
};

// Sessions are capped at 30 minutes; one still open well past that never got closed.
const STALE_MS = 31 * 60 * 1000;

function lengthText(s: BetaSession) {
  if (s.durationSeconds != null) return formatLength(s.durationSeconds);
  return Date.now() - new Date(s.startedAt).getTime() < STALE_MS ? "In progress" : "Length unknown";
}

function endText(s: BetaSession) {
  if (s.endReason) return END_LABEL[s.endReason] ?? "Closed";
  return Date.now() - new Date(s.startedAt).getTime() < STALE_MS ? "Still open" : "Didn't close normally";
}

function SessionRow({ s, highlight, defaultOpen }: { s: BetaSession; highlight: boolean; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const count = s.feedback.length;
  return (
    <li className={highlight ? "bg-secondary/60" : undefined} data-testid={`row-session-${s.id}`}>
      <button
        type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-foreground">
            {formatDate(s.startedAt)}
            {highlight && <span className="rounded-full bg-primary px-2 py-px text-[10.5px] font-semibold text-primary-foreground">Just ended</span>}
          </span>
          <span className="mt-0.5 block text-[12px] text-muted-foreground">{endText(s)}</span>
        </span>
        <span className="text-right">
          <span className="block text-[13px] font-semibold tabular-nums text-foreground" data-testid={`text-session-length-${s.id}`}>{lengthText(s)}</span>
          <span className="block text-[11.5px] text-muted-foreground">{count} {count === 1 ? "note" : "notes"}</span>
        </span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="px-4 pb-4">
          {count === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-3 text-[12.5px] text-muted-foreground">No feedback sent during this session.</p>
          ) : (
            <ul className="space-y-2">
              {s.feedback.map((f) => (
                <li key={f.id} className="rounded-lg border border-border bg-background px-3 py-2.5" data-testid={`row-session-feedback-${f.id}`}>
                  <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wider">{f.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{areaLabel(f.area) ?? f.screen}{f.areaDetail ? ` · ${f.areaDetail}` : ""}</span>
                    {f.page && f.area && f.page !== f.area && <span>(sent from {areaLabel(f.page) ?? f.page})</span>}
                    {f.rating && <><span aria-hidden="true">·</span><span>{f.rating}/5</span></>}
                    <span className="ml-auto"><StatusPill value={f.status} /></span>
                  </div>
                  <p className="mt-1.5 line-clamp-4 whitespace-pre-wrap text-[13px] text-foreground">{f.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

export function SessionLog({ highlightId }: { highlightId?: string | null }) {
  const q = useBetaListMySessions();
  if (q.isLoading) {
    return <div className="space-y-2" aria-busy="true">{[0, 1].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />)}</div>;
  }
  if (q.isError) return <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />;
  const sessions = q.data ?? [];
  if (!sessions.length) {
    return <EmptyState icon={<History className="h-5 w-5" />} title="No sessions yet">Each time you open the sample workspace, its length and the feedback you sent appear here.</EmptyState>;
  }
  const total = sessions.reduce((n, s) => n + s.feedback.length, 0);
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" /> {sessions.length} {sessions.length === 1 ? "session" : "sessions"} · {total} {total === 1 ? "note" : "notes"} sent during sessions
      </p>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {sessions.map((s, i) => (
          <SessionRow key={s.id} s={s} highlight={s.id === highlightId} defaultOpen={s.id === highlightId || (i === 0 && !highlightId && s.feedback.length > 0)} />
        ))}
      </ul>
    </div>
  );
}
