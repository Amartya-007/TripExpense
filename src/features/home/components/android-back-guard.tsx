import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Platform } from 'react-native';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const HOME_PATH = '/dashboard';

/**
 * Android hardware back button safety net. Without this, router.replace()
 * calls (used for tab-style navigation) leave an empty stack, so the
 * default back behavior exits the app straight from any screen - including
 * mid-form. Rule, in priority order:
 *  1. If there's stack history (a pushed form/detail/modal screen), let the
 *     normal pop happen - that closes it and returns you to what was
 *     underneath, which doubles as "cancel what I was doing".
 *  2. Otherwise, if we're not on the dashboard, go there first.
 *  3. Otherwise (already on the dashboard with nothing to pop), ask before
 *     exiting.
 */
export function AndroidBackGuard() {
  const pathname = usePathname();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showExitConfirm) return true;

      if (router.canGoBack()) {
        return false;
      }

      if (pathname !== HOME_PATH) {
        router.navigate(HOME_PATH);
        return true;
      }

      setShowExitConfirm(true);
      return true;
    });

    return () => subscription.remove();
  }, [pathname, showExitConfirm]);

  if (Platform.OS !== 'android') return null;

  return (
    <ConfirmDialog
      visible={showExitConfirm}
      title="Exit TripExpense?"
      body="You can always pick up right where you left off."
      confirmLabel="Exit"
      tone="danger"
      onConfirm={() => BackHandler.exitApp()}
      onCancel={() => setShowExitConfirm(false)}
    />
  );
}
