import { Server } from 'socket.io';

import { fetchCurrentUser } from './api/auth/current-user.service';

import { createOnConnection } from './handlers/create-on-connection';

import { authTokenMiddleware } from './middleware/auth-token.middleware';
import { attachSocketDebug } from './middleware/socket-debug.middleware';

import { extractToken } from './utils/auth.utils';
import { roomName } from './utils/room-name.utils';

import type { InitChatOptions, SocketUser } from './types/chat.types';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents } from './events/chat-socket-module.events';

export const initChatSockets = ({
  httpServer,
  corsOrigins = ['http://localhost:5173'],
  backendUrl,
  authTimeoutMs = 3000,
  authHeaders,
  ioPath = '/socket.io',
}: InitChatOptions & {
  backendUrl: string;
  authTimeoutMs?: number;
  authHeaders?: Record<string, string>;
  ioPath?: string;
}) => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    { user?: SocketUser; authToken?: string }
  >(httpServer, {
    cors: { origin: corsOrigins },
    path: ioPath,
  });

  const userSockets = new Map<number, Set<string>>();

  if (process.env.NODE_ENV !== 'production' || process.env.SOCKET_DEBUG === '1') {
    attachSocketDebug(io, {
      handshake: true,
      engine: true,
      onAny: false,
      truncateArgsAt: 500,
    });
  }

  io.use(authTokenMiddleware);

  io.use(async (socket, next) => {
    try {
      const token = socket.data.authToken || extractToken(socket);
      if (!token) return next(new Error('No token provided'));

      const user = await fetchCurrentUser(token, {
        backendUrl: backendUrl,
        timeoutMs: authTimeoutMs,
        extraHeaders: authHeaders,
      });

      socket.data.user = { id: user.id, username: user.username, email: user.email };
      next();
    } catch (error) {
      console.error('[socket] auth failed:', (error as Error).message || error);
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', createOnConnection({ io, userSockets, roomName }));

  return { io, userSockets };
};
