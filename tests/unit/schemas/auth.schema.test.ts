import { describe, it, expect } from 'vitest';
import { registerSchema } from '@application/schemas/auth';

const validInput = {
  name: 'Test User',
  email: 'user@test.com',
  password: 'Secure@9mB',
  phone: null,
};

describe('registerSchema', () => {
  describe('password', () => {
    it('should accept a valid strong password', () => {
      expect(() => registerSchema.parse(validInput)).not.toThrow();
    });

    it('should reject password shorter than 8 characters', () => {
      expect(() => registerSchema.parse({ ...validInput, password: 'Ab@1' })).toThrow();
    });

    it('should reject password without uppercase letter', () => {
      expect(() => registerSchema.parse({ ...validInput, password: 'secret@123' })).toThrow();
    });

    it('should reject password without lowercase letter', () => {
      expect(() => registerSchema.parse({ ...validInput, password: 'SECRET@123' })).toThrow();
    });

    it('should reject password without number', () => {
      expect(() => registerSchema.parse({ ...validInput, password: 'Secret@abc' })).toThrow();
    });

    it('should reject password without special character', () => {
      expect(() => registerSchema.parse({ ...validInput, password: 'Secret1234' })).toThrow();
    });

    it('should reject password with 4 or more repeated characters', () => {
      expect(() => registerSchema.parse({ ...validInput, password: 'AAAASecret@1' })).toThrow();
    });

    it('should reject password with sequential characters', () => {
      expect(() => registerSchema.parse({ ...validInput, password: 'Abc@12345' })).toThrow();
    });
  });
});
