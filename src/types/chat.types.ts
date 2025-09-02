import type { Server as HttpServer } from 'http';

export type InitChatOptions = {
  httpServer: HttpServer;
  corsOrigins?: string[];
  backendUrl: string;
  authPath?: string;
  authTimeoutMs?: number;
  authHeaders?: Record<string, string>;
  ioPath?: string;
};

export type SocketUser = {
  id: number;
  username?: string;
  email?: string;
};

export type ChatSocketData = {
  user?: SocketUser;
  authToken?: string;
};

export type ChatServer = ReturnType<typeof import('../chat-module').initChatSockets>;
