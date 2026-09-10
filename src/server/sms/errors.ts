export class SmsDeliveryError extends Error {
  readonly provider: string;
  readonly status?: number;

  constructor(provider: string, message: string, status?: number) {
    super(message);
    this.name = 'SmsDeliveryError';
    this.provider = provider;
    this.status = status;
  }
}
