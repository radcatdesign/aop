import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';
import * as SplashScreen from 'expo-splash-screen';
import { DemoProvider, useDemo } from '@/contexts/DemoContext';
import { SessionGate } from '@/components/SessionGate';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { reloadAppAsync } from 'expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { FONT } from '@/components/FieldUI';

const domain = process.env.EXPO_PUBLIC_DOMAIN;
if (domain) setBaseUrl(`https://${domain}`);
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const proxyUrl = process.env.EXPO_PUBLIC_CLERK_PROXY_URL || undefined;

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function StartupStatus({ phase, failed = false }: { phase: 'fonts' | 'auth' | 'account' | 'config'; failed?: boolean }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (failed) return;
    const timer = setTimeout(() => setTimedOut(true), 12000);
    return () => clearTimeout(timer);
  }, [failed, phase]);
  const problem = failed || timedOut;
  const detail = phase === 'config'
    ? 'The beta sign-in key was not included in this app build. Please contact the beta team.'
    : phase === 'auth'
      ? failed ? 'Authentication could not initialize. Check your connection and try again, or contact the beta team.' : 'Authentication is taking longer than expected. Check your connection, then try again.'
      : phase === 'fonts'
        ? 'The app is taking longer than expected to load its assets.'
        : 'Your tester session is taking longer than expected to initialize.';
  const retry = () => {
    if (Platform.OS === 'web') window.location.reload();
    else void reloadAppAsync();
  };
  return <View style={[startup.root, { backgroundColor: c.background, paddingTop: (Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top) + 24, paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 24 }]}>
    <View style={[startup.logo, { backgroundColor: c.primary }]}><Feather name="aperture" size={27} color={c.primaryForeground} /></View>
    <Text style={[startup.eyebrow, { color: c.pineSoft }]}>ART OF PALPATION · FIELD</Text>
    <Text accessibilityRole="header" style={[startup.title, { color: c.foreground }]}>{problem ? 'Unable to open beta.' : 'Preparing your field companion.'}</Text>
    <Text accessibilityRole={problem ? 'alert' : undefined} style={[startup.body, { color: c.mutedForeground }]}>{problem ? detail : 'Loading your private beta experience…'}</Text>
    {problem && phase !== 'config' && <Pressable accessibilityRole="button" onPress={retry} style={[startup.button, { backgroundColor: c.primary }]}><Text style={[startup.buttonText, { color: c.primaryForeground }]}>Try again</Text></Pressable>}
  </View>;
}

const startup = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  logo: { width: 58, height: 62, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  eyebrow: { fontFamily: FONT.semi, fontSize: 10, letterSpacing: 1.5 },
  title: { fontFamily: FONT.medium, fontSize: 30, lineHeight: 38, marginTop: 12 },
  body: { fontFamily: FONT.regular, fontSize: 14, lineHeight: 23, marginTop: 10 },
  button: { marginTop: 22, minHeight: 50, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: FONT.semi, fontSize: 14 },
});

// Keep the fallback mounted even if Clerk fails (ClerkLoaded itself renders null
// both while loading and on failure). Only Expo's own ClerkLoaded consumes the
// provider context; importing controls from a second @clerk/react path can
// create a separate context instance in Metro.
function ClerkApp() {
  const [initialized, setInitialized] = useState(false);
  return <View style={{ flex: 1 }}>
    {!initialized && <View style={StyleSheet.absoluteFill}><StartupStatus phase="auth" /></View>}
    <ClerkLoaded>
      <ClerkReady onReady={() => setInitialized(true)}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <AuthTransport />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ClerkReady>
    </ClerkLoaded>
  </View>;
}

function ClerkReady({ children, onReady }: { children: React.ReactNode; onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="visit/[id]" />
      <Stack.Screen name="client/[id]" />
    </Stack>
  );
}

function BetaApp() {
  const { touch } = useDemo();
  return <SessionGate><View style={{ flex: 1 }} onTouchStart={touch}><RootLayoutNav /></View></SessionGate>;
}

function AuthTransport() {
  const { getToken, isSignedIn, userId } = useAuth();
  const [readyFor, setReadyFor] = useState<string | null | undefined>(undefined);
  const previousUser = React.useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (previousUser.current !== undefined && previousUser.current !== (userId ?? null)) queryClient.clear();
    previousUser.current = userId ?? null;
    setAuthTokenGetter(isSignedIn ? () => getToken() : null);
    setReadyFor(isSignedIn ? userId : null);
    return () => { setAuthTokenGetter(null); setReadyFor(undefined); };
  }, [getToken, isSignedIn, userId]);
  if (readyFor === undefined || readyFor !== (isSignedIn ? userId : null)) return <StartupStatus phase="account" />;
  return <DemoProvider key={userId ?? 'public'}><BetaApp /></DemoProvider>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [fontTimedOut, setFontTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setFontTimedOut(true), 12000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (fontsLoaded || fontError || fontTimedOut) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, fontTimedOut]);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        {!fontsLoaded && !fontError
          ? <StartupStatus phase="fonts" />
          : !publishableKey
            ? <StartupStatus phase="config" failed />
            : <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache} proxyUrl={proxyUrl}>
                <ClerkApp />
            </ClerkProvider>}
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
