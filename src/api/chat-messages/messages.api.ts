import { mapApiMessage } from '../../utils/map-api-message.utils';
import { unwrapArrayResponse } from '../../utils/unwrap-array-response.utils';

import type { Message } from '../../types/message.types';
import type {
  CreateMessagePayload,
  GetMessagesParams,
  BackendGetMessagesResponse,
  BackendCreateMessageResponse,
  Pagination,
} from './message.api.types';

const BASE_URL = process.env.BACKEND_URL!;

export type MessagesList = {
  items: Message[];
  pagination: Pagination;
};

export const getMessages = async (
  { id, page, limit }: GetMessagesParams,
  authToken?: string
): Promise<MessagesList> => {
  const res = await fetch(`${BASE_URL}/api/chat/messages/${id}/messages?page=${page}&limit=${limit}`, {
    headers: {
      Accept: 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });
  if (!res.ok) {
    const errText = await safeReadError(res);
    throw new Error(`getMessages failed: ${res.status} ${res.statusText} :: ${errText}`);
  }

  const json: BackendGetMessagesResponse = await res.json();
  if (json.status !== 'success' || !json.data) throw new Error(json.message || 'getMessages error');

  const items = json.data.data.map(mapApiMessage);
  return { items, pagination: json.data.pagination };
};

export const createMessage = async (payload: CreateMessagePayload, authToken?: string): Promise<Message> => {
  const cleanPayload = stripEmpty({
    roomId: payload.roomId,
    body: payload.body,
    title: payload.title,
  });

  const res = await fetch(`${BASE_URL}/api/chat/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(cleanPayload),
  });

  if (!res.ok) {
    const errText = await safeReadError(res);
    throw new Error(`createMessage failed: ${res.status} ${res.statusText} :: ${errText}`);
  }

  const json: BackendCreateMessageResponse = await res.json();
  if (json.status !== 'success') {
    const extra = typeof json.message === 'string' ? ` :: ${json.message}` : '';
    throw new Error('createMessage error' + extra);
  }

  return mapApiMessage(unwrapArrayResponse(json.data, 'createMessage'));
};

async function safeReadError(res: Response): Promise<string> {
  try {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const j = await res.json();
      return JSON.stringify(j);
    }
    return await res.text();
  } catch {
    return '<no body>';
  }
}

function stripEmpty<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    out[k] = v;
  }
  return out as Partial<T>;
}
