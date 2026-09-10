import { reportServerError } from '@/server/observability/server-error-reporter';
import { SmsDeliveryError } from '@/server/sms/errors';
import type { SendOtpParams, SmsProvider } from '@/server/sms/types';

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

type VendelProviderOptions = {
  url: string;
  apiKey: string;
  deviceId?: string;
};

export class VendelSmsProvider implements SmsProvider {
  readonly name = 'vendel';
  private readonly url: string;
  private readonly apiKey: string;
  private readonly deviceId?: string;

  constructor(options: VendelProviderOptions) {
    this.url = options.url.replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.deviceId = options.deviceId;
  }

  async sendOtp({ recipient, code }: SendOtpParams): Promise<void> {
    const trimmedRecipient = recipient.trim();

    if (!E164_REGEX.test(trimmedRecipient)) {
      throw new SmsDeliveryError('vendel', 'Invalid recipient phone number format. Must be E.164.');
    }

    const message = `Your TripExpense verification code is ${code}. This code expires in 5 minutes.`;

    const payload: {
      recipients: string[];
      body: string;
      device_id?: string;
    } = {
      recipients: [trimmedRecipient],
      body: message,
      ...(this.deviceId ? { device_id: this.deviceId } : {}),
    };

    let response: Response;

    try {
      response = await fetch(`${this.url}/api/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      reportServerError({ event: 'sms.delivery-failed', provider: 'vendel' });
      throw new SmsDeliveryError('vendel', 'Failed to reach Vendel SMS gateway');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null) as { error?: string; message?: string } | null;
      const errorDetail = errorData?.message || errorData?.error || 'Vendel SMS delivery rejected';

      reportServerError({
        event: 'sms.delivery-failed',
        provider: 'vendel',
        providerStatus: response.status,
      });

      throw new SmsDeliveryError('vendel', errorDetail, response.status);
    }
  }
}
