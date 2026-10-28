import { useMemo, useState, type ReactNode } from "react";
import { Link, Redirect } from "wouter";
import { useClerk } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, Copy, Inbox, LogOut, MessageSquareText, Search, ShieldOff, Users, Activity } from "lucide-react";
import {
  getBetaAdminGetUsageQueryKey,
  getBetaAdminListFeedbackQueryKey,
  getBetaAdminListRequestsQueryKey,
  getBetaAdminListUsersQueryKey,
  getBetaGetMeQueryKey,
  useBetaAdminGetUsage,
  useBetaAdminListFeedback,
  useBetaAdminListRequests,
  useBetaAdminListUsers,
  useBetaAdminUpdateFeedback,
  useBetaAdminUpdateRequest,
  useBetaAdminUpdateUser,
  type BetaAccessRequest,
  type BetaAdminGetUsageDays,
  type BetaFeedback,
  type BetaFeedbackStatus,
  type BetaRequestStatus,
  type BetaUser,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useBetaMe } from "@/hooks/use-beta-me";
import { Brand, EmptyState, ErrorState, FullPageSkeleton, StatusPill, errorMessage, errorStatus, formatDate } from "@/components/beta-ui";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ListSkeleton() {
  return <div className="space-y-2 p-4" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />)}</div>;
}

function Toolbar({ search, setSearch, placeholder, children }: { search: string; setSearch: (v: string) => void; placeholder: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
      <label className="relative flex-1 sm:max-w-xs">
        <span className="sr-only">{placeholder}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={placeholder} className="pl-9" data-testid="input-search" />
      </label>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Filter({ value, onChange, options, label, testId }: { value: string; onChange: (v: string) => void; options: readonly string[]; label: string; testId: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[150px]" aria-label={label} data-testid={testId}><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o.replace("_", " ")}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

const match = (q: string, ...fields: string[]) => { const s = q.trim().toLowerCase(); return !s || fields.some((f) => f.toLowerCase().includes(s)); };

/* ------------------------------ Requests ------------------------------ */
function RequestsTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const q = useBetaAdminListRequests();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BetaRequestStatus | "all">("pending");
  const [open, setOpen] = useState<BetaAccessRequest | null>(null);
  const update = useBetaAdminUpdateRequest({
    mutation: {
      onSuccess: (r) => {
        qc.invalidateQueries({ queryKey: getBetaAdminListRequestsQueryKey() });
        qc.invalidateQueries({ queryKey: getBetaAdminListUsersQueryKey() });
        qc.invalidateQueries({ queryKey: getBetaAdminGetUsageQueryKey() });
        setOpen((o) => (o && o.id === r.id ? r : o));
        toast({ title: r.status === "pending" ? "Request reset to pending" : `Request ${r.status}`, description: r.status === "approved" ? "Share the sign-in link with them yourself — no email is sent." : undefined });
      },
      onError: (e) => toast({ title: "Update failed", description: errorMessage(e), variant: "destructive" }),
    },
  });
  const rows = useMemo(() => (q.data ?? []).filter((r) => (status === "all" || r.status === status) && match(search, r.name, r.email, r.practice, r.licenseNumber, r.role)), [q.data, status, search]);
  const signInLink = `${window.location.origin}${basePath}/sign-up`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(signInLink); toast({ title: "Sign-up link copied", description: "Remind them to use the same email they requested with." }); }
    catch { toast({ title: "Couldn't copy", description: signInLink, variant: "destructive" }); }
  };
  const act = (r: BetaAccessRequest, s: BetaRequestStatus) => update.mutate({ id: r.id, data: { status: s } });

  return (
    <div className="rounded-xl border border-border bg-card">
      <Toolbar search={search} setSearch={setSearch} placeholder="Search name, email, practice">
        <Filter value={status} onChange={(v) => setStatus(v as BetaRequestStatus | "all")} options={["pending", "approved", "rejected"] as const} label="Statuses" testId="select-request-status" />
        <Button variant="outline" size="sm" className="h-9" onClick={copy} data-testid="button-copy-link"><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy sign-up link</Button>
      </Toolbar>
      {q.isLoading ? <ListSkeleton /> : q.isError ? <div className="p-4"><ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} /></div> : !rows.length ? (
        <EmptyState icon={<Inbox className="h-5 w-5" />} title="No requests match">Try a different status or search.</EmptyState>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center" data-testid={`row-request-${r.id}`}>
              <button type="button" onClick={() => setOpen(r)} className="min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`button-open-request-${r.id}`}>
                <span className="flex items-center gap-2"><span className="truncate text-[13.5px] font-semibold">{r.name}</span><StatusPill value={r.status} /></span>
                <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">{r.email} · {r.practice} · {r.role} · {formatDate(r.createdAt)}</span>
              </button>
              <RequestActions r={r} act={act} busy={update.isPending} />
            </li>
          ))}
        </ul>
      )}
      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open && (
            <>
              <SheetHeader><SheetTitle>{open.name}</SheetTitle><SheetDescription>{open.email}</SheetDescription></SheetHeader>
              <dl className="mt-6 space-y-4 text-[13px]">
                {[["Practice", open.practice], ["License", open.licenseNumber || "Not provided"], ["Role", open.role], ["Requested", formatDate(open.createdAt)], ["Reviewed", formatDate(open.reviewedAt)]].map(([k, v]) => (
                  <div key={k}><dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="mt-0.5">{v}</dd></div>
                ))}
                <div><dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reason</dt><dd className="mt-1 whitespace-pre-wrap leading-relaxed">{open.reason}</dd></div>
                <div><dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</dt><dd className="mt-1"><StatusPill value={open.status} /></dd></div>
              </dl>
              <p className="mt-6 rounded-md bg-secondary p-3 text-[12.5px] leading-relaxed text-secondary-foreground">Approval does not send an email. Share the sign-up link yourself; they must sign up and verify <span className="font-semibold">{open.email}</span> exactly.</p>
              <div className="mt-5 flex flex-wrap gap-2"><RequestActions r={open} act={act} busy={update.isPending} /></div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function RequestActions({ r, act, busy }: { r: BetaAccessRequest; act: (r: BetaAccessRequest, s: BetaRequestStatus) => void; busy: boolean }) {
  return (
    <div className="flex flex-shrink-0 gap-2">
      {r.status !== "approved" && <Button size="sm" disabled={busy} onClick={() => act(r, "approved")} data-testid={`button-approve-${r.id}`}>Approve</Button>}
      {r.status !== "rejected" && <Button size="sm" variant="outline" disabled={busy} onClick={() => act(r, "rejected")} data-testid={`button-reject-${r.id}`}>Reject</Button>}
      {r.status !== "pending" && <Button size="sm" variant="ghost" disabled={busy} onClick={() => act(r, "pending")} data-testid={`button-reset-${r.id}`}>Reset</Button>}
    </div>
  );
}

/* -------------------------------- Users -------------------------------- */
function UsersTab({ selfId }: { selfId: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const q = useBetaAdminListUsers();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BetaUser["status"] | "all">("all");
  const [confirm, setConfirm] = useState<BetaUser | null>(null);
  const update = useBetaAdminUpdateUser({
    mutation: {
      onSuccess: (u) => {
        qc.invalidateQueries({ queryKey: getBetaAdminListUsersQueryKey() });
        qc.invalidateQueries({ queryKey: getBetaAdminGetUsageQueryKey() });
        if (u.id === selfId) qc.invalidateQueries({ queryKey: getBetaGetMeQueryKey() });
        toast({ title: "User updated", description: `${u.name} is now ${u.role}, ${u.status}.` });
      },
      onError: (e) => toast({ title: "Update failed", description: errorMessage(e), variant: "destructive" }),
    },
  });
  const rows = useMemo(() => (q.data ?? []).filter((u) => (status === "all" || u.status === status) && match(search, u.name, u.email)), [q.data, status, search]);

  return (
    <div className="rounded-xl border border-border bg-card">
      <Toolbar search={search} setSearch={setSearch} placeholder="Search name or email">
        <Filter value={status} onChange={(v) => setStatus(v as BetaUser["status"] | "all")} options={["pending", "approved", "rejected", "suspended"] as const} label="Statuses" testId="select-user-status" />
      </Toolbar>
      {q.isLoading ? <ListSkeleton /> : q.isError ? <div className="p-4"><ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} /></div> : !rows.length ? (
        <EmptyState icon={<Users className="h-5 w-5" />} title="No users match">Users appear after they sign up with an email that has a request.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead><tr className="border-b border-border bg-muted/40 text-left text-[11px] text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">User</th><th className="px-4 py-2.5 font-medium">Status</th><th className="px-4 py-2.5 font-medium">Role</th><th className="px-4 py-2.5 font-medium">Last seen</th><th className="px-4 py-2.5 font-medium"><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {rows.map((u) => {
                const self = u.id === selfId;
                return (
                  <tr key={u.id} data-testid={`row-user-${u.id}`}>
                    <td className="px-4 py-3"><div className="font-semibold">{u.name}{self && <span className="ml-2 text-[11px] font-normal text-muted-foreground">(you)</span>}</div><div className="text-[12px] text-muted-foreground">{u.email}</div></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><StatusPill value={u.status} />{u.status === "approved" && !u.acknowledged && <span className="text-[11px] text-muted-foreground">not acknowledged</span>}</div></td>
                    <td className="px-4 py-3">
                      <Select value={u.role} disabled={self || update.isPending} onValueChange={(v) => update.mutate({ id: u.id, data: { role: v as BetaUser["role"] } })}>
                        <SelectTrigger className="h-8 w-[110px]" aria-label={`Role for ${u.name}`} data-testid={`select-role-${u.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="tester">tester</SelectItem><SelectItem value="admin">admin</SelectItem></SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(u.lastSeenAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {u.status === "suspended" ? (
                        <Button size="sm" variant="outline" disabled={update.isPending} onClick={() => update.mutate({ id: u.id, data: { status: "approved" } })} data-testid={`button-reactivate-${u.id}`}>Reactivate</Button>
                      ) : u.status === "approved" ? (
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={self || update.isPending} onClick={() => setConfirm(u)} data-testid={`button-suspend-${u.id}`}>Suspend</Button>
                      ) : <span className="text-[12px] text-muted-foreground">Review request</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <AlertDialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend {confirm?.name}?</AlertDialogTitle>
            <AlertDialogDescription>Their open sample workspace will close within about 30 seconds. You can reactivate them later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-suspend">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirm) update.mutate({ id: confirm.id, data: { status: "suspended" } }); setConfirm(null); }} data-testid="button-confirm-suspend">Suspend</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------- Feedback ------------------------------- */
function FeedbackTab() {
  const q = useBetaAdminListFeedback();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<BetaFeedback["category"] | "all">("all");
  const [status, setStatus] = useState<BetaFeedbackStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const rows = useMemo(() => (q.data ?? []).filter((f) => (cat === "all" || f.category === cat) && (status === "all" || f.status === status) && match(search, f.message, f.userName, f.userEmail)), [q.data, cat, status, search]);
  const open = (q.data ?? []).find((f) => f.id === openId) ?? null;

  return (
    <div className="rounded-xl border border-border bg-card">
      <Toolbar search={search} setSearch={setSearch} placeholder="Search message or tester">
        <Filter value={cat} onChange={(v) => setCat(v as BetaFeedback["category"] | "all")} options={["bug", "idea", "other"] as const} label="Categories" testId="select-feedback-category" />
        <Filter value={status} onChange={(v) => setStatus(v as BetaFeedbackStatus | "all")} options={["new", "in_review", "resolved"] as const} label="Statuses" testId="select-feedback-status" />
      </Toolbar>
      {q.isLoading ? <ListSkeleton /> : q.isError ? <div className="p-4"><ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} /></div> : !rows.length ? (
        <EmptyState icon={<MessageSquareText className="h-5 w-5" />} title="No feedback here">Adjust filters, or wait for testers to write in.</EmptyState>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((f) => (
            <li key={f.id}>
              <button type="button" onClick={() => setOpenId(f.id)} className="w-full px-4 py-3.5 text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" data-testid={`row-feedback-${f.id}`}>
                <span className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider">{f.category}</span><span>·</span><span>{f.userName}</span><span>·</span><span>{f.screen} / {f.platform}</span>{f.rating && <><span>·</span><span>{f.rating}/5</span></>}<span>·</span><span>{formatDate(f.createdAt)}</span>
                  <span className="ml-auto"><StatusPill value={f.status} /></span>
                </span>
                <span className="mt-1 line-clamp-2 block text-[13px] text-foreground">{f.message}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Sheet open={!!open} onOpenChange={(v) => !v && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">{open && <FeedbackDetail key={open.id} f={open} />}</SheetContent>
      </Sheet>
    </div>
  );
}

function FeedbackDetail({ f }: { f: BetaFeedback }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [status, setStatus] = useState<BetaFeedbackStatus>(f.status);
  const [note, setNote] = useState(f.adminNote ?? "");
  const update = useBetaAdminUpdateFeedback({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getBetaAdminListFeedbackQueryKey() }); toast({ title: "Feedback updated" }); },
      onError: (e) => toast({ title: "Update failed", description: errorMessage(e), variant: "destructive" }),
    },
  });
  const dirty = status !== f.status || note !== (f.adminNote ?? "");
  return (
    <>
      <SheetHeader><SheetTitle className="capitalize">{f.category} from {f.userName}</SheetTitle><SheetDescription>{f.userEmail} · {f.screen} / {f.platform} · {formatDate(f.createdAt)}{f.rating ? ` · ${f.rating}/5` : ""}</SheetDescription></SheetHeader>
      <p className="mt-6 whitespace-pre-wrap rounded-lg border border-border bg-background p-4 text-[13.5px] leading-relaxed">{f.message}</p>
      <div className="mt-6 space-y-4">
        <div>
          <label className="text-[12px] font-medium text-muted-foreground" htmlFor="fb-status">Status</label>
          <Select value={status} onValueChange={(v) => setStatus(v as BetaFeedbackStatus)}>
            <SelectTrigger id="fb-status" className="mt-1.5" data-testid="select-feedback-detail-status"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="new">new</SelectItem><SelectItem value="in_review">in review</SelectItem><SelectItem value="resolved">resolved</SelectItem></SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[12px] font-medium text-muted-foreground" htmlFor="fb-note">Admin note <span className="font-normal">(private, admins only)</span></label>
          <Textarea id="fb-note" rows={4} maxLength={4000} value={note} onChange={(e) => setNote(e.target.value)} className="mt-1.5" data-testid="input-admin-note" />
        </div>
        <Button disabled={!dirty || update.isPending} onClick={() => update.mutate({ id: f.id, data: { status, adminNote: note } })} data-testid="button-save-feedback">{update.isPending ? "Saving..." : "Save changes"}</Button>
      </div>
    </>
  );
}

/* -------------------------------- Usage -------------------------------- */
const FEATURE_LABEL: Record<string, string> = { session_start: "Sessions started", screen_view: "Screen views", assessment_saved: "Assessments saved", checkout_demo: "Demo checkouts" };

function UsageTab() {
  const [days, setDays] = useState<BetaAdminGetUsageDays>(30);
  const q = useBetaAdminGetUsage({ days }, { query: { queryKey: getBetaAdminGetUsageQueryKey({ days }) } });
  const u = q.data;
  const maxFeature = Math.max(1, ...(u?.features ?? []).map((f) => f.count));
  const totalPlatform = Math.max(1, (u?.platforms ?? []).reduce((a, p) => a + p.count, 0));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] text-muted-foreground">Counts come directly from recorded beta events.</p>
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5" role="radiogroup" aria-label="Time range">
          {([7, 30, 90] as const).map((d) => (
            <button key={d} type="button" role="radio" aria-checked={days === d} onClick={() => setDays(d)} className={`rounded-md px-3 py-1.5 text-[12px] font-medium ${days === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`} data-testid={`button-days-${d}`}>{d}d</button>
          ))}
        </div>
      </div>
      {q.isLoading ? <ListSkeleton /> : q.isError || !u ? <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} /> : (
        <>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card md:grid-cols-3 lg:grid-cols-6">
            {([["Requests", u.totals.requests], ["Pending", u.totals.pendingRequests], ["Approved users", u.totals.approvedUsers], ["Active users", u.totals.activeUsers], ["Sessions", u.totals.sessions], ["Feedback", u.totals.feedback]] as const).map(([k, v]) => (
              <div key={k} className="border-b border-r border-border p-4">
                <div className="text-[11.5px] text-muted-foreground">{k}</div>
                <div className="mt-1 text-[26px] font-medium tabular-nums tracking-tight" data-testid={`text-total-${k.toLowerCase().replace(" ", "-")}`}>{v.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-[13.5px] font-semibold">Daily activity</h3>
            {u.daily.length === 0 ? <EmptyState icon={<Activity className="h-5 w-5" />} title="No activity in this range" /> : (
              <div className="mt-4 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={u.daily} margin={{ left: -18, right: 8, top: 6 }}>
                    <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(d: string) => d.slice(5)} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                    <Area type="monotone" dataKey="events" name="Events" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3) / 0.15)" />
                    <Area type="monotone" dataKey="activeUsers" name="Active users" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.12)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-[13.5px] font-semibold">Features</h3>
              {u.features.length === 0 ? <p className="mt-3 text-[13px] text-muted-foreground">No feature events yet.</p> : (
                <ul className="mt-4 space-y-3">{u.features.map((f) => (
                  <li key={f.event}><div className="flex justify-between text-[12.5px]"><span>{FEATURE_LABEL[f.event] ?? f.event}</span><span className="tabular-nums text-muted-foreground">{f.count.toLocaleString()}</span></div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded bg-muted"><div className="h-full rounded bg-primary/70" style={{ width: `${(f.count / maxFeature) * 100}%` }} /></div></li>
                ))}</ul>
              )}
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-[13.5px] font-semibold">Platforms</h3>
              {u.platforms.length === 0 ? <p className="mt-3 text-[13px] text-muted-foreground">No platform data yet.</p> : (
                <ul className="mt-4 space-y-3">{u.platforms.map((p) => (
                  <li key={p.platform} className="flex items-center justify-between text-[13px]"><span className="capitalize">{p.platform}</span><span className="tabular-nums text-muted-foreground">{p.count.toLocaleString()} · {((p.count / totalPlatform) * 100).toFixed(1)}%</span></li>
                ))}</ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------- Page -------------------------------- */
export default function AdminPage() {
  const me = useBetaMe();
  const { signOut } = useClerk();
  const qc = useQueryClient();

  if (me.isLoading) return <FullPageSkeleton label="Checking admin access" />;
  if (errorStatus(me.error) === 401) return <Redirect to="/sign-in" />;
  // Fail closed: anything other than a confirmed approved admin sees no admin UI.
  if (me.isError || !me.data || me.data.role !== "admin" || me.data.status !== "approved") {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-background px-6">
        <div className="max-w-md text-center">
          <ShieldOff className="mx-auto h-6 w-6 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-medium">Admin access required</h1>
          <p className="mt-2 text-[13.5px] text-muted-foreground">{me.isError && errorStatus(me.error) !== 403 ? "We couldn't verify your access right now." : "This area is limited to beta administrators."}</p>
          <div className="mt-5 flex justify-center gap-2">
            {me.isError && <Button variant="outline" size="sm" onClick={() => me.refetch()} data-testid="button-retry-admin">Try again</Button>}
            <Link href="/beta" className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground" data-testid="link-back-beta">Back to beta</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Brand href="/admin" sub="App administration" />
          <div className="flex items-center gap-1">
            <Link href="/beta" className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-primary" data-testid="link-portal"><ArrowLeft className="h-4 w-4" /> Portal</Link>
            <Button variant="ghost" size="sm" onClick={() => { qc.clear(); void signOut({ redirectUrl: basePath || "/" }); }} data-testid="button-sign-out"><LogOut className="mr-1.5 h-4 w-4" /> Sign out</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <h1 className="text-[26px] font-medium tracking-tight">App administration</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Manage signed-in app accounts, review access requests and feedback, and view usage. The synthetic practice staff roster is sample data, not login accounts. Approvals do not send email — share the sign-up link yourself.</p>
        <Tabs defaultValue="users" className="mt-6">
          <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0 sm:w-auto">
            {[["requests", "Requests"], ["users", "Users"], ["feedback", "Feedback"], ["usage", "Usage"]].map(([v, l]) => (
              <TabsTrigger key={v} value={v} className="rounded-md border border-transparent px-3.5 py-1.5 data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:shadow-sm" data-testid={`tab-${v}`}>{l}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="requests"><RequestsTab /></TabsContent>
          <TabsContent value="users"><UsersTab selfId={me.data.id} /></TabsContent>
          <TabsContent value="feedback"><FeedbackTab /></TabsContent>
          <TabsContent value="usage"><UsageTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
