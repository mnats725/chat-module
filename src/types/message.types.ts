export type Message = {
  id: number;
  roomId: number;
  senderId: number;
  body: string;
  title: string;
  isRead: boolean;
  createdAt: Date;
  deletedAt?: Date | null;
};
