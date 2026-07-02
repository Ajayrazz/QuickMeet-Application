export declare const calculateQueuePosition: (existingPositions: number[]) => number;
export declare const compactQueuePositions: (bookings: {
    id: string;
    queuePosition: number;
}[], removedPosition: number) => {
    bookingId: string;
    newPosition: number;
}[];
