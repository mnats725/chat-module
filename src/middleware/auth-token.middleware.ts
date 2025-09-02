import type { Socket } from 'socket.io';
import type { ChatSocketData } from '../types/chat.types';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
} from '../events/chat-socket-module.events';

export const authTokenMiddleware = (
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, ChatSocketData>,
  next: (error?: Error) => void
): void => {
  try {
    const authPayload = socket.handshake.auth as Record<string, unknown> | undefined;
    const tokenFromAuthPayload = typeof authPayload?.token === 'string' ? authPayload.token : undefined;

    const authorizationHeader = (socket.handshake.headers?.authorization as string | undefined) ?? '';
    const tokenFromHeader = authorizationHeader.startsWith('Bearer ') ? authorizationHeader.slice(7) : undefined;

    socket.data.authToken = tokenFromAuthPayload ?? tokenFromHeader;
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error('authTokenMiddleware failed'));
  }
};
