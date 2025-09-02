import { getMessages } from '../api/chat-messages/messages.api';

import type { Socket } from 'socket.io';
import type { ChatSocketData } from '../types/chat.types';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
} from '../events/chat-socket-module.events';
import type { Message } from '../types/message.types';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, ChatSocketData>;

export type HandleRoomJoinParams = {
  socket: AppSocket;
  userId: number;
  roomName: (roomId: string | number) => string;
};

export const handleRoomJoin = ({ socket, userId, roomName }: HandleRoomJoinParams): void => {
  socket.on('room:join', async ({ roomId }: { roomId: string | number }) => {
    try {
      const numericRoomId = typeof roomId === 'string' ? Number(roomId) : roomId;
      if (Number.isNaN(numericRoomId)) throw new Error('Invalid roomId');

      const room = roomName(numericRoomId);

      socket.join(room);
      socket.to(room).emit('room:user-joined', { roomId: numericRoomId, userId, socketId: socket.id });
      socket.emit('room:joined', { roomId: numericRoomId });

      const authToken = socket.data.authToken;

      const { items } = await getMessages({ id: numericRoomId, page: 1, limit: 50 }, authToken);

      socket.emit('messages', items as Message[]);
    } catch (err) {
      console.error('room:join error:', err);
      socket.emit('error', 'Не удалось подключиться к комнате');
    }
  });
};
