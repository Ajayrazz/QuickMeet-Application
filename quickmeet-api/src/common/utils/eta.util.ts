/**
 * Calculates the estimated wait time (ETA) based on queue position and average service duration.
 * @param position The user's current position in the queue
 * @param avgServiceDurationMinutes The average time to serve one user
 * @returns The estimated wait time in minutes
 */
export const calculateETA = (
  position: number,
  avgServiceDurationMinutes: number,
): number => {
  if (position <= 1) {
    return 0; // If you are first or not in queue, wait time is roughly 0 (it's your turn)
  }
  // ETA is calculated for all the people *ahead* of you in the queue.
  return (position - 1) * avgServiceDurationMinutes;
};
