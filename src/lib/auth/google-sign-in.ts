import { Platform } from 'react-native';

import { env } from '@/config/env';
import { authClient } from '@/lib/auth/auth-client';

export type GoogleSignInOutcome = 'success' | 'cancelled';

const GOOGLE_REQUEST_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, message: string) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(message)), GOOGLE_REQUEST_TIMEOUT_MS);
    }),
  ]);
}

export async function signInWithGoogle(): Promise<GoogleSignInOutcome> {
  if (Platform.OS === 'web') {
    throw new Error('Google Sign-In is available in the iOS and Android apps.');
  }

  if (!env.googleWebClientId || !env.googleIosClientId || !env.googleAndroidClientId) {
    throw new Error('Google Sign-In is not configured yet.');
  }

  let google: typeof import('react-native-nitro-google-signin');

  try {
    google = await import('react-native-nitro-google-signin');
  } catch {
    throw new Error('Google Sign-In is unavailable in this app build.');
  }

  google.GoogleOneTapSignIn.configure({
    webClientId: env.googleWebClientId,
    iosClientId: env.googleIosClientId,
  });

  try {
    await google.GoogleOneTapSignIn.checkPlayServices();
    let response = await google.GoogleOneTapSignIn.signIn();

    if (google.isNoSavedCredentialFoundResponse(response)) {
      response = await google.GoogleOneTapSignIn.createAccount();
    }

    if (google.isNoSavedCredentialFoundResponse(response)) {
      response = await google.GoogleOneTapSignIn.presentExplicitSignIn();
    }

    if (google.isCancelledResponse(response)) {
      throw new Error(
        'Google returned no credential after account selection. Verify the Android OAuth client uses package com.amartya.tripexpense and has the current debug SHA-1 registered.',
      );
    }

    if (!google.isSuccessResponse(response)) {
      throw new Error('Google Sign-In could not be completed.');
    }

    const result = await withTimeout(
      authClient.signIn.social({
        provider: 'google',
        idToken: { token: response.data.idToken },
        requestSignUp: true,
      }),
      'Google sign-in timed out while contacting the server. Check your connection and try again.',
    );

    if (result.error) {
      if (result.error.code === 'OAUTH_LINK_ERROR') {
        throw new Error(
          'This email already has an account. Sign in with email and verify it, then try Google again.',
        );
      }

      throw new Error(
        result.error.message || result.error.code || 'Google Sign-In could not be completed.',
      );
    }

    return 'success';
  } catch (error) {
    if (google.isErrorWithCode(error)) {
      if (error.code === google.statusCodes.SIGN_IN_CANCELLED) return 'cancelled';

      if (error.code === google.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Update Google Play Services and try again.');
      }

      if (error.code === google.statusCodes.DEVELOPER_ERROR) {
        throw new Error('Google Sign-In is not configured correctly for this app.');
      }
    }

    throw error instanceof Error
      ? error
      : new Error('Google Sign-In could not be completed.');
  }
}
