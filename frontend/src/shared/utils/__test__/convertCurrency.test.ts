import { describe, it, expect } from 'vitest';
import {
  convertCurrency,
  calculateDiscountPrice,
  calculateCheckoutTotalPrice,
} from '../convertCurrency';

describe('convertCurrency', () => {
  it('should format number to VND currency', () => {
    const result = convertCurrency(100000);
    expect(result).toContain('100.000');
  });

  it('should handle zero', () => {
    const result = convertCurrency(0);
    expect(result).toContain('0');
  });

  it('should handle large numbers', () => {
    const result = convertCurrency(10000000);
    expect(result).toContain('10.000.000');
  });
});

describe('calculateDiscountPrice', () => {
  it('should calculate correct discount amount', () => {
    const result = calculateDiscountPrice(100000, 10);
    expect(result).toBe(10000);
  });

  it('should return 0 when discount is 0', () => {
    const result = calculateDiscountPrice(100000, 0);
    expect(result).toBe(0);
  });

  it('should return full price when discount is 100', () => {
    const result = calculateDiscountPrice(100000, 100);
    expect(result).toBe(100000);
  });
});

describe('calculateCheckoutTotalPrice', () => {
  it('should calculate total with shipping fee minus discount', () => {
    const result = calculateCheckoutTotalPrice(100000, 20000, 10);
    expect(result).toBe(110000);
  });

  it('should return subtotal + shipping when no discount', () => {
    const result = calculateCheckoutTotalPrice(100000, 20000, 0);
    expect(result).toBe(120000);
  });

  it('should return 0 + shipping when subtotal is 0', () => {
    const result = calculateCheckoutTotalPrice(0, 20000, 10);
    expect(result).toBe(20000);
  });
});
