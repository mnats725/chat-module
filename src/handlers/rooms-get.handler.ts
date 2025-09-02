import { getRooms } from '../api/chat-rooms/rooms.api';

import type { GetRoomsParams } from '../api/chat-rooms/room.api.types';
import type { Socket } from 'socket.io';

export const handleRoomsGet = (socket: Socket) => {
  socket.on('rooms:get', async (params: GetRoomsParams) => {
    try {
      const { items } = await getRooms(params);
      socket.emit('rooms:list', items);
    } catch (e) {
      console.error('rooms:get error', e);
    }
  });
};
