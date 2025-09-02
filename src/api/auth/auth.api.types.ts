export type CurrentUser = {
  id: number;
  username?: string;
  email?: string;
};

export type FetchCurrentOptions = {
  backendUrl: string;
  timeoutMs?: number;
  extraHeaders?: Record<string, string>;
};

export type BackendCurrentResponse = {
  status: 'success' | 'error';
  message: unknown;
  data?: {
    user?: {
      id?: number;
      username?: string;
      email?: string;
    };
  };
};
