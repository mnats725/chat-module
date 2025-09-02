import { createMessage } from '../api/chat-messages/messages.api';
import { mapMessageToSocket } from '../utils/map-message-to-socket.utils';

import type { Server as IOServer, Socket } from 'socket.io';
import type { ChatSocketData, SocketUser } from '../types/chat.types';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
} from '../events/chat-socket-module.events';
import type { CreateMessagePayload } from '../api/chat-messages/message.api.types';
import type { Message } from '../types/message.types';

type SocketMessageSendPayload = {
  roomId: number | string;
  text: string;
  title?: string;
};

export type HandleMessageSendParams = {
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, ChatSocketData>;
  userId: number;
  io: IOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, ChatSocketData>;
  roomName: (roomId: string | number) => string;
};

export const handleMessageSend = ({ socket, userId, io, roomName }: HandleMessageSendParams): void => {
  socket.on('message:send', async (incoming: SocketMessageSendPayload | CreateMessagePayload) => {
    try {
      const roomIdAny = 'roomId' in incoming ? incoming.roomId : (incoming as any).roomId;
      const roomId = typeof roomIdAny === 'string' ? Number(roomIdAny) : roomIdAny;
      if (Number.isNaN(roomId)) throw new Error('Invalid roomId');

      const body = 'body' in incoming ? incoming.body : (incoming as SocketMessageSendPayload).text;
      if (typeof body !== 'string' || body.trim().length === 0) {
        throw new Error('Message body is empty');
      }

      const user: SocketUser | undefined = socket.data.user;
      const providedTitle = (incoming as any).title;

      const title =
        typeof providedTitle === 'string' && providedTitle.trim().length > 0
          ? providedTitle.trim()
          : user?.username ?? `user#${userId}`;

      const apiPayload: CreateMessagePayload = { roomId, body, title };

      const authToken = socket.data.authToken;
      const created: Message = await createMessage(apiPayload, authToken);

      io.to(roomName(roomId)).emit('message:new', mapMessageToSocket(created));
    } catch (err) {
      console.error('message:send error:', err);
      socket.emit('error', 'Не удалось отправить сообщение');
    }
  });
};
