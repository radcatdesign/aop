import { useEffect, useState } from "react";
import { ArrowRight, Compass, Database, Sparkles, Trash2 } from "lucide-react";
import type { BetaDataMode } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type SessionChoice = { mode: BetaDataMode; walkthrough: boolean };

const MODES: { id: BetaDataMode; icon: typeof Database; title: string; body: string }[] = [
  { id: "demo", icon: Database, title: "Demo data", body: "A sample practice already filled with invented clients, appointments, notes and invoices." },
  { id: "fresh", icon: Sparkles, title: "Fresh start", body: "An empty practice. Add your own made-up clients and appointments to test with." },
];

/**
 * The gate in front of every session: pick the starting data and confirm that
 * everything in the workspace is dummy content that is deleted at the end.
 */
export function StartSessionDialog({ open, onOpenChange, initial, onStart }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: SessionChoice;
  onStart: (choice: SessionChoice) => void;
}) {
  const [mode, setMode] = useState<BetaDataMode>(initial.mode);
  const [walkthrough, setWalkthrough] = useState(initial.walkthrough);
  const [understood, setUnderstood] = useState(false);

  // Each opening starts from the suggested choice and an unticked box.
  useEffect(() => {
    if (!open) return;
    setMode(initial.mode); setWalkthrough(initial.walkthrough); setUnderstood(false);
  }, [open, initial.mode, initial.walkthrough]);

  const withTour = mode === "demo" && walkthrough;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl" data-testid="dialog-start-session">
        <DialogHeader>
          <DialogTitle className="text-lg">Start a session</DialogTitle>
          <DialogDescription className="text-body">Choose what your practice starts with. You can start a new session any time.</DialogDescription>
        </DialogHeader>

        <fieldset className="mt-1">
          <legend className="sr-only">Starting data</legend>
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
            {MODES.map((m) => {
              const on = mode === m.id;
              return (
                <button
                  key={m.id} type="button" role="radio" aria-checked={on} onClick={() => setMode(m.id)}
                  className={`rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${on ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/40"}`}
                  data-testid={`button-mode-${m.id}`}
                >
                  <span className="flex items-center gap-2 text-body font-semibold text-foreground">
                    <m.icon className="h-4 w-4 text-primary" aria-hidden="true" /> {m.title}
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">{m.body}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {mode === "demo" ? (
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3.5 text-body">
            <Checkbox checked={walkthrough} onCheckedChange={(v) => setWalkthrough(v === true)} className="mt-0.5" data-testid="checkbox-walkthrough" />
            <span>
              <span className="flex items-center gap-1.5 font-medium"><Compass className="h-4 w-4 text-primary" aria-hidden="true" /> Guide me through it step by step</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">A walkthrough of every page, one step at a time. At the end you choose to keep the demo data or start fresh.</span>
            </span>
          </label>
        ) : (
          <p className="rounded-lg border border-border bg-background p-3.5 text-sm text-muted-foreground">
            Tip: start by adding a client under <span className="font-medium text-foreground">Clients</span>. Booking, notes, charting and invoices all need one.
          </p>
        )}

        <div className="rounded-lg border border-[hsl(40_55%_82%)] bg-[hsl(40_70%_97%)] p-4 text-[hsl(40_40%_26%)]" role="note">
          <p className="flex items-center gap-2 text-body font-semibold"><Trash2 className="h-4 w-4" aria-hidden="true" /> Everything here is dummy content</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
            <li>It's for testing only. Never enter real client or patient information.</li>
            <li>It all resets and is deleted when your session ends.</li>
            <li>Nothing is saved, and nothing carries over to your next session.</li>
          </ul>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3.5 text-body">
          <Checkbox checked={understood} onCheckedChange={(v) => setUnderstood(v === true)} className="mt-0.5" data-testid="checkbox-dummy-data" />
          <span>
            I understand this is dummy content only, it's deleted when the session ends, and I'm starting with{" "}
            <span className="font-semibold">{mode === "demo" ? "demo data" : "a fresh, empty practice"}</span>.
          </span>
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)} data-testid="button-cancel-start">Cancel</Button>
          <Button disabled={!understood} onClick={() => onStart({ mode, walkthrough: withTour })} data-testid="button-start-session">
            {withTour ? "Start the walkthrough" : mode === "demo" ? "Start with demo data" : "Start fresh"} <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
