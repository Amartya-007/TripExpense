import { useCallback, useEffect, useState } from 'react';

import { authPolicy } from '@/constants/auth-policy';

const defaultCooldownSeconds: number = authPolicy.otpResendCooldownSeconds;

export function useOtpCooldown(durationSeconds = defaultCooldownSeconds) {
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const timer = setTimeout(
      () => setSecondsRemaining((seconds) => Math.max(0, seconds - 1)),
      1000,
    );

    return () => clearTimeout(timer);
  }, [secondsRemaining]);

  const restart = useCallback(() => {
    setSecondsRemaining(durationSeconds);
  }, [durationSeconds]);

  return {
    isCoolingDown: secondsRemaining > 0,
    restart,
    secondsRemaining,
  };
}
