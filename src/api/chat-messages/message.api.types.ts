import type { ApiResponse } from '../../types/api.types';

export type CreateMessagePayload = {
  roomId: number;
  body: string;
  title: string;
};

export type GetMessagesParams = {
  id: number;
  page: number;
  limit: number;
};

export type ApiMessage = {
  id: number;
  room_id: number;
  sender_id: number;
  body: string;
  title: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Pagination = {
  perPage: number;
  currentPage: number;
  from: number;
  to: number;
  total: number;
  lastPage: number;
  prevPage: number | null;
  nextPage: number | null;
};

export type BackendGetMessagesResponse = ApiResponse<{
  data: ApiMessage[];
  pagination: Pagination;
}>;

export type BackendCreateMessageResponse = ApiResponse<ApiMessage[]>;
