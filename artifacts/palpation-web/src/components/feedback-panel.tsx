import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquareText, ShieldAlert, Star } from "lucide-react";
import {
  getBetaListMyFeedbackQueryKey,
  useBetaListMyFeedback,
  useBetaSubmitFeedback,
  type BetaFeedbackCategory,
  type BetaScreen,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { EmptyState, ErrorState, StatusPill, errorMessage, formatDate } from "@/components/beta-ui";

const CATEGORIES: { value: BetaFeedbackCategory; label: string; hint: string }[] = [
  { value: "bug", label: "Something broke", hint: "Bug" },
  { value: "idea", label: "An idea", hint: "Idea" },
  { value: "other", label: "Something else", hint: "Other" },
];

export function FeedbackForm({ screen, onDone, flowContext }: {
  screen: BetaScreen;
  onDone?: () => void;
  flowContext?: { label: string; reference: string; kind: "issue" | "feedback" };
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [category, setCategory] = useState<BetaFeedbackCategory>(flowContext?.kind === "issue" ? "bug" : "idea");
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);
  const submit = useBetaSubmitFeedback();
  const trimmed = message.trim();
  const fullMessage = flowContext ? `[Flow step ${flowContext.reference}]\n${trimmed}` : trimmed;
  const invalid = trimmed.length === 0 || fullMessage.length > 4000;

  const send = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (invalid) return;
    submit.mutate(
      { data: { category, message: fullMessage, platform: "web", screen, ...(rating ? { rating } : {}) } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getBetaListMyFeedbackQueryKey() });
          setMessage(""); setRating(null); setTouched(false);
          toast({ title: "Feedback sent", description: "Thank you. You can follow its status below." });
          onDone?.();
        },
      },
    );
  };

  return (
    <form onSubmit={send} className="space-y-5" noValidate>
      {flowContext && (
        <p className="rounded-lg border border-border bg-secondary px-3 py-2 text-[12.5px] text-secondary-foreground">
          {flowContext.kind === "issue" ? "Reporting an issue with" : "Feedback on"}: {flowContext.label}
        </p>
      )}
      <div className="flex gap-3 rounded-lg border border-[hsl(40_55%_85%)] bg-[hsl(40_70%_97%)] p-3 text-[12.5px] leading-relaxed text-[hsl(40_40%_28%)]" role="note">
        <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span>Do not include patient or client information — no names, notes, contact details or payment amounts. Describe the tool, not the person.</span>
      </div>

      <fieldset>
        <legend className="mb-2 text-[12px] font-medium text-muted-foreground">Category</legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {CATEGORIES.map((c) => (
            <button
              key={c.value} type="button" role="radio" aria-checked={category === c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${category === c.value ? "border-primary bg-secondary text-secondary-foreground" : "border-border bg-card text-foreground hover:border-primary/40"}`}
              data-testid={`button-category-${c.value}`}
            >
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{c.hint}</span>
              <span className="mt-0.5 block text-[12.5px] font-medium">{c.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-[12px] font-medium text-muted-foreground">How did it feel? <span className="font-normal">(optional)</span></legend>
        <div className="flex items-center gap-1" role="radiogroup">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} of 5`}
              onClick={() => setRating(rating === n ? null : n)}
              className="rounded p-1 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid={`button-rating-${n}`}
            >
              <Star className={`h-5 w-5 ${rating && n <= rating ? "fill-current" : "opacity-35"}`} />
            </button>
          ))}
          {rating && <span className="ml-2 text-[12px] text-muted-foreground">{rating} of 5</span>}
        </div>
      </fieldset>

      <div>
        <Label htmlFor="fb-message" className="text-[12px] font-medium text-muted-foreground">What happened, or what would help?</Label>
        <Textarea
          id="fb-message" rows={5} value={message} maxLength={4000}
          onChange={(e) => setMessage(e.target.value)} onBlur={() => setTouched(true)}
          aria-invalid={touched && invalid}
          className="mt-2" placeholder="e.g. On the schedule, dragging a booking to a new room didn't update the room label until I refreshed the view."
          data-testid="input-feedback-message"
        />
        <div className="mt-1 flex justify-between text-[11.5px]">
          <span className="text-destructive">{touched && trimmed.length === 0 ? "Please write a short message." : touched && invalid ? "Please shorten your message." : ""}</span>
          <span className="text-muted-foreground">{fullMessage.length}/4000</span>
        </div>
      </div>

      {submit.isError && <p role="alert" className="text-[13px] text-destructive">{errorMessage(submit.error, "We couldn't send your feedback. Please try again.")}</p>}

      <Button type="submit" disabled={submit.isPending} className="w-full sm:w-auto" data-testid="button-submit-feedback">
        {submit.isPending ? "Sending..." : "Send feedback"}
      </Button>
    </form>
  );
}

export function MyFeedbackList() {
  const q = useBetaListMyFeedback();
  if (q.isLoading) {
    return <div className="space-y-2" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div>;
  }
  if (q.isError) return <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />;
  const items = q.data ?? [];
  if (!items.length) {
    return <EmptyState icon={<MessageSquareText className="h-5 w-5" />} title="No feedback yet">When you send a note, it will appear here with its review status.</EmptyState>;
  }
  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {items.map((f) => (
        <li key={f.id} className="px-4 py-3.5" data-testid={`row-my-feedback-${f.id}`}>
          <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider">{f.category}</span>
            <span aria-hidden="true">·</span><span>{f.screen}</span>
            <span aria-hidden="true">·</span><span>{formatDate(f.createdAt)}</span>
            <span className="ml-auto"><StatusPill value={f.status} testId={`status-my-feedback-${f.id}`} /></span>
          </div>
          <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-[13px] text-foreground">{f.message}</p>
        </li>
      ))}
    </ul>
  );
}
