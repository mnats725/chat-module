import 'dotenv/config';
import express from 'express';
import http from 'http';

import { initChatSockets } from './chat-module';

function parseCsv(input?: string, fallback: string[] = []) {
  return (input || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .concat(input ? [] : fallback);
}

const CHAT_PORT = Number(process.env.CHAT_PORT ?? 3001);
const IO_PATH = process.env.IO_PATH || '/socket.io';
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3000';
const AUTH_TIMEOUT_MS = Number(process.env.AUTH_TIMEOUT_MS ?? 3000);
const AUTH_HEADERS = process.env.AUTH_HEADERS ? JSON.parse(process.env.AUTH_HEADERS) : undefined;
const CORS_ORIGINS = parseCsv(process.env.CORS_ORIGINS, ['http://localhost:5173', 'http://127.0.0.1:5173']);

const app = express();
app.get('/health', (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);

const { io } = initChatSockets({
  httpServer: server,
  corsOrigins: CORS_ORIGINS,
  backendUrl: BACKEND_URL,
  authTimeoutMs: AUTH_TIMEOUT_MS,
  authHeaders: AUTH_HEADERS,
  ioPath: IO_PATH,
});

server.listen(CHAT_PORT, '0.0.0.0', () => {
  console.log(`[chat] http://0.0.0.0:${CHAT_PORT} (path=${IO_PATH})`);
});

process.on('SIGINT', () => io.close(() => server.close(() => process.exit(0))));
process.on('SIGTERM', () => io.close(() => server.close(() => process.exit(0))));
