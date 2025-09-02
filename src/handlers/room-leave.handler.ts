import type { Socket } from 'socket.io';

export type HandleRoomLeaveParams = {
  socket: Socket;
  userId: number;
  roomName: (roomId: string | number) => string;
};

export const handleRoomLeave = ({ socket, userId, roomName }: HandleRoomLeaveParams) => {
  socket.on('room:leave', ({ roomId }) => {
    const room = roomName(roomId);

    socket.leave(room);
    socket.to(room).emit('room:user-left', { roomId, userId, socketId: socket.id });
    socket.emit('room:left', { roomId });
  });
};
