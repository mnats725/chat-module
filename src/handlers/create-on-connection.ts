import { handleRoomJoin } from './room-join.handler';
import { handleRoomLeave } from './room-leave.handler';
import { handleMessageSend } from './message-send.handler';
import { handleDisconnect } from './disconnect.handler';
import { handleRoomsGet } from './rooms-get.handler';
import { handleRoomCreate } from './room-create.handler';

import type { Server as IOServer, Socket } from 'socket.io';
import type { SocketUser, ChatSocketData } from '../types/chat.types';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
} from '../events/chat-socket-module.events';

type AppIO = IOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, ChatSocketData>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, ChatSocketData>;

export type OnConnectionContext = {
  io: AppIO;
  userSockets: Map<number, Set<string>>;
  roomName: (roomId: number | string) => string;
};

export const createOnConnection =
  ({ io, userSockets, roomName }: OnConnectionContext) =>
  (socket: AppSocket) => {
    const user = socket.data.user as SocketUser | undefined;
    const userId = user?.id;

    if (typeof userId !== 'number') {
      socket.emit('error', 'Unauthorized');
      socket.disconnect(true);
      return;
    }

    const set = userSockets.get(userId) ?? new Set<string>();
    set.add(socket.id);
    userSockets.set(userId, set);

    socket.emit('auth:ok', { userId, username: user?.username || null });

    handleRoomsGet(socket);
    handleRoomCreate({ io })(socket);

    handleRoomJoin({ socket, userId, roomName });
    handleRoomLeave({ socket, userId, roomName });
    handleMessageSend({ socket, userId, io, roomName });

    handleDisconnect({ socket, userId, userSockets });
  };
