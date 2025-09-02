import type { Message } from '../types/message.types';

export const mapMessageToSocket = (msg: Message) => ({
  id: msg.id,
  roomId: msg.roomId,
  userId: msg.senderId,
  title: msg.title,
  text: msg.body,
  createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : new Date(msg.createdAt).toISOString(),
});
