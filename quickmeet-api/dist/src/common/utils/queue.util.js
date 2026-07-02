"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compactQueuePositions = exports.calculateQueuePosition = void 0;
const calculateQueuePosition = (existingPositions) => {
    if (!existingPositions || existingPositions.length === 0) {
        return 1;
    }
    return Math.max(...existingPositions) + 1;
};
exports.calculateQueuePosition = calculateQueuePosition;
const compactQueuePositions = (bookings, removedPosition) => {
    return bookings
        .filter((b) => b.queuePosition > removedPosition)
        .map((b) => ({
        bookingId: b.id,
        newPosition: b.queuePosition - 1,
    }));
};
exports.compactQueuePositions = compactQueuePositions;
//# sourceMappingURL=queue.util.js.map