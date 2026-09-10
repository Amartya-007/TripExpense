import { getServerEnv } from '@/server/env';
import { ConsoleSmsProvider } from '@/server/sms/providers/console-provider';
import { VendelSmsProvider } from '@/server/sms/providers/vendel-provider';
import type { SendOtpParams, SmsProvider } from '@/server/sms/types';

export function getSmsProvider(): SmsProvider {
  const env = getServerEnv();

  switch (env.SMS_PROVIDER) {
    case 'console':
      return new ConsoleSmsProvider();

    case 'vendel':
      if (!env.VENDEL_API_KEY) {
        throw new Error('VENDEL_API_KEY is required when SMS_PROVIDER is vendel');
      }
      return new VendelSmsProvider({
        url: env.VENDEL_URL,
        apiKey: env.VENDEL_API_KEY,
      });

    default:
      throw new Error(`Unsupported SMS provider: ${String((env as { SMS_PROVIDER?: unknown }).SMS_PROVIDER)}`);
  }
}

export async function sendAuthOtpSms(params: SendOtpParams): Promise<void> {
  const provider = getSmsProvider();
  await provider.sendOtp(params);
}
