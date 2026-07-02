import { useEffect, useState, useRef } from 'react';
import { queueSocket, connectQueueSocket } from '../lib/socket';
import { useAuthStore } from '../stores/auth.store';
import * as Haptics from 'expo-haptics';

export interface QueueData {
  userId: string;
  position: number;
  etaMinutes: number;
}

export function useQueueSocket(slotId: string, initialSnapshot?: QueueData[]) {
  const { user, accessToken } = useAuthStore();
  const [isConnected, setIsConnected] = useState(queueSocket.connected);
  const [fullQueue, setFullQueue] = useState<QueueData[]>(initialSnapshot || []);
  const [isYourTurn, setIsYourTurn] = useState(false);

  const prevToken = useRef(accessToken);

  useEffect(() => {
    // If initial snapshot is provided and we aren't connected yet, pre-fill it.
    if (initialSnapshot && initialSnapshot.length > 0 && fullQueue.length === 0) {
      setFullQueue(initialSnapshot);
    }
  }, [initialSnapshot]);

  useEffect(() => {
    // If token changes, reconnect
    if (accessToken && accessToken !== prevToken.current) {
      connectQueueSocket(accessToken);
      prevToken.current = accessToken;
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    if (!queueSocket.connected) {
      connectQueueSocket(accessToken);
    } else {
      setIsConnected(true);
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    queueSocket.on('connect', onConnect);
    queueSocket.on('disconnect', onDisconnect);

    // Join room
    queueSocket.emit('join:slot', { slotId });

    const onQueueUpdate = (data: { snapshot: QueueData[] }) => {
      setFullQueue(data.snapshot);
    };

    const onYourTurn = () => {
      setIsYourTurn(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    queueSocket.on('queue:update', onQueueUpdate);
    queueSocket.on('queue:your-turn', onYourTurn);

    return () => {
      queueSocket.emit('leave:slot', { slotId });
      queueSocket.off('connect', onConnect);
      queueSocket.off('disconnect', onDisconnect);
      queueSocket.off('queue:update', onQueueUpdate);
      queueSocket.off('queue:your-turn', onYourTurn);
    };
  }, [slotId, accessToken]);

  const myData = fullQueue.find((q) => q.userId === user?.id);
  const position = myData?.position ?? null;
  const eta = myData?.etaMinutes ?? 0;

  return { isConnected, fullQueue, position, eta, isYourTurn };
}
