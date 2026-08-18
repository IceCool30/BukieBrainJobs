import { describe, it, expect } from 'vitest';
import { NigerianPhoneRegex, RegisterClientSchema } from './userSchemas';

describe('User Validation Schemas', () => {
  it('validates correct Nigerian phone regex (+234 format)', () => {
    expect(NigerianPhoneRegex.test('+2348012345678')).toBe(true);
    expect(NigerianPhoneRegex.test('+2347098765432')).toBe(true);
    expect(NigerianPhoneRegex.test('+2349011223344')).toBe(true);
  });

  it('rejects invalid Nigerian phone formats', () => {
    expect(NigerianPhoneRegex.test('08012345678')).toBe(false); // needs country code in regex
    expect(NigerianPhoneRegex.test('+1234567890')).toBe(false);
    expect(NigerianPhoneRegex.test('invalid-phone')).toBe(false);
  });

  it('validates client registration payload', () => {
    const validClient = {
      firstName: 'Bukola',
      lastName: 'Adebayo',
      phone: '+2348012345678',
      password: 'StrongPassword123',
    };
    const result = RegisterClientSchema.safeParse(validClient);
    expect(result.success).toBe(true);
  });

  it('rejects short passwords and missing names', () => {
    const invalidClient = {
      firstName: 'B',
      lastName: '',
      phone: '+2348012345678',
      password: 'weak',
    };
    const result = RegisterClientSchema.safeParse(invalidClient);
    expect(result.success).toBe(false);
  });
});
