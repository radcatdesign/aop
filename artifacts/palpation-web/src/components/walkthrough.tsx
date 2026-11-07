import { useEffect, useLayoutEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Database, Sparkles, X } from "lucide-react";
import type { BetaDataMode } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type Step = {
  id: string;
  /** Workspace page to open for this step (legacy NAV id). */
  view?: string;
  /** Element to ring. Missing or hidden targets just skip the ring. */
  target?: string;
  eyebrow: string;
  title: string;
  body: string;
  howTo?: string[];
};

// Copy matches the real button labels in legacy/App.jsx.
export const WALKTHROUGH_STEPS: Step[] = [
  {
    id: "welcome", view: "today", eyebrow: "Welcome", title: "Here's how your practice workspace works",
    body: "This walkthrough takes you through every page, one step at a time. It's a made-up massage practice with invented clients, so click anything you like.",
    howTo: ["Use Next and Back to move. Each step opens its page for you.", "You can try things while this card is open.", "Skip any time. You can replay it from the beta home."],
  },
  {
    id: "navigate", view: "today", target: "[data-tour=nav]", eyebrow: "Getting around", title: "Everything lives in the sidebar",
    body: "Pages are grouped the way a practice day runs: Overview, Front office, Clinical, Billing, Practice and Tools.",
    howTo: ["Click any item to open that page.", "Press ⌘K (Ctrl+K on Windows) to search pages and clients.", "On a phone, use the tab bar at the bottom or the menu button."],
  },
  {
    id: "today", view: "today", target: "[data-tour=nav-today]", eyebrow: "Overview", title: "Today: your day at a glance",
    body: "Revenue collected, today's appointments, visit completion and who's on the clock, plus what needs your attention.",
    howTo: ["Check Needs your attention for unpaid invoices and missing consent forms.", "Click an appointment in Today's schedule to open it.", "Use New appointment to book straight from here."],
  },
  {
    id: "reports", view: "reports", target: "[data-tour=nav-reports]", eyebrow: "Overview", title: "Reports: how the practice is doing",
    body: "Revenue against your monthly target, note compliance, cancellations and room use.",
    howTo: ["Switch between 3, 6 and 12 months.", "Click Export CSV to take the numbers into a spreadsheet."],
  },
  {
    id: "schedule", view: "schedule", target: "[data-tour=nav-schedule]", eyebrow: "Front office", title: "Schedule: book and manage appointments",
    body: "Every appointment by provider, room and status.",
    howTo: ["Click New appointment, pick the client, provider, time and room, then Book appointment.", "Open an appointment to check the client in, complete the visit or cancel it.", "Calendar sync shows how Google, Outlook and Apple calendars connect."],
  },
  {
    id: "clients", view: "clients", target: "[data-tour=nav-clients]", eyebrow: "Front office", title: "Clients: everyone you see, in one place",
    body: "Each person is a client (walk-in or self-referred) or a patient (referred by a doctor). Patients carry a referring physician, which shapes notes, documents and reports.",
    howTo: ["Click New client and choose Client or Patient under Type.", "Open someone to see their appointments, notes, invoices and documents together.", "Book, message or invoice them from their page."],
  },
  {
    id: "messages", view: "messages", target: "[data-tour=nav-messages]", eyebrow: "Front office", title: "Messages: clients and team",
    body: "Conversations with clients and providers, with attachments.",
    howTo: ["Pick a conversation on the left and type a reply.", "Click New to start a conversation.", "Use the paperclip to attach a file."],
  },
  {
    id: "soap", view: "soap", target: "[data-tour=nav-soap]", eyebrow: "Clinical", title: "SOAP Notes: document every visit",
    body: "Completed visits without a finished note show up here as drafts.",
    howTo: ["Open a draft, or click New note and choose the client.", "Fill in Subjective, Objective, Assessment and Plan.", "Click Lock note when it's final. A locked note can't change until you unlock it."],
  },
  {
    id: "charting", view: "charting", target: "[data-tour=nav-charting]", eyebrow: "Clinical", title: "Charting: map findings on the body",
    body: "Record where you found tension, trigger points or restrictions, how severe they are, and how they change over time.",
    howTo: ["Pick a client, then tap a structure on the body chart or search the atlas.", "Use the Anterior / Posterior switch above the body to flip front and back (or press F). Each side shows how many findings it has.", "Set severity, add a note and save the finding. For patients, build the monthly report to the referring doctor here."],
  },
  {
    id: "documents", view: "documents", target: "[data-tour=nav-documents]", eyebrow: "Clinical", title: "Documents: paperwork, filed by client",
    body: "Prescriptions, intake forms, physician notes and consent forms in one place.",
    howTo: ["Click Upload document to file something to a client.", "Open a document to see who sent it, then download it.", "Use made-up files only. Never upload real paperwork."],
  },
  {
    id: "payments", view: "payments", target: "[data-tour=nav-payments]", eyebrow: "Billing", title: "Payments: check out and collect",
    body: "What's been collected, what's outstanding, and every invoice's status.",
    howTo: ["Find an invoice marked Due and click Charge.", "Add a tip and complete the payment. It's a demo, so no money moves.", "Click New invoice to bill for a visit or a product."],
  },
  {
    id: "invoicing", view: "invoicing", target: "[data-tour=nav-invoicing]", eyebrow: "Billing", title: "Invoicing: what you're owed and what you owe",
    body: "Accounts receivable from clients and accounts payable for the practice's own bills, like rent and supplies.",
    howTo: ["Create an invoice from your services and products.", "Mark an invoice paid, or void it.", "Set your invoice number prefix, payment terms and receipt note under Invoice defaults."],
  },
  {
    id: "payroll", view: "payroll", target: "[data-tour=nav-payroll]", eyebrow: "Billing", title: "Payroll: hours and pay in one ledger",
    body: "Hours, commission and tips for each provider, without a separate spreadsheet.",
    howTo: ["Click Clock in (PIN) for a provider who's off the clock. Demo PINs: Dana 1004, Marcus 2231, Priya 7782.", "Review each provider's hours and pay.", "Click Run payroll, then export a CSV or a QuickBooks file."],
  },
  {
    id: "academy", view: "academy", target: "[data-tour=nav-academy]", eyebrow: "Practice", title: "Academy: continuing education",
    body: "Each provider's CE hours against what their license needs, and a course catalog.",
    howTo: ["Click Enroll on a course and choose who it's for.", "Use Log external CE for hours earned elsewhere.", "Upcoming license renewals also show under Needs your attention on Today."],
  },
  {
    id: "settings", view: "settings", target: "[data-tour=nav-settings]", eyebrow: "Practice", title: "Settings: practice and team",
    body: "Your practice profile, your team and your subscription.",
    howTo: ["Edit the practice name and contact details, then Save profile.", "Click Add provider to add a team member with their pay setup.", "Edit or remove a provider from their row."],
  },
  {
    id: "flows", view: "flows", target: "[data-tour=nav-flows]", eyebrow: "Tools", title: "Flows: routines, one step at a time",
    body: "Guided checklists for routines like intake to checkout, so nothing gets skipped.",
    howTo: ["Click Run on a flow and follow each step.", "On any step, use Report an issue or Give feedback. It comes straight to us.", "Click New flow to build your own."],
  },
  {
    id: "kiosk", view: "kiosk", target: "[data-tour=kiosk]", eyebrow: "Tools", title: "Field App and Kiosk Mode",
    body: "A tablet view for the front desk, events and on-site work: check-in, intake and quick assessments.",
    howTo: ["Click Kiosk Mode at the top to open it full screen.", "Close it to come back to the office view."],
  },
  {
    id: "feedback", target: "[data-testid=button-workspace-feedback]", eyebrow: "Your feedback", title: "Tell us what works and what doesn't",
    body: "This is what the beta is for. Short, specific notes help most.",
    howTo: ["Click Feedback in the bar at the top. We note which page you're on.", "Pick the area, and the specific spot if you can.", "Click End session when you're done. Your session log shows how long it ran and what you sent."],
  },
];

function useTargetRect(selector: string | undefined, stepId: string) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    if (!selector) { setRect(null); return; }
    let el: Element | null = null;
    const measure = () => {
      el = document.querySelector(selector);
      const r = el?.getBoundingClientRect();
      setRect(r && r.width > 0 && r.height > 0 ? r : null);
    };
    // Let the page switch render first, then bring the target into view.
    const t = window.setTimeout(() => {
      measure();
      (el as HTMLElement | null)?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
      measure();
    }, 120);
    const timer = window.setInterval(measure, 400);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => { window.clearTimeout(t); window.clearInterval(timer); window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure, true); };
  }, [selector, stepId]);
  return rect;
}

export function Walkthrough({ onNavigate, onSkip, onFinish }: {
  onNavigate: (view: string) => void;
  onSkip: () => void;
  onFinish: (choice: BetaDataMode) => void;
}) {
  const total = WALKTHROUGH_STEPS.length + 1; // + the "your turn" choice
  const [i, setI] = useState(0);
  const [understood, setUnderstood] = useState(false);
  const step = WALKTHROUGH_STEPS[i];
  const isChoice = i === WALKTHROUGH_STEPS.length;
  const rect = useTargetRect(isChoice ? undefined : step?.target, step?.id ?? "choice");

  useEffect(() => { if (step?.view) onNavigate(step.view); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const pad = 6;
  return (
    <>
      {rect && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[99998] rounded-xl border-2 border-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.18)] transition-all duration-200"
          style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
        />
      )}
      <section
        role="dialog" aria-modal="false" aria-labelledby="walkthrough-title"
        className="fixed inset-x-3 bottom-3 z-[100000] max-h-[70dvh] overflow-y-auto rounded-2xl border border-border bg-card p-5 font-sans text-foreground shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[420px]"
        data-testid="walkthrough"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{isChoice ? "Your turn" : step.eyebrow}</span>
          <span className="flex items-center gap-3">
            <span className="text-caption tabular-nums text-muted-foreground" data-testid="text-walkthrough-progress">Step {i + 1} of {total}</span>
            {!isChoice && (
              <button type="button" onClick={onSkip} className="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Skip the walkthrough" data-testid="button-walkthrough-skip">
                <X className="h-4 w-4" />
              </button>
            )}
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((i + 1) / total) * 100}%` }} />
        </div>

        {!isChoice ? (
          <>
            <h2 id="walkthrough-title" className="mt-4 text-lg font-semibold leading-snug">{step.title}</h2>
            <p className="mt-2 text-body leading-relaxed text-muted-foreground">{step.body}</p>
            {step.howTo && (
              <ol className="mt-3 space-y-2">
                {step.howTo.map((h, n) => (
                  <li key={h} className="flex gap-2.5 text-body leading-snug">
                    <span className="mt-px grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-primary">{n + 1}</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-5 flex items-center justify-between gap-2">
              <Button variant="ghost" size="sm" disabled={i === 0} onClick={() => setI(i - 1)} data-testid="button-walkthrough-back">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button size="sm" onClick={() => setI(i + 1)} data-testid="button-walkthrough-next">
                {i === WALKTHROUGH_STEPS.length - 1 ? "Finish" : "Next"} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 id="walkthrough-title" className="mt-4 text-lg font-semibold leading-snug">Now try your own version</h2>
            <p className="mt-2 text-body leading-relaxed text-muted-foreground">
              Run through a real day the way your practice works. Keep exploring this demo data, or start fresh with an empty practice and add your own made-up clients and appointments.
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border border-[hsl(40_55%_82%)] bg-[hsl(40_70%_97%)] p-3 text-sm leading-relaxed text-[hsl(40_40%_26%)]">
              <Checkbox checked={understood} onCheckedChange={(v) => setUnderstood(v === true)} className="mt-0.5" data-testid="checkbox-walkthrough-dummy" />
              <span>I understand either way it's dummy content only. It's deleted when this session ends and nothing is saved.</span>
            </label>
            <div className="mt-3 grid gap-2">
              <button
                type="button" disabled={!understood} onClick={() => onFinish("demo")}
                className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5 text-left transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="button-walkthrough-keep-demo"
              >
                <Database className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                <span><span className="block text-body font-semibold">Keep the demo data</span><span className="block text-sm text-muted-foreground">Carry on with the sample practice as it is now.</span></span>
              </button>
              <button
                type="button" disabled={!understood} onClick={() => onFinish("fresh")}
                className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5 text-left transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="button-walkthrough-fresh"
              >
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                <span><span className="block text-body font-semibold">Start fresh</span><span className="block text-sm text-muted-foreground">Clear the demo data and begin with an empty practice. Start by adding a client.</span></span>
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setI(i - 1)}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
              <span className="flex items-center gap-1 text-caption text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary" /> Walkthrough complete</span>
            </div>
          </>
        )}
      </section>
    </>
  );
}
