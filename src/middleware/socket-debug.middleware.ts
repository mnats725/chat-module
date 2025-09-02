import type { Server, Socket } from 'socket.io';

type Options = {
  handshake?: boolean;
  engine?: boolean;
  onAny?: boolean;
  truncateArgsAt?: number;
};

export function attachSocketDebug(io: Server, opts: Options = {}): void {
  const { handshake = true, engine = true, onAny = false, truncateArgsAt = 500 } = opts;

  if (handshake) {
    io.use((socket, next) => {
      try {
        console.log('[auth] handshake.auth:', socket.handshake?.auth);
        console.log('[auth] headers.authorization:', socket.handshake?.headers?.authorization);
        console.log('[auth] query.token:', socket.handshake?.query?.token);
      } catch (e) {
        console.warn('[debug] handshake log failed:', (e as Error).message);
      }
      next();
    });
  }

  if (onAny) {
    io.on('connection', (socket: Socket) => {
      socket.onAny((event, ...args) => {
        let preview: string;
        try {
          preview = JSON.stringify(args).slice(0, truncateArgsAt);
        } catch {
          preview = '[unserializable args]';
        }
        console.log(`[socket:${socket.id}] onAny ->`, event, preview);
      });
      socket.on('error', (err) => console.error(`[socket:${socket.id}] error:`, err));
      socket.on('disconnect', (reason) => console.log(`[socket:${socket.id}] disconnect:`, reason));
    });
  }

  if (engine) {
    io.engine.on('connection_error', (err: any) => {
      console.error('[engine] connection_error:', {
        code: err?.code,
        message: err?.message,
        context: err?.context,
      });
    });
  }
}
