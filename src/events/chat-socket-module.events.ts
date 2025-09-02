import type { Message } from '../types/message.types';

export type ServerToClientEvents = {
  'auth:ok': (data: { userId: number; username: string | null }) => void;
  'room:user-joined': (data: { roomId: number | string; userId: number; socketId: string }) => void;
  'room:user-left': (data: { roomId: number | string; userId: number; socketId: string }) => void;
  'room:joined': (data: { roomId: number | string }) => void;
  'room:left': (data: { roomId: number | string }) => void;
  'message:new': (msg: {
    id: number;
    roomId: number | string;
    userId: number;
    title: string | null;
    text: string;
    createdAt: string;
  }) => void;
  error: (message: string) => void;
  messages: (items: Message[]) => void;
};

export type ClientToServerEvents = {
  'room:join': (data: { roomId: number | string }) => void;
  'room:leave': (data: { roomId: number | string }) => void;
  'message:send': (payload: { roomId: number | string; title?: string; text: string }) => void;
};

export type InterServerEvents = {};
export type SocketData = { user?: { id: number; username?: string; email?: string } };
