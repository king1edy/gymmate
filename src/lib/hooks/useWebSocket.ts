// lib/hooks/useWebSocket.ts
// React hook for WebSocket connections

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';
import { UseWebSocketOptions } from '@/types';


export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (session?.user) {
      // Initialize socket connection
      socketRef.current = io({
        path: '/api/socket',
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      // Set up event listeners
      if (options.onClassUpdated) {
        socket.on('class:updated', options.onClassUpdated);
      }

      if (options.onEquipmentStatusChanged) {
        socket.on('equipment:status_changed', options.onEquipmentStatusChanged);
      }

      if (options.onTrainerAvailabilityUpdated) {
        socket.on('trainer:availability_updated', options.onTrainerAvailabilityUpdated);
      }

      return () => {
        socket.disconnect();
      };
    }
  }, [session]);

  const emit = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    isConnected,
    emit,
  };
}