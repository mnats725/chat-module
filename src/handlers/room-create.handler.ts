import { createRoom } from '../api/chat-rooms/rooms.api';

import type { Server as IOServer, Socket } from 'socket.io';
import type { CreateRoomPayload } from '../api/chat-rooms/room.api.types';

export type HandleRoomCreate = { io: IOServer };

export const handleRoomCreate =
  ({ io }: HandleRoomCreate) =>
  (socket: Socket) => {
    socket.on('room:create', async (payload: CreateRoomPayload) => {
      try {
        const room = await createRoom(payload);
        io.emit('room:created', room);
      } catch (e) {
        console.error('room:create error', e);
      }
    });
  };
