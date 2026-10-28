import React, { useEffect, useRef, useState } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth, useSignIn, useSignUp, useSSO } from '@clerk/expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { usePathname } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBetaGetMeQueryKey, useBetaAcknowledge, useBetaGetMe, useBetaRecordEvent, useBetaSubmitRequest } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useDemo } from '@/contexts/DemoContext';
import { FONT } from '@/components/FieldUI';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

WebBrowser.maybeCompleteAuthSession();

const errorText = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return 'Something went wrong. Please try again.';
};
type Mode = 'request' | 'sign-in' | 'sign-up' | 'reset' | 'reset-code' | 'new-password' | 'verify';

function AccessScreen({ children, title, subtitle }: { children?: React.ReactNode; title: string; subtitle: string }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return <KeyboardAwareScrollViewCompat style={{ flex: 1, backgroundColor: c.background }} bottomOffset={24} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingTop: (Platform.OS === 'web' ? Math.max(67, insets.top) : insets.top) + 28, paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 30 }} keyboardShouldPersistTaps="handled">
    <View style={[styles.logo, { backgroundColor: c.primary }]}><Feather name="aperture" size={27} color={c.primaryForeground} /></View>
    <Text style={[styles.eyebrow, { color: c.pineSoft }]}>ART OF PALPATION · FIELD</Text>
    <Text style={[styles.heading, { color: c.foreground }]}>{title}</Text>
    <Text style={[styles.body, { color: c.mutedForeground }]}>{subtitle}</Text>
    {children}
  </KeyboardAwareScrollViewCompat>;
}

function AuthForm() {
  const c = useColors();
  const [mode, setMode] = useState<Mode>('request');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [practice, setPractice] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [role, setRole] = useState('');
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const { signIn, errors: signInErrors } = useSignIn();
  const { signUp, errors: signUpErrors } = useSignUp();
  const { startSSOFlow } = useSSO();
  const request = useBetaSubmitRequest();
  const switchMode = (next: Mode) => { setMessage(''); setMode(next); };
  const execute = async (task: () => Promise<void>) => {
    setMessage(''); setBusy(true);
    try { await task(); } catch (error) { setMessage(errorText(error)); }
    finally { setBusy(false); }
  };
  const check = (result: { error: unknown }) => {
    if (result.error) throw new Error(errorText(result.error));
  };
  const finalize = async (flow: typeof signIn | typeof signUp) => {
    if (flow.status !== 'complete') throw new Error('More verification is required to complete sign-in. Please contact beta support if this continues.');
    await flow.finalize({ navigate: ({ session }) => {
      if (session?.currentTask) setMessage('Additional account verification is required. Please contact beta support.');
    } });
  };
  const submitRequest = () => execute(async () => {
    if (![name, email, practice, licenseNumber, role, reason].every(v => v.trim())) throw new Error('Please complete every field.');
    await request.mutateAsync({ data: { name: name.trim(), email: email.trim(), practice: practice.trim(), licenseNumber: licenseNumber.trim(), role: role.trim(), reason: reason.trim() } });
    setDone(true);
  });
  const submitSignIn = () => execute(async () => {
    check(await signIn.password({ emailAddress: email.trim(), password }));
    if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
      const factor = signIn.supportedSecondFactors.find(f => f.strategy === 'email_code');
      if (factor) { check(await signIn.mfa.sendEmailCode()); switchMode('verify'); return; }
      throw new Error('This account needs another verification method. Please contact beta support.');
    }
    await finalize(signIn);
  });
  const submitSignUp = () => execute(async () => {
    check(await signUp.password({ emailAddress: email.trim(), password }));
    check(await signUp.verifications.sendEmailCode());
    switchMode('verify');
  });
  const verify = () => execute(async () => {
    if (signUp.status === 'missing_requirements' && signUp.unverifiedFields.includes('email_address')) {
      check(await signUp.verifications.verifyEmailCode({ code: code.trim() }));
      await finalize(signUp);
    } else {
      check(await signIn.mfa.verifyEmailCode({ code: code.trim() }));
      await finalize(signIn);
    }
  });
  const reset = () => execute(async () => {
    check(await signIn.create({ identifier: email.trim() }));
    check(await signIn.resetPasswordEmailCode.sendCode());
    switchMode('reset-code');
  });
  const verifyReset = () => execute(async () => {
    check(await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() }));
    if (signIn.status !== 'needs_new_password') throw new Error('The reset code could not be verified.');
    switchMode('new-password');
  });
  const submitNewPassword = () => execute(async () => {
    check(await signIn.resetPasswordEmailCode.submitPassword({ password }));
    await finalize(signIn);
  });
  const google = () => execute(async () => {
    const { createdSessionId, setActive } = await startSSOFlow({ strategy: 'oauth_google', redirectUrl: AuthSession.makeRedirectUri({ scheme: 'palpation-mobile' }) });
    if (!createdSessionId || !setActive) throw new Error('Google sign-in needs additional verification. Please use email or contact beta support.');
    await setActive({ session: createdSessionId, navigate: ({ session }) => {
      if (session?.currentTask) setMessage('Additional account verification is required. Please contact beta support.');
    } });
  });
  const field = (label: string, value: string, onChangeText: (v: string) => void, props: { secureTextEntry?: boolean; multiline?: boolean; email?: boolean } = {}) =>
    <View style={styles.field}><Text style={[styles.label, { color: c.foreground }]}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} secureTextEntry={props.secureTextEntry} multiline={props.multiline} keyboardType={props.email ? 'email-address' : 'default'} autoCapitalize={props.email ? 'none' : props.secureTextEntry ? 'none' : 'sentences'} style={[styles.input, { color: c.foreground, backgroundColor: c.card, borderColor: c.border }, props.multiline && { minHeight: 96, textAlignVertical: 'top' }]} /></View>;
  const button = (label: string, onPress: () => void, secondary = false) => <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={busy} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: secondary ? c.card : c.primary, borderColor: secondary ? c.border : c.primary, opacity: busy ? .5 : pressed ? .75 : 1 }]}><Text style={[styles.buttonText, { color: secondary ? c.primary : c.primaryForeground }]}>{label}</Text></Pressable>;
  const isRequest = mode === 'request';
  const title = isRequest ? 'Care, wherever you are.' : mode === 'sign-up' ? 'Create your account.' : mode.startsWith('reset') || mode === 'new-password' ? 'Reset your password.' : mode === 'verify' ? 'Verify your email.' : 'Welcome back.';
  return <AccessScreen title={title} subtitle={isRequest ? 'Request access to the private beta. Explore a fictional practice day after approval.' : 'Your account identifies you as a tester. This app is not for patient records.'}>
    <View style={[styles.notice, { backgroundColor: c.secondary, borderColor: c.sageLine }]}><Feather name="shield" color={c.primary} size={18} /><Text style={[styles.noticeText, { color: c.pineDeep }]}>Synthetic examples only. Do not enter real patient or clinical information in this beta, including feedback.</Text></View>
    {isRequest ? done ? <Text accessibilityRole="alert" style={[styles.body, { color: c.primary }]}>Request received. Access is reviewed manually; this does not create an account or send an automatic invitation.</Text> : <>
      {field('Your name', name, setName)}{field('Email', email, setEmail, { email: true })}{field('Practice', practice, setPractice)}{field('License number', licenseNumber, setLicenseNumber)}{field('Role', role, setRole)}{field('Why would you like to try the beta?', reason, setReason, { multiline: true })}
      {button('Request beta access', submitRequest)}
    </> : <>
      {(mode === 'sign-in' || mode === 'sign-up' || mode === 'reset') && field('Email', email, setEmail, { email: true })}
      {(mode === 'sign-in' || mode === 'sign-up' || mode === 'new-password') && field(mode === 'new-password' ? 'New password' : 'Password', password, setPassword, { secureTextEntry: true })}
      {(mode === 'verify' || mode === 'reset-code') && field('Email verification code', code, setCode)}
      {mode === 'sign-in' && <>{button('Sign in', submitSignIn)}{button('Sign in with Google', google, true)}{button('Forgot password?', () => switchMode('reset'), true)}{button('Create an account', () => switchMode('sign-up'), true)}</>}
      {mode === 'sign-up' && <>{button('Create account', submitSignUp)}<View nativeID="clerk-captcha" />{button('Already have an account? Sign in', () => switchMode('sign-in'), true)}</>}
      {mode === 'verify' && <>{button('Verify email', verify)}{button('Send another code', () => execute(async () => { if (signUp.status === 'missing_requirements') check(await signUp.verifications.sendEmailCode()); else check(await signIn.mfa.sendEmailCode()); }), true)}<View nativeID="clerk-captcha" /></>}
      {mode === 'reset' && button('Send reset code', reset)}
      {mode === 'reset-code' && <>{button('Verify reset code', verifyReset)}{button('Send another code', () => execute(async () => { check(await signIn.resetPasswordEmailCode.sendCode()); }), true)}</>}
      {mode === 'new-password' && button('Set new password', submitNewPassword)}
      {mode !== 'sign-in' && button('Back to sign in', () => switchMode('sign-in'), true)}
    </>}
    {!!message && <Text accessibilityRole="alert" style={[styles.error, { color: c.destructive }]}>{message}</Text>}
    {!isRequest && !!signInErrors?.global?.length && <Text accessibilityRole="alert" style={[styles.error, { color: c.destructive }]}>{signInErrors.global.map(e => e.message).join(' ')}</Text>}
    {!isRequest && !!signUpErrors?.global?.length && <Text accessibilityRole="alert" style={[styles.error, { color: c.destructive }]}>{signUpErrors.global.map(e => e.message).join(' ')}</Text>}
    {isRequest && button('Already invited? Sign in', () => switchMode('sign-in'), true)}
  </AccessScreen>;
}

export function SessionGate({ children }: { children: React.ReactNode }) {
  const c = useColors();
  const { isSignedIn, userId, signOut } = useAuth();
  const { active, reason, start, end } = useDemo();
  const queryClient = useQueryClient();
  const previous = useRef<string | null>(null);
  const wasAuthorized = useRef(false);
  const pathname = usePathname();
  const me = useBetaGetMe({ query: { queryKey: [...getBetaGetMeQueryKey(), userId], enabled: !!isSignedIn, refetchInterval: 30000, retry: false, refetchOnMount: 'always' } });
  const acknowledge = useBetaAcknowledge();
  const event = useBetaRecordEvent();
  const approved = isSignedIn && me.isSuccess && me.data?.status === 'approved';
  const allowed = approved && me.data?.acknowledged;
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && isSignedIn) void me.refetch();
    });
    return () => subscription.remove();
  }, [isSignedIn, me.refetch]);
  useEffect(() => {
    if (previous.current && previous.current !== userId) {
      end(); queryClient.clear();
    }
    previous.current = userId ?? null;
  }, [userId, end, queryClient]);
  useEffect(() => {
    if (wasAuthorized.current && !allowed && !me.isFetching) {
      end(); queryClient.clear();
    }
    wasAuthorized.current = !!allowed;
  }, [allowed, me.isFetching, end, queryClient]);
  const screen = pathname.includes('settings') ? 'settings' : pathname.includes('clients') || pathname.includes('client/') ? 'clients' : pathname.includes('visit/') ? 'notes' : 'schedule';
  useEffect(() => {
    if (allowed && active) event.mutate({ data: { event: 'screen_view', platform: 'mobile', screen } });
  }, [allowed, active, screen]);
  const logout = async () => { end(); queryClient.clear(); await signOut(); };
  if (!isSignedIn) return <AuthForm />;
  if (me.isPending || me.isFetching && !me.data) return <AccessScreen title="Checking your access." subtitle="Confirming your private beta account…" />;
  if (me.isError) return <AccessScreen title="Access unavailable." subtitle={errorText(me.error)}><Pressable accessibilityRole="button" onPress={() => void me.refetch()}><Text style={{ color: c.primary }}>Retry access check</Text></Pressable><Pressable accessibilityRole="button" onPress={() => void logout()}><Text style={{ color: c.primary, marginTop: 22 }}>Sign out</Text></Pressable></AccessScreen>;
  if (!approved) return <AccessScreen title="Beta access is limited." subtitle={`Your account is ${me.data?.status ?? 'not approved'}. An account alone does not grant access. Access requests are reviewed manually.`}><Pressable accessibilityRole="button" onPress={() => void me.refetch()}><Text style={{ color: c.primary }}>Check again</Text></Pressable><Pressable accessibilityRole="button" onPress={() => void logout()}><Text style={{ color: c.primary, marginTop: 22 }}>Sign out</Text></Pressable></AccessScreen>;
  if (!me.data.acknowledged) return <AccessScreen title="Before you begin." subtitle="You are accessing a private beta with a real tester account, not a clinical product."><View style={[styles.notice, { backgroundColor: c.secondary, borderColor: c.sageLine }]}><Text style={[styles.noticeText, { color: c.pineDeep }]}>All names, visits and clinical details shown are fictional samples. Nothing syncs and no payment is processed. Do not enter real patient data, clinical information or identifiers anywhere in this beta.</Text></View><Pressable accessibilityRole="button" disabled={acknowledge.isPending} onPress={() => acknowledge.mutate(undefined, { onSuccess: () => void queryClient.invalidateQueries({ queryKey: getBetaGetMeQueryKey() }) })} style={[styles.button, { backgroundColor: c.primary }]}><Text style={[styles.buttonText, { color: c.primaryForeground }]}>I understand · Continue</Text></Pressable>{acknowledge.isError && <Text style={{ color: c.destructive }}>{errorText(acknowledge.error)}</Text>}</AccessScreen>;
  if (active) return <>{children}</>;
  return <AccessScreen title="A moment to focus." subtitle="Explore a bodywork visit, from schedule to notes to simulated checkout.">
    {!!reason && <Text style={[styles.body, { color: c.primary }]}>{reason}</Text>}
    <View style={[styles.notice, { backgroundColor: c.secondary, borderColor: c.sageLine }]}><Feather name="info" size={19} color={c.primary} /><Text style={[styles.noticeText, { color: c.pineDeep }]}>All records are fictional. Edits stay in memory, expire after 5 minutes idle / away or 30 minutes total. Do not enter real patient information.</Text></View>
    <Pressable accessibilityRole="button" testID="acknowledge-demo" onPress={() => { start(); event.mutate({ data: { event: 'session_start', platform: 'mobile', screen: 'overview' } }); }} style={[styles.button, { backgroundColor: c.primary }]}><Text style={[styles.buttonText, { color: c.primaryForeground }]}>Explore sample</Text></Pressable>
    {event.isError && <Text style={{ color: c.destructive }}>{errorText(event.error)}</Text>}
  </AccessScreen>;
}
const styles = StyleSheet.create({
  logo: { width: 58, height: 62, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  eyebrow: { fontFamily: FONT.semi, fontSize: 10, letterSpacing: 1.5 },
  heading: { fontFamily: FONT.medium, fontSize: 30, lineHeight: 38, marginTop: 12 },
  body: { fontFamily: FONT.regular, fontSize: 14, lineHeight: 23, marginTop: 10 },
  notice: { flexDirection: 'row', gap: 11, borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 26, marginBottom: 14 },
  noticeText: { flex: 1, fontFamily: FONT.medium, fontSize: 12, lineHeight: 19 },
  field: { marginTop: 12 }, label: { fontFamily: FONT.medium, fontSize: 12, marginBottom: 6 },
  input: { minHeight: 48, padding: 12, borderWidth: 1, borderRadius: 9, fontFamily: FONT.regular, fontSize: 15 },
  button: { borderWidth: 1, borderRadius: 9, minHeight: 49, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  buttonText: { fontFamily: FONT.semi, fontSize: 13 },
  error: { fontFamily: FONT.medium, fontSize: 12, marginTop: 12, lineHeight: 19 },
});