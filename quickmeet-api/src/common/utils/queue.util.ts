/**
 * Calculates the next queue position given a list of existing active positions.
 * @param existingPositions Array of active queue positions
 * @returns The next queue position (max + 1, or 1 if empty)
 */
export const calculateQueuePosition = (existingPositions: number[]): number => {
  if (!existingPositions || existingPositions.length === 0) {
    return 1;
  }
  return Math.max(...existingPositions) + 1;
};

/**
 * Compacts queue positions when a booking is removed.
 * Decrements the position by 1 for all bookings with a position greater than the removed position.
 * @param bookings Array of active bookings with their current queue positions
 * @param removedPosition The position that was removed
 * @returns Array of booking IDs and their new compacted positions
 */
export const compactQueuePositions = (
  bookings: { id: string; queuePosition: number }[],
  removedPosition: number,
): { bookingId: string; newPosition: number }[] => {
  return bookings
    .filter((b) => b.queuePosition > removedPosition)
    .map((b) => ({
      bookingId: b.id,
      newPosition: b.queuePosition - 1,
    }));
};
