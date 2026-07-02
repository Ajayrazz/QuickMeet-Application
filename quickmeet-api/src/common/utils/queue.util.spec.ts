import { calculateQueuePosition, compactQueuePositions } from './queue.util';

describe('Queue Utilities', () => {
  describe('calculateQueuePosition', () => {
    it('should return 1 when there are no existing positions', () => {
      expect(calculateQueuePosition([])).toBe(1);
    });

    it('should return max + 1 when there are existing positions', () => {
      expect(calculateQueuePosition([1, 2, 3])).toBe(4);
      expect(calculateQueuePosition([5])).toBe(6);
      expect(calculateQueuePosition([1, 4, 2])).toBe(5);
    });
  });

  describe('compactQueuePositions', () => {
    it('should decrement positions greater than the removed position', () => {
      const bookings = [
        { id: 'b1', queuePosition: 1 },
        { id: 'b2', queuePosition: 2 },
        { id: 'b3', queuePosition: 3 },
        { id: 'b4', queuePosition: 4 },
      ];

      const compacted = compactQueuePositions(bookings, 2);

      expect(compacted).toEqual([
        { bookingId: 'b3', newPosition: 2 },
        { bookingId: 'b4', newPosition: 3 },
      ]);
    });

    it('should return empty array if no positions were greater than removed position', () => {
      const bookings = [
        { id: 'b1', queuePosition: 1 },
        { id: 'b2', queuePosition: 2 },
      ];

      const compacted = compactQueuePositions(bookings, 2);

      expect(compacted).toEqual([]);
    });

    it('should return empty array if there are no bookings', () => {
      expect(compactQueuePositions([], 1)).toEqual([]);
    });
  });
});
