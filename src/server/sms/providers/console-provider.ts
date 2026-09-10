import type { SendOtpParams, SmsProvider } from '@/server/sms/types';

export class ConsoleSmsProvider implements SmsProvider {
  readonly name = 'console';

  async sendOtp({ recipient, code }: SendOtpParams): Promise<void> {
    // Development-only provider: strictly logged to server console
    console.info(`[SMS Dev Console] TripExpense OTP for ${recipient}: ${code}`);
  }
}
