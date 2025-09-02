import type { ApiMessage } from '../../api/chat-messages/message.api.types';
import type { Message } from '../types/message.types';

export const mapApiMessage = (message: ApiMessage): Message => ({
  id: message.id,
  roomId: message.room_id,
  senderId: message.sender_id,
  body: message.body,
  title: message.title,
  isRead: message.is_read,
  createdAt: new Date(message.created_at),
  deletedAt: message.deleted_at ? new Date(message.deleted_at) : null,
});
