import type { Socket } from 'socket.io';

export const extractToken = (socket: Socket): string | null => {
  const token =
    (socket.handshake.auth?.token as string | undefined) ||
    (socket.handshake.query?.token as string | undefined) ||
    parseAuthHeader(socket);

  return token || null;
};

const parseAuthHeader = (socket: Socket): string | null => {
  const hdr = socket.handshake.headers?.authorization;

  if (!hdr) return null;

  const [type, token] = hdr.split(' ');

  return type?.toLowerCase() === 'bearer' && token ? token : null;
};
