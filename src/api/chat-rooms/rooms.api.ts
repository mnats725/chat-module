import { mapApiRoom } from '../../utils/map-api-room.utils';
import { unwrapArrayResponse } from '../../utils/unwrap-array-response.utils';

import type { Room } from '../../types/room.types.js';
import type {
  CreateRoomPayload,
  GetRoomsParams,
  BackendGetRoomsResponse,
  BackendCreateRoomResponse,
  Pagination,
} from './room.api.types';

const BASE_URL = process.env.BACKEND_URL!;

export type RoomsList = {
  items: Room[];
  pagination: Pagination;
};

export const getRooms = async ({ page, limit }: GetRoomsParams): Promise<RoomsList> => {
  const res = await fetch(`${BASE_URL}/api/chat/rooms?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`getRooms failed: ${res.status} ${res.statusText}`);

  const json: BackendGetRoomsResponse = await res.json();
  if (json.status !== 'success' || !json.data) throw new Error(json.message ?? 'getRooms error');

  return {
    items: json.data.data.map(mapApiRoom),
    pagination: json.data.pagination,
  };
};

export const createRoom = async (payload: CreateRoomPayload): Promise<Room> => {
  const res = await fetch(`${BASE_URL}/api/chat/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`createRoom failed: ${res.status} ${res.statusText}`);

  const json: BackendCreateRoomResponse = await res.json();
  if (json.status !== 'success') {
    throw new Error(json.message ?? 'createRoom error');
  }

  return mapApiRoom(unwrapArrayResponse(json.data, 'createRoom'));
};

export const archiveRoom = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/api/chat/rooms/${id}/archive`, { method: 'PUT' });
  if (!res.ok) throw new Error(`archiveRoom failed: ${res.status} ${res.statusText}`);
};

export const unarchiveRoom = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/api/chat/rooms/${id}/unarchive`, { method: 'PUT' });
  if (!res.ok) throw new Error(`unarchiveRoom failed: ${res.status} ${res.statusText}`);
};

export const lockRoom = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/api/chat/rooms/${id}/lock`, { method: 'PUT' });
  if (!res.ok) throw new Error(`lockRoom failed: ${res.status} ${res.statusText}`);
};

export const unlockRoom = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/api/chat/rooms/${id}/unlock`, { method: 'PUT' });
  if (!res.ok) throw new Error(`unlockRoom failed: ${res.status} ${res.statusText}`);
};
