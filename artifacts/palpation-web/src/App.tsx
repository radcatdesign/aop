import { useEffect, useRef, type ReactNode } from 'react';
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Brand } from '@/components/beta-ui';
import NotFound from '@/pages/not-found';
import Landing from '@/pages/landing';
import BetaPortal from '@/pages/beta';
import AdminPage from '@/pages/admin';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: true } },
});

// Use the configured key directly. (On Replit this was derived from the hostname,
// which points at a Clerk proxy that doesn't exist on Vercel.)
const clerkPubKey: string | undefined = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// REQUIRED — copy verbatim. Empty in dev (Clerk hits dev FAPI directly), auto-set in prod.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

// Clerk passes full paths to routerPush/routerReplace, but wouter's
// setLocation prepends the base — strip it to avoid doubling.
function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#19745e',
    colorForeground: '#24352e',
    colorMutedForeground: '#5f6f67',
    colorDanger: '#a8504c',
    colorBackground: '#ffffff',
    colorInput: '#ffffff',
    colorInputForeground: '#24352e',
    colorNeutral: '#24352e',
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    borderRadius: '0.5rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-2xl w-[440px] max-w-full overflow-hidden border border-[#e7ece9] shadow-[0_20px_50px_-24px_rgba(20,94,76,0.25)]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#24352e] font-medium tracking-tight',
    headerSubtitle: 'text-[#5f6f67]',
    socialButtonsBlockButtonText: 'text-[#24352e] font-medium',
    formFieldLabel: 'text-[#4c5b52] font-medium',
    footerActionLink: 'text-[#19745e] font-medium hover:text-[#145e4c]',
    footerActionText: 'text-[#5f6f67]',
    dividerText: 'text-[#78837d]',
    identityPreviewEditButton: 'text-[#19745e]',
    formFieldSuccessText: 'text-[#19745e]',
    alertText: 'text-[#24352e]',
    logoBox: 'h-11 justify-center',
    logoImage: 'h-11 w-11',
    socialButtonsBlockButton: 'border border-[#e7ece9] bg-white hover:bg-[#f6f8f6]',
    formButtonPrimary: 'bg-[#19745e] hover:bg-[#145e4c] text-white shadow-none',
    formFieldInput: 'border-[#dfe6e2] bg-white text-[#24352e]',
    footerAction: 'bg-[#f8faf9]',
    dividerLine: 'bg-[#e7ece9]',
    alert: 'border border-[#f1e0dd] bg-[#fff5f3]',
    otpCodeFieldInput: 'border-[#dfe6e2] text-[#24352e]',
    formFieldRow: 'gap-3',
    main: 'gap-5',
  },
};

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8"><Brand sub="Private beta" /></header>
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 pb-10">
        {children}
        <p className="max-w-[440px] text-center text-[12px] leading-relaxed text-muted-foreground">
          Beta access is matched to your verified email. Use the same address you entered on the invite request.
        </p>
      </main>
    </div>
  );
}

function SignInPage() {
  return (
    <AuthShell>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} fallbackRedirectUrl={`${basePath}/beta`} />
    </AuthShell>
  );
}

function SignUpPage() {
  return (
    <AuthShell>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} fallbackRedirectUrl={`${basePath}/beta`} />
    </AuthShell>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><Redirect to="/beta" /></Show>
      <Show when="signed-out"><Landing /></Show>
    </>
  );
}

function Protected({ children }: { children: ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

const BetaRoute = () => <Protected><BetaPortal /></Protected>;
const AdminRoute = () => <Protected><AdminPage /></Protected>;

// Clears all cached data (including /beta/me) whenever the signed-in identity changes.
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to your Art of Palpation beta' } },
        signUp: { start: { title: 'Join the private beta', subtitle: 'Use the email from your invite request' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <RoutedErrorBoundary>
            <Switch>
              <Route path="/" component={HomeRedirect} />
              <Route path="/sign-in/*?" component={SignInPage} />
              <Route path="/sign-up/*?" component={SignUpPage} />
              <Route path="/beta" component={BetaRoute} />
              <Route path="/admin" component={AdminRoute} />
              <Route component={NotFound} />
            </Switch>
          </RoutedErrorBoundary>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
