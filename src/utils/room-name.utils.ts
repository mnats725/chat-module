import { ROOM_PREFIX } from '../constants/room.constants.js';

export const roomName = (roomId: number | string): string => `${ROOM_PREFIX}${roomId}`;
