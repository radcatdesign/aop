import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CheckCircle2, FlaskConical, Hand, MapPin, ShieldCheck, Timer } from "lucide-react";
import { useBetaSubmitRequest } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Brand, Eyebrow, errorMessage } from "@/components/beta-ui";

const schema = z.object({
  name: z.string().trim().min(1, "Please share your name.").max(120, "Keep this under 120 characters."),
  email: z.string().trim().min(1, "An email is required.").max(254, "That email is too long.").email("Enter a valid email address."),
  practice: z.string().trim().min(1, "Tell us where you practice.").max(160, "Keep this under 160 characters."),
  role: z.string().trim().min(1, "Share your role.").max(120, "Keep this under 120 characters."),
  reason: z.string().trim().min(1, "A sentence or two helps us review.").max(4000, "Keep this under 4000 characters."),
});
type Values = z.infer<typeof schema>;

const PRINCIPLES = [
  { icon: Hand, title: "Office and field, one rhythm", body: "Schedule, intake, SOAP charting and checkout — evaluated in the same quiet workspace you would use between sessions or on location." },
  { icon: FlaskConical, title: "Synthetic records only", body: "Every client in the beta is invented. Nothing you type is saved; the workspace resets when you leave." },
  { icon: Timer, title: "Short, bounded sessions", body: "Workspaces close after 5 minutes idle or 30 minutes total, so nothing lingers on a shared front-desk screen." },
];

export default function Landing() {
  const [done, setDone] = useState<string | null>(null);
  const submit = useBetaSubmitRequest();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", practice: "", role: "", reason: "" },
  });

  const onSubmit = (values: Values) => {
    submit.mutate(
      { data: values },
      {
        onSuccess: (res) => {
          setDone(res.message);
          form.reset();
        },
      },
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand sub="Private beta" />
        <nav className="flex items-center gap-2">
          <Link href="/sign-in" className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-primary" data-testid="link-sign-in">Sign in</Link>
          <a href="#request" className="rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90" data-testid="link-request">Request invite</a>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
          <div className="flex flex-col justify-center">
            <Eyebrow>For massage therapists, bodyworkers and clinic owners</Eyebrow>
            <h1 className="mt-4 max-w-xl text-[40px] font-medium leading-[1.08] tracking-[-0.03em] sm:text-[54px]">
              Evaluate your practice tools with a steady hand.
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              Art of Palpation is a calm workspace for the table room, the front desk and the event tent. We are opening a small private beta so practitioners can try it with synthetic clients and tell us, precisely, what works.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12.5px] text-muted-foreground">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> No real patient data, ever</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Office and field workflows</span>
            </div>

            <ol className="mt-12 space-y-0 border-l border-border">
              {["Request an invite below.", "We review requests by hand. There is no automated email — if approved, the team shares a sign-in link with you directly.", "Sign up with the same email you used here, verify it, and your beta workspace opens."].map((s, i) => (
                <li key={i} className="relative pb-5 pl-6 text-[13.5px] leading-relaxed text-foreground/80 last:pb-0">
                  <span className="absolute -left-[9px] top-0.5 grid h-[18px] w-[18px] place-items-center rounded-full border border-border bg-card text-[10px] font-semibold text-primary">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          <div id="request" className="scroll-mt-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_hsl(150_20%_20%/0.04),0_20px_50px_-24px_hsl(162_40%_20%/0.18)] sm:p-8">
              {done ? (
                <div className="flex flex-col items-start gap-4 py-6" role="status" data-testid="status-request-success">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-primary"><CheckCircle2 className="h-5 w-5" /></span>
                  <h2 className="text-xl font-medium tracking-tight">Thank you. Your request is in.</h2>
                  <p className="text-[13.5px] leading-relaxed text-muted-foreground">{done}</p>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    We do not send automated emails. If your request is approved, someone from the team will share a sign-in link with you. When you sign up, use the exact email address you entered here — access is matched to that verified email.
                  </p>
                  <Button variant="outline" onClick={() => { setDone(null); submit.reset(); }} data-testid="button-another-request">Submit another request</Button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-medium tracking-tight">Request a private beta invite</h2>
                  <p className="mt-1.5 text-[13px] text-muted-foreground">Takes about a minute. Every request is read by a person.</p>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel>Full name</FormLabel><FormControl><Input autoComplete="name" placeholder="Imani Okafor" {...field} data-testid="input-name" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" autoComplete="email" placeholder="you@yourpractice.com" {...field} data-testid="input-email" /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField control={form.control} name="practice" render={({ field }) => (
                          <FormItem><FormLabel>Practice</FormLabel><FormControl><Input autoComplete="organization" placeholder="Riverbend Bodywork" {...field} data-testid="input-practice" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="role" render={({ field }) => (
                          <FormItem><FormLabel>Your role</FormLabel><FormControl><Input autoComplete="organization-title" placeholder="LMT, owner" {...field} data-testid="input-role" /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="reason" render={({ field }) => (
                        <FormItem>
                          <FormLabel>What would you like to evaluate?</FormLabel>
                          <FormControl><Textarea rows={4} placeholder="e.g. We run chair massage at races and want to see how field checkout compares to our current tablet setup." {...field} data-testid="input-reason" /></FormControl>
                          <FormDescription>Please do not include any client or patient information.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                      {submit.isError && (
                        <p role="alert" className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-[13px] text-destructive" data-testid="text-request-error">
                          {errorMessage(submit.error, "We couldn't send your request. Check your connection and try again.")}
                        </p>
                      )}
                      <Button type="submit" className="w-full" disabled={submit.isPending} data-testid="button-submit-request">
                        {submit.isPending ? "Sending request..." : <>Request invite <ArrowRight className="ml-1.5 h-4 w-4" /></>}
                      </Button>
                      <p className="text-center text-[12px] text-muted-foreground">
                        Already approved? <Link href="/sign-in" className="font-medium text-primary hover:underline" data-testid="link-sign-in-form">Sign in</Link>
                      </p>
                    </form>
                  </Form>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card/60">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[0.8fr_2fr]">
            <div>
              <Eyebrow>What the beta is</Eyebrow>
              <h2 className="mt-3 text-2xl font-medium tracking-tight">A place to try, not a place to chart.</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {PRINCIPLES.map(({ icon: Icon, title, body }) => (
                <div key={title}>
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 text-[14px] font-semibold">{title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="rounded-2xl border border-[hsl(40_55%_85%)] bg-[hsl(40_70%_97%)] p-6 sm:p-8">
            <h2 className="text-[15px] font-semibold text-[hsl(40_62%_28%)]">Not for clinical use</h2>
            <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-[hsl(40_40%_28%)]">
              This beta is an evaluation environment. It is not cleared for protected health information and must not be used to record real clients, patients, notes or payments. Your sign-in identity is kept separately from the sample workspace, which lives only in your browser's memory.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>Art of Palpation · Private beta</span>
          <span>Thoughtful care starts with a protected workspace.</span>
        </div>
      </footer>
    </div>
  );
}
