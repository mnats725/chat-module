import type { ApiResponse } from '../../types/api.types';

export type CreateRoomPayload = {
  second_id: number;
  title: string;
  type: 'dm' | 'group';
};

export type GetRoomsParams = {
  page: number;
  limit: number;
};

export type ApiRoom = {
  id: number;
  type: 'dm' | 'group';
  title: string | null;
  dm_key: string | null;
  is_archived: boolean;
  locked_by_admin: boolean;
  created_at: string;
  updated_at: string;
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

export type BackendGetRoomsResponse = ApiResponse<{
  data: ApiRoom[];
  pagination: Pagination;
}>;

export type BackendCreateRoomResponse = ApiResponse<ApiRoom[]>;
