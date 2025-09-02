import type { Socket } from 'socket.io';

export type HandleDisconnectParams = {
  socket: Socket;
  userId: number;
  userSockets: Map<number, Set<string>>;
};

export const handleDisconnect = ({ socket, userId, userSockets }: HandleDisconnectParams) => {
  socket.on('disconnect', () => {
    const set = userSockets.get(userId);

    if (set) {
      set.delete(socket.id);
      if (set.size === 0) {
        userSockets.delete(userId);
      }
    }
  });
};
