import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { HeroPanel } from '@/components/ui/hero-panel';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { getPhoneOtpErrorMessage } from '@/features/auth/auth-errors';
import { useAuth } from '@/features/auth/auth-provider';
import { OtpCodeInput } from '@/features/auth/components/otp-code-input';
import { useOtpCooldown } from '@/features/auth/hooks/use-otp-cooldown';
import {
  normalizePhoneNumber,
  phoneInputSchema,
  verifyPhoneOtpSchema,
  type PhoneInputValues,
  type VerifyPhoneOtpValues,
} from '@/features/onboarding/validation/phone-schemas';
import { authClient } from '@/lib/auth/auth-client';
import { appToast } from '@/lib/toast/app-toast';
import { useAppTheme } from '@/theme/theme-provider';

export default function VerifyPhoneScreen() {
  const { isSigningOut, refreshSession, signOut, user } = useAuth();
  const { spacing } = useAppTheme();
  const [step, setStep] = useState<'input-phone' | 'input-otp'>('input-phone');
  const [activePhoneNumber, setActivePhoneNumber] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const { isCoolingDown, restart: restartCooldown, secondsRemaining } = useOtpCooldown();

  const phoneForm = useForm<PhoneInputValues>({
    resolver: zodResolver(phoneInputSchema),
    defaultValues: { phoneNumber: '+91 ' },
    mode: 'onChange',
  });

  const otpForm = useForm<VerifyPhoneOtpValues>({
    resolver: zodResolver(verifyPhoneOtpSchema),
    defaultValues: { otp: '' },
    mode: 'onChange',
  });

  async function handleSendOtp(values: PhoneInputValues) {
    const formattedPhone = normalizePhoneNumber(values.phoneNumber);
    if (!formattedPhone) return;

    setIsSendingCode(true);

    try {
      const result = await authClient.phoneNumber.sendOtp({
        phoneNumber: formattedPhone,
      });

      if (result.error) {
        const errorMsg = getPhoneOtpErrorMessage(result.error);
        phoneForm.setError('phoneNumber', { message: errorMsg });
        appToast.error('Failed to send code', {
          description: errorMsg,
        });
        return;
      }

      setActivePhoneNumber(formattedPhone);
      setStep('input-otp');
      otpForm.reset({ otp: '' });
      restartCooldown();
      appToast.success('Verification code sent', {
        description: `SMS sent to ${formattedPhone}`,
      });
    } catch {
      phoneForm.setError('phoneNumber', { message: 'Unable to send verification code.' });
      appToast.error('Failed to send code', {
        description: 'Unable to send verification code. Please check your connection and try again.',
      });
    } finally {
      setIsSendingCode(false);
    }
  }

  async function handleVerifyOtp(values: VerifyPhoneOtpValues) {
    if (!activePhoneNumber) return;

    try {
      const result = await authClient.phoneNumber.verify({
        phoneNumber: activePhoneNumber,
        code: values.otp.trim(),
        updatePhoneNumber: true,
      });

      if (result.error) {
        const errorMsg = getPhoneOtpErrorMessage(result.error);
        otpForm.setError('otp', { message: errorMsg });
        appToast.error('Verification failed', {
          description: errorMsg,
        });
        return;
      }

      await refreshSession();
      appToast.success('Phone number verified');
    } catch {
      otpForm.setError('otp', { message: 'Check your connection and try again.' });
      appToast.error('Verification failed', {
        description: 'Check your connection and try again.',
      });
    }
  }

  async function handleResendCode() {
    if (!activePhoneNumber || isCoolingDown || isSendingCode) return;

    setIsSendingCode(true);

    try {
      const result = await authClient.phoneNumber.sendOtp({
        phoneNumber: activePhoneNumber,
      });

      if (result.error) {
        appToast.error('Code request failed', {
          description: getPhoneOtpErrorMessage(result.error),
        });
        return;
      }

      restartCooldown();
      appToast.success('Verification code requested', {
        description: `Check ${activePhoneNumber} for the new code.`,
      });
    } catch {
      appToast.error('Code request failed', {
        description: 'Unable to send verification code. Please try again.',
      });
    } finally {
      setIsSendingCode(false);
    }
  }

  return (
    <Screen>
      {/* 
        Keying the FadeIn forces the animation to re-run smoothly 
        when transitioning between the phone input and OTP steps 
      */}
      <FadeIn key={step} style={{ flex: 1, gap: spacing.xl }}>
        {step === 'input-phone' ? (
          <>
            <HeroPanel
              eyebrow="Phone verification"
              title="Verify your mobile number"
              body="A verified phone number is required to secure your TripExpense account."
              meta={`Signed in as ${user?.email ?? 'your account'}`}
            />

            <Card style={{ gap: spacing.md, padding: spacing.lg }}>
              <View style={{ gap: spacing.xs }}>
                <AppText variant="subtitle">Mobile number</AppText>
                <AppText tone="muted" variant="caption">
                  We will send a 6-digit SMS verification code to this number.
                </AppText>
              </View>
              
              <Controller
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field: { onBlur, onChange, value }, fieldState }) => (
                  <Input
                    accessibilityLabel="Mobile phone number"
                    label="Phone number"
                    placeholder="+91 98765 43210"
                    value={value}
                    error={fieldState.error?.message}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    autoComplete="tel"
                    autoCorrect={false}
                    inputMode="tel"
                    keyboardType="phone-pad"
                    leftIcon="phone"
                  />
                )}
              />
              <Button
                label="Send verification code"
                loading={isSendingCode || phoneForm.formState.isSubmitting}
                disabled={!phoneForm.formState.isValid || isSendingCode}
                onPress={() => void phoneForm.handleSubmit(handleSendOtp)()}
              />
            </Card>
          </>
        ) : (
          <>
            <HeroPanel
              eyebrow="Phone verification"
              title="Enter the six-digit code"
              body={`We sent a verification code via SMS to ${activePhoneNumber}.`}
              meta="Expires in 5 minutes"
            />

            <Card style={{ gap: spacing.md, padding: spacing.lg }}>
              <Controller
                control={otpForm.control}
                name="otp"
                render={({ field: { onBlur, onChange, value }, fieldState }) => (
                  <OtpCodeInput
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    error={fieldState.error?.message}
                    label="SMS Verification Code"
                  />
                )}
              />
              <Button
                label="Verify phone number"
                loading={otpForm.formState.isSubmitting}
                disabled={!otpForm.formState.isValid}
                onPress={() => void otpForm.handleSubmit(handleVerifyOtp)()}
              />
            </Card>

            <View style={{ gap: spacing.sm }}>
              <Button
                label={
                  secondsRemaining > 0
                    ? `Request another code in ${secondsRemaining}s`
                    : 'Request another code'
                }
                variant="outline"
                loading={isSendingCode}
                disabled={isCoolingDown || isSendingCode}
                onPress={() => void handleResendCode()}
              />
              <Button
                label="Use a different phone number"
                variant="ghost"
                onPress={() => setStep('input-phone')}
              />
            </View>
          </>
        )}

        {/* Pushes the sign-out button to the absolute bottom of the screen */}
        <View style={{ marginTop: 'auto', paddingTop: spacing.xl }}>
          <Button
            label="Sign out"
            variant="ghost"
            loading={isSigningOut}
            onPress={() => void signOut()}
          />
        </View>
      </FadeIn>
    </Screen>
  );
}