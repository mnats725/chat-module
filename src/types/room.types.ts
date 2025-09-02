export type Room = {
  id: number;
  type: 'dm' | 'group';
  title?: string | null;
  dmKey?: string | null;
  isArchived: boolean;
  lockedByAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
};
