import type { ApiRoom } from '../../api/chat-rooms/room.api.types';
import type { Room } from '../types/room.types';

export const mapApiRoom = (room: ApiRoom): Room => ({
  id: room.id,
  type: room.type,
  title: room.title,
  dmKey: room.dm_key,
  isArchived: room.is_archived,
  lockedByAdmin: room.locked_by_admin,
  createdAt: new Date(room.created_at),
  updatedAt: new Date(room.updated_at),
});
