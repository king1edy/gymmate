// lib/websocket/server.ts
// Real-time WebSocket server for live updates

import { Server } from 'socket.io';
import { getSession } from 'next-auth/react';
import type { NextApiRequest } from 'next';
import { GymmateSocket } from '@/types';

export function initializeWebSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL,
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
      const gymmateSocket = socket as GymmateSocket;
    try {
      const session = await getSession({ req: socket.request as NextApiRequest });
      if (session?.user) {
        gymmateSocket.userId = session.user.id as string;
        gymmateSocket.gymId = session.user.gymId;
        gymmateSocket.role = session.user.role;
        next();
      } else {
        next(new Error('Authentication error'));
      }
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const gymmateSocket = socket as GymmateSocket;
    console.log(`User ${gymmateSocket.userId} connected`);

    // Join gym-specific room
    socket.join(`gym:${gymmateSocket.gymId}`);

    // Join role-specific room
    socket.join(`${gymmateSocket.gymId}:${gymmateSocket.role}`);

    // Handle class booking updates
    socket.on('class:book', (data) => {
      socket.to(`gym:${gymmateSocket.gymId}`).emit('class:updated', {
        classScheduleId: data.classScheduleId,
        bookedCount: data.newBookedCount,
        timestamp: new Date(),
      });
    });

    // Handle equipment status updates
    socket.on('equipment:update', (data) => {
      if (gymmateSocket.role === 'admin' || gymmateSocket.role === 'staff') {
        socket.to(`gym:${gymmateSocket.gymId}`).emit('equipment:status_changed', {
          equipmentId: data.equipmentId,
          status: data.status,
          timestamp: new Date(),
        });
      }
    });

    // Handle trainer availability updates
    socket.on('trainer:availability', (data) => {
      if (gymmateSocket.role === 'trainer' || gymmateSocket.role === 'admin') {
        socket.to(`gym:${gymmateSocket.gymId}`).emit('trainer:availability_updated', {
          trainerId: data.trainerId,
          availability: data.availability,
          timestamp: new Date(),
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${gymmateSocket.userId} disconnected`);
    });
  });

  return io;
}