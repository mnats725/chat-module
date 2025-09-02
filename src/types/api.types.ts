export type ApiSuccess<T> = { status: 'success'; data: T; message?: string };
export type ApiError = { status: 'error'; data: null; message: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
