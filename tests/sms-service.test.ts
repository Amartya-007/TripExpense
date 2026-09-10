import { describe, expect, it, vi } from 'vitest';

import { SmsDeliveryError } from '@/server/sms/errors';
import { ConsoleSmsProvider } from '@/server/sms/providers/console-provider';
import { VendelSmsProvider } from '@/server/sms/providers/vendel-provider';

describe('SMS Providers', () => {
  describe('ConsoleSmsProvider', () => {
    it('logs OTP in development console mode without errors', async () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const provider = new ConsoleSmsProvider();

      await provider.sendOtp({ recipient: '+919876543210', code: '123456' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('123456'),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('VendelSmsProvider', () => {
    const validConfig = {
      url: 'http://localhost:8090',
      apiKey: 'test-api-key',
    };

    it('rejects invalid recipient format with SmsDeliveryError', async () => {
      const provider = new VendelSmsProvider(validConfig);

      await expect(
        provider.sendOtp({ recipient: '9876543210', code: '123456' }),
      ).rejects.toThrow(SmsDeliveryError);

      await expect(
        provider.sendOtp({ recipient: 'not-a-number', code: '123456' }),
      ).rejects.toThrow('Invalid recipient phone number format');
    });

    it('sends POST /api/sms/send with X-API-Key and correct JSON payload', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'accepted' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const provider = new VendelSmsProvider(validConfig);
      await provider.sendOtp({ recipient: '+919876543210', code: '654321' });

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8090/api/sms/send',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key',
          },
          body: JSON.stringify({
            recipients: ['+919876543210'],
            body: 'Your TripExpense verification code is 654321. This code expires in 5 minutes.',
          }),
        }),
      );

      fetchSpy.mockRestore();
    });

    it('throws SmsDeliveryError with message when Vendel returns non-2xx status', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'unauthorized', message: 'Authentication required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const provider = new VendelSmsProvider(validConfig);

      await expect(
        provider.sendOtp({ recipient: '+919876543210', code: '123456' }),
      ).rejects.toThrow('Authentication required');

      fetchSpy.mockRestore();
    });

    it('throws SmsDeliveryError when network connection fails', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new Error('ECONNREFUSED'),
      );

      const provider = new VendelSmsProvider(validConfig);

      await expect(
        provider.sendOtp({ recipient: '+919876543210', code: '123456' }),
      ).rejects.toThrow(SmsDeliveryError);

      fetchSpy.mockRestore();
    });
  });
});
