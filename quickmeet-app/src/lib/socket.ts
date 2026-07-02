import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000';

export const queueSocket: Socket = io(`${WS_URL}/queue`, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export const connectQueueSocket = (token: string) => {
  if (queueSocket.connected) {
    queueSocket.disconnect();
  }
  queueSocket.auth = { token };
  queueSocket.connect();
};

export const disconnectQueueSocket = () => {
  if (queueSocket.connected) {
    queueSocket.disconnect();
  }
};
