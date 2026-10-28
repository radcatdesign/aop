import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Link, Redirect, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Clock, FlaskConical, LogOut, ShieldCheck, ShieldOff, Hourglass, CircleSlash, LayoutDashboard, X } from "lucide-react";
import {
  getBetaGetMeQueryKey,
  useBetaAcknowledge,
  useBetaRecordEvent,
  type BetaEvent,
  type BetaMe,
  type BetaScreen,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brand, Eyebrow, FullPageSkeleton, errorMessage, errorStatus } from "@/components/beta-ui";
import { FeedbackForm, MyFeedbackList } from "@/components/feedback-panel";
import { useBetaMe } from "@/hooks/use-beta-me";
import { createSession } from "@/legacy/session.js";
import { setBetaListener } from "@/legacy/betaBridge.js";
import "@/legacy/security.css";

type FlowReport = { flowId: string; flowName: string; nodeId: string; nodeLabel: string; kind: "issue" | "feedback" };
type LegacyAppProps = { isAdmin: boolean; onOpenAdmin: () => void; onReportFlowStep: (report: FlowReport) => void };
const LegacyApp = lazy(() => import("@/legacy/App.jsx")) as ComponentType<LegacyAppProps>;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const ALLOWED_EVENTS: readonly BetaEvent[] = ["session_start", "screen_view", "assessment_saved", "checkout_demo"];
const ALLOWED_SCREENS: readonly BetaScreen[] = ["overview", "schedule", "clients", "notes", "billing", "settings", "other"];

function useSignOut() {
  const { signOut } = useClerk();
  const qc = useQueryClient();
  return () => { qc.clear(); void signOut({ redirectUrl: basePath || "/" }); };
}

function PortalFrame({ me, children }: { me?: BetaMe; children: ReactNode }) {
  const signOut = useSignOut();
  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Brand href="/beta" sub="Private beta" />
          <div className="flex items-center gap-2">
            {me?.role === "admin" && me.status === "approved" && (
              <Link href="/admin" className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-primary" data-testid="link-admin">
                <LayoutDashboard className="h-4 w-4" /> Admin
              </Link>
            )}
            {me && <span className="hidden text-[12.5px] text-muted-foreground sm:inline" data-testid="text-user-email">{me.email}</span>}
            <Button variant="ghost" size="sm" onClick={signOut} data-testid="button-sign-out"><LogOut className="mr-1.5 h-4 w-4" /> Sign out</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">{children}</main>
    </div>
  );
}

function BlockedView({ me, icon, eyebrow, title, children }: { me?: BetaMe; icon: ReactNode; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <PortalFrame me={me}>
      <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 sm:p-10" data-testid="status-blocked">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-primary">{icon}</span>
        <div className="mt-5"><Eyebrow>{eyebrow}</Eyebrow></div>
        <h1 className="mt-2 text-2xl font-medium tracking-tight">{title}</h1>
        <div className="mt-3 space-y-3 text-[13.5px] leading-relaxed text-muted-foreground">{children}</div>
      </section>
    </PortalFrame>
  );
}

function Acknowledge({ me }: { me: BetaMe }) {
  const qc = useQueryClient();
  const [checked, setChecked] = useState(false);
  const ack = useBetaAcknowledge({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getBetaGetMeQueryKey() }) },
  });
  return (
    <PortalFrame me={me}>
      <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 sm:p-10">
        <Eyebrow>Before you begin</Eyebrow>
        <h1 className="mt-2 text-2xl font-medium tracking-tight">Welcome, {me.name.split(" ")[0] || "there"}. One agreement first.</h1>
        <ul className="mt-6 space-y-3 text-[13.5px] leading-relaxed text-foreground/85">
          {[
            "The workspace contains synthetic, invented clients only. I will not enter real client or patient names, notes, contact details, health information or payment details.",
            "Everything in the workspace is held in browser memory and is discarded when I leave, after 5 minutes of inactivity, or after 30 minutes total.",
            "This beta is for evaluating tools. It is not a clinical record system and must not be used for care decisions.",
            "Anonymous usage signals (which area I open, and when a demo note or demo checkout is completed) are recorded to improve the product. No record contents are sent.",
          ].map((t) => (
            <li key={t} className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />{t}</li>
          ))}
        </ul>
        <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-4 text-[13.5px]">
          <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} className="mt-0.5" data-testid="checkbox-acknowledge" />
          <span>I understand this is a synthetic-data beta and I will not enter real patient information.</span>
        </label>
        {ack.isError && <p role="alert" className="mt-3 text-[13px] text-destructive">{errorMessage(ack.error, "We couldn't record your acknowledgment. Please try again.")}</p>}
        <Button className="mt-6" disabled={!checked || ack.isPending} onClick={() => ack.mutate()} data-testid="button-acknowledge">
          {ack.isPending ? "Saving..." : <>Agree and continue <ArrowRight className="ml-1.5 h-4 w-4" /></>}
        </Button>
      </section>
    </PortalFrame>
  );
}

function Home({ me, onOpen }: { me: BetaMe; onOpen: () => void }) {
  return (
    <PortalFrame me={me}>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        <section>
          <Eyebrow>Approved tester</Eyebrow>
          <h1 className="mt-2 text-[32px] font-medium leading-tight tracking-[-0.02em]">Your sample practice is ready.</h1>
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
            Open the office workspace to walk through scheduling, intake, SOAP charting and checkout with invented clients. It starts fresh every time.
          </p>
          <div className="mt-7 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] text-muted-foreground">
              <span className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-primary" /> Synthetic records only</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Closes after 5 min idle / 30 min total</span>
            </div>
            <Button size="lg" className="mt-5 w-full sm:w-auto" onClick={onOpen} data-testid="button-open-workspace">
              Open sample workspace <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-10">
            <h2 className="text-[15px] font-semibold">Your feedback</h2>
            <p className="mt-1 text-[12.5px] text-muted-foreground">Review status for each note you send appears here.</p>
            <div className="mt-4"><MyFeedbackList /></div>
          </div>
        </section>
        <section className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="text-[15px] font-semibold">Send feedback</h2>
          <p className="mt-1 mb-5 text-[12.5px] text-muted-foreground">Precise notes are the most useful ones.</p>
          <FeedbackForm screen="other" />
        </section>
      </div>
    </PortalFrame>
  );
}

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function Workspace({ onClose, isAdmin }: { onClose: (reason?: string) => void; isAdmin: boolean }) {
  const [, navigate] = useLocation();
  const record = useBetaRecordEvent();
  const recordRef = useRef(record.mutate);
  recordRef.current = record.mutate;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const screenRef = useRef<BetaScreen>("overview");
  const startedAt = useRef(Date.now());
  const [remaining, setRemaining] = useState(1_800_000);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [flowReport, setFlowReport] = useState<FlowReport | null>(null);
  const reportFlowStep = (report: FlowReport) => {
    setFlowReport(report);
    setFeedbackOpen(true);
  };
  // Only opaque step identifiers are attached to persisted feedback. Flow and
  // step names from user-created flows may contain sensitive text.
  const reference = flowReport
    ? `${/^[a-zA-Z0-9_-]{1,40}$/.test(flowReport.flowId) ? flowReport.flowId : "custom"}/${/^[a-zA-Z0-9_-]{1,40}$/.test(flowReport.nodeId) ? flowReport.nodeId : "step"}`
    : "";

  useEffect(() => {
    const send = (event: string, screen: string) => {
      if (!ALLOWED_EVENTS.includes(event as BetaEvent)) return;
      const s = (ALLOWED_SCREENS.includes(screen as BetaScreen) ? screen : "other") as BetaScreen;
      if (event === "screen_view") screenRef.current = s;
      // Only enum values are sent: never names, notes, route params or amounts.
      recordRef.current({ data: { event: event as BetaEvent, platform: "web", screen: s } });
    };
    const off = setBetaListener(send);
    send("session_start", "overview");
    return off;
  }, []);

  useEffect(() => {
    const session = createSession(Date.now());
    const expire = () => onCloseRef.current("Your sample workspace closed for inactivity or time limit. Nothing was kept.");
    const check = () => {
      if (!session.active(Date.now())) expire();
      else setRemaining(1_800_000 - (Date.now() - startedAt.current));
    };
    const activity = () => { if (!session.touch(Date.now())) expire(); };
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    events.forEach((n) => window.addEventListener(n, activity, true));
    window.addEventListener("focus", check);
    window.addEventListener("pageshow", check);
    document.addEventListener("visibilitychange", check);
    const timer = window.setInterval(check, 1000);
    return () => {
      events.forEach((n) => window.removeEventListener(n, activity, true));
      window.removeEventListener("focus", check);
      window.removeEventListener("pageshow", check);
      document.removeEventListener("visibilitychange", check);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <>
      <aside className="demo-notice" aria-label="Beta workspace status" style={{ gap: 14 }}>
        <span>Private beta · Synthetic data only · Closes in <span className="tabular-nums" data-testid="text-session-remaining">{fmt(remaining)}</span></span>
        <button type="button" onClick={() => { setFlowReport(null); setFeedbackOpen(true); }} data-testid="button-workspace-feedback">Feedback</button>
        <button type="button" onClick={() => onClose()} data-testid="button-end-session">End session</button>
      </aside>
      <div className="demo-content">
        <Suspense fallback={<FullPageSkeleton label="Opening your sample workspace" />}>
          <LegacyApp isAdmin={isAdmin} onOpenAdmin={() => { onClose(); navigate("/admin"); }} onReportFlowStep={reportFlowStep} />
        </Suspense>
      </div>
      <Dialog open={feedbackOpen} onOpenChange={(v) => { setFeedbackOpen(v); if (!v) setFlowReport(null); }}>
        <DialogContent className="z-[100001] max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{flowReport?.kind === "issue" ? "Report a step issue" : "Send feedback"}</DialogTitle>
            <DialogDescription>We'll note the step reference, not sample records. Please do not include any patient or client information.</DialogDescription>
          </DialogHeader>
          <FeedbackForm key={flowReport ? `${reference}:${flowReport.kind}` : "general"} screen={flowReport ? "other" : screenRef.current} flowContext={flowReport ? { label: `${flowReport.flowName} · ${flowReport.nodeLabel}`, reference, kind: flowReport.kind } : undefined} onDone={() => { setFeedbackOpen(false); setFlowReport(null); }} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function BetaPortal() {
  const me = useBetaMe();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const allowed = me.data?.status === "approved" && me.data.acknowledged;
  // Fail closed: any change in access immediately unmounts the workspace (and its memory).
  useEffect(() => { if (!allowed || me.isError) setOpen(false); }, [allowed, me.isError]);

  if (me.isLoading) return <FullPageSkeleton label="Checking your beta access" />;

  if (me.isError || !me.data) {
    const s = errorStatus(me.error);
    if (s === 401) return <Redirect to="/sign-in" />;
    if (s === 403 || s === 404) {
      return (
        <BlockedView icon={<ShieldOff className="h-5 w-5" />} eyebrow="No beta access" title="We don't have an approved request for this email.">
          <p>Beta access is matched to the verified email you sign in with. If you requested an invite with a different address, sign out and sign up with that one.</p>
          <p>Haven't requested yet? <Link href="/" className="font-medium text-primary hover:underline" data-testid="link-request-access">Request an invite</Link> using this email.</p>
        </BlockedView>
      );
    }
    return (
      <BlockedView icon={<ShieldOff className="h-5 w-5" />} eyebrow="Connection problem" title="We couldn't confirm your access.">
        <p>For your protection the workspace stays closed until we can verify your account.</p>
        <Button variant="outline" size="sm" onClick={() => me.refetch()} data-testid="button-retry-access">Try again</Button>
      </BlockedView>
    );
  }

  const user = me.data;
  if (user.status === "pending") {
    return (
      <BlockedView me={user} icon={<Hourglass className="h-5 w-5" />} eyebrow="Under review" title="Your request is waiting for review.">
        <p>We read every request by hand. We don't send automated emails — this page updates on its own once a decision is made, so check back any time.</p>
        <p>Make sure you signed up with the same email you used on the request form: <span className="font-medium text-foreground">{user.email}</span>.</p>
      </BlockedView>
    );
  }
  if (user.status === "rejected") {
    return (
      <BlockedView me={user} icon={<CircleSlash className="h-5 w-5" />} eyebrow="Not included this round" title="We can't offer a beta seat right now.">
        <p>The private beta is intentionally small. This isn't a judgment on your practice — we may reopen access as capacity grows.</p>
      </BlockedView>
    );
  }
  if (user.status === "suspended") {
    return (
      <BlockedView me={user} icon={<ShieldOff className="h-5 w-5" />} eyebrow="Access paused" title="Your beta access is suspended.">
        <p>Any open sample workspace has been closed. If you think this is a mistake, reply to the person who invited you.</p>
      </BlockedView>
    );
  }
  if (!user.acknowledged) return <Acknowledge me={user} />;

  if (open && allowed) return <Workspace isAdmin={user.role === "admin"} onClose={(reason) => { setOpen(false); setNotice(reason ?? null); window.scrollTo(0, 0); }} />;

  return (
    <>
      {notice && (
        <div role="status" className="fixed inset-x-0 top-3 z-50 mx-auto flex w-fit max-w-[92vw] items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-[13px] shadow-lg">
          {notice}
          <button type="button" aria-label="Dismiss" onClick={() => setNotice(null)} className="text-muted-foreground hover:text-foreground" data-testid="button-dismiss-notice"><X className="h-4 w-4" /></button>
        </div>
      )}
      <Home me={user} onOpen={() => { setNotice(null); setOpen(true); }} />
    </>
  );
}

