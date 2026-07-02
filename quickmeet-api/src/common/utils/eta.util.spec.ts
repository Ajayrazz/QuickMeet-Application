import { calculateETA } from './eta.util';

describe('ETA Utilities', () => {
  describe('calculateETA', () => {
    it('should return 0 when position is 1', () => {
      expect(calculateETA(1, 15)).toBe(0);
    });

    it('should return 0 when position is less than 1', () => {
      expect(calculateETA(0, 15)).toBe(0);
      expect(calculateETA(-5, 15)).toBe(0);
    });

    it('should accurately calculate ETA for positions > 1', () => {
      expect(calculateETA(2, 15)).toBe(15);
      expect(calculateETA(3, 10)).toBe(20);
      expect(calculateETA(5, 5)).toBe(20);
    });
  });
});
