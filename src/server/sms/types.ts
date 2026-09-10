export interface SendOtpParams {
  recipient: string;
  code: string;
}

export interface SmsProvider {
  readonly name: string;
  sendOtp(params: SendOtpParams): Promise<void>;
}
