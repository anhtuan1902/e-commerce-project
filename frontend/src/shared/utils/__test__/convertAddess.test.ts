import { describe, it, expect } from 'vitest';
import convertAddress from '../convertAddess';

describe('convertAddress', () => {
  it('should combine address parts correctly', () => {
    const result = convertAddress('123 Nguyen Trai', 'Ward 1', 'Ho Chi Minh City');
    expect(result).toBe('123 Nguyen Trai, Ward 1, Ho Chi Minh City');
  });

  it('should handle short address parts', () => {
    const result = convertAddress('1A', 'P.5', 'HN');
    expect(result).toBe('1A, P.5, HN');
  });

  it('should handle empty strings', () => {
    const result = convertAddress('', '', '');
    expect(result).toBe(', , ');
  });
});
