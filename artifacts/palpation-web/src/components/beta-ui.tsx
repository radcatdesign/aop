import type { ReactNode } from "react";
import { Link } from "wouter";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function errorStatus(err: unknown): number | undefined {
  if (err && typeof err === "object" && "status" in err) {
    const s = (err as { status?: unknown }).status;
    return typeof s === "number" ? s : undefined;
  }
  return undefined;
}

export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err && typeof err === "object" && "data" in err) {
    const d = (err as { data?: unknown }).data;
    if (d && typeof d === "object" && "error" in d && typeof (d as { error: unknown }).error === "string") {
      return (d as { error: string }).error;
    }
  }
  return fallback;
}

export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-grid place-items-center rounded-[10px] bg-primary text-primary-foreground font-semibold"
      style={{ width: size, height: size + 3, fontSize: size * 0.42 }}
    >
      a
    </span>
  );
}

export function Brand({ href = "/", sub }: { href?: string; sub?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="link-home">
      <BrandMark />
      <span className="leading-tight">
        <span className="flex items-center gap-1.5 text-[15px] font-semibold tracking-tight text-foreground">
          Art of Palpation
          {/* Product name isn't final yet. */}
          <span className="rounded-[4px] border border-border px-1 py-px text-[9px] font-semibold uppercase leading-none tracking-[0.12em] text-muted-foreground" title="Name to be decided">TBD</span>
        </span>
        {sub && <span className="block text-[9.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{sub}</span>}
      </span>
    </Link>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-primary/80">{children}</span>;
}

export function ErrorState({ title = "We couldn't load this", message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center" data-testid="status-error">
      <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {message && <p className="mt-1 text-[13px] text-muted-foreground">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-retry">
          <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full border border-border bg-secondary text-primary">{icon}</span>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {children && <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">{children}</p>}
    </div>
  );
}

const TONES: Record<string, string> = {
  pending: "bg-[hsl(40_70%_95%)] text-[hsl(40_62%_32%)] border-[hsl(40_55%_85%)]",
  new: "bg-[hsl(40_70%_95%)] text-[hsl(40_62%_32%)] border-[hsl(40_55%_85%)]",
  approved: "bg-secondary text-secondary-foreground border-[hsl(150_30%_86%)]",
  resolved: "bg-secondary text-secondary-foreground border-[hsl(150_30%_86%)]",
  in_review: "bg-[hsl(200_40%_95%)] text-[hsl(200_40%_32%)] border-[hsl(200_30%_86%)]",
  rejected: "bg-[hsl(3_60%_96%)] text-[hsl(3_40%_42%)] border-[hsl(3_40%_88%)]",
  suspended: "bg-[hsl(3_60%_96%)] text-[hsl(3_40%_42%)] border-[hsl(3_40%_88%)]",
  admin: "bg-foreground text-background border-foreground",
  tester: "bg-muted text-muted-foreground border-border",
};

export function StatusPill({ value, testId }: { value: string; testId?: string }) {
  return (
    <span data-testid={testId} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-[5px] border px-2 py-0.5 text-[11px] font-medium ${TONES[value] ?? TONES.tester}`}>
      <i className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
      {value.replace("_", " ")}
    </span>
  );
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function FullPageSkeleton({ label }: { label: string }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-background px-6" aria-busy="true">
      <div className="w-full max-w-md space-y-4">
        <span className="sr-only">{label}</span>
        <div className="h-9 w-9 animate-pulse rounded-[10px] bg-primary/15" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
      </div>
    </main>
  );
}
